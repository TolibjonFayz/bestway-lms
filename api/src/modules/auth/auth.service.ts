import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { createHash, randomUUID } from 'node:crypto';
import { Op } from 'sequelize';
import { JwtPayload, RefreshPayload } from '@/common/types';
import { RefreshToken, User } from '@/database/models';
import { PublicUser, toPublicUser } from '../users/user.serializer';
import { UsersService } from '../users/users.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Seconds until the access token expires — saves the client decoding it. */
  expiresIn: number;
}

export interface AuthSession extends AuthTokens {
  user: PublicUser;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(RefreshToken) private readonly refreshTokens: typeof RefreshToken,
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(
    phone: string,
    password: string,
    userAgent?: string,
  ): Promise<AuthSession> {
    const user = await this.users.findByPhone(phone);

    /* One message for "no such phone" and "wrong password" so the endpoint
       cannot be used to enumerate who has an account. */
    const invalid = new UnauthorizedException(
      'Telefon raqami yoki parol notoʻgʻri',
    );
    if (!user) throw invalid;
    if (!(await this.users.verifyPassword(password, user.passwordHash))) {
      throw invalid;
    }
    if (!user.active) {
      throw new UnauthorizedException(
        'Hisobingiz faol emas. Markaz bilan bogʻlaning.',
      );
    }

    const tokens = await this.issueTokens(user, userAgent);
    return { ...tokens, user: toPublicUser(user) };
  }

  async refresh(rawToken: string, userAgent?: string): Promise<AuthSession> {
    let payload: RefreshPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshPayload>(rawToken, {
        secret: this.config.getOrThrow<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token yaroqsiz yoki muddati tugagan');
    }

    const stored = await this.refreshTokens.findOne({
      where: { tokenHash: this.hash(rawToken) },
    });

    /* A token that verifies but is missing or already revoked means the value
       leaked and is being replayed. Drop every session this user has. */
    if (!stored || stored.revokedAt || stored.expiresAt <= new Date()) {
      this.logger.warn(
        `Refresh token reuse detected for user ${payload.sub}; revoking all sessions`,
      );
      await this.revokeAll(payload.sub);
      throw new UnauthorizedException('Sessiya bekor qilindi. Qaytadan kiring.');
    }

    const user = await this.users.findById(payload.sub);
    if (!user || !user.active) {
      await this.revokeAll(payload.sub);
      throw new UnauthorizedException('Hisob faol emas');
    }

    await stored.update({ revokedAt: new Date() });
    const tokens = await this.issueTokens(user, userAgent);
    return { ...tokens, user: toPublicUser(user) };
  }

  /** Ends one session, or every session when no token is given. */
  async logout(userId: number, rawToken?: string): Promise<void> {
    if (!rawToken) {
      await this.revokeAll(userId);
      return;
    }
    await this.refreshTokens.update(
      { revokedAt: new Date() },
      { where: { userId, tokenHash: this.hash(rawToken), revokedAt: null } },
    );
  }

  async me(userId: number): Promise<PublicUser> {
    return toPublicUser(await this.users.getActiveById(userId));
  }

  private async issueTokens(user: User, userAgent?: string): Promise<AuthTokens> {
    const accessPayload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
    };
    /* Config hands us plain strings ("15m", "30d"); jsonwebtoken types the
       field as its own template literal union, so narrow it here. */
    type Ttl = JwtSignOptions['expiresIn'];
    const accessTtl = this.config.getOrThrow<string>('jwt.accessTtl') as Ttl;
    const refreshTtl = this.config.getOrThrow<string>('jwt.refreshTtl') as Ttl;

    const accessToken = await this.jwt.signAsync(accessPayload, {
      secret: this.config.getOrThrow<string>('jwt.accessSecret'),
      expiresIn: accessTtl,
    });

    /* jti keeps two tokens minted in the same second distinct, so their
       hashes never collide on the unique index. */
    const refreshPayload: RefreshPayload = { sub: user.id, jti: randomUUID() };
    const refreshToken = await this.jwt.signAsync(refreshPayload, {
      secret: this.config.getOrThrow<string>('jwt.refreshSecret'),
      expiresIn: refreshTtl,
    });

    await this.refreshTokens.create({
      userId: user.id,
      tokenHash: this.hash(refreshToken),
      expiresAt: this.expiryFromToken(refreshToken),
      userAgent: userAgent?.slice(0, 255) ?? null,
      revokedAt: null,
    } as Partial<RefreshToken> as RefreshToken);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.secondsUntilExpiry(accessToken),
    };
  }

  private async revokeAll(userId: number): Promise<void> {
    await this.refreshTokens.update(
      { revokedAt: new Date() },
      { where: { userId, revokedAt: { [Op.is]: null } } },
    );
  }

  /* Only the digest is stored, so a database dump hands out no live sessions. */
  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private expiryFromToken(token: string): Date {
    const { exp } = this.jwt.decode<{ exp: number }>(token);
    return new Date(exp * 1000);
  }

  private secondsUntilExpiry(token: string): number {
    const { exp } = this.jwt.decode<{ exp: number }>(token);
    return Math.max(0, exp - Math.floor(Date.now() / 1000));
  }
}
