import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticatedRequest, JwtPayload } from '../types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearer(request.headers.authorization);
    if (!token) {
      throw new UnauthorizedException('Avtorizatsiya tokeni topilmadi');
    }

    try {
      /* Verified against the access secret specifically, so a refresh token
         cannot be replayed here. */
      request.user = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.config.getOrThrow<string>('jwt.accessSecret'),
      });
    } catch {
      throw new UnauthorizedException('Token yaroqsiz yoki muddati tugagan');
    }
    return true;
  }

  private extractBearer(header?: string): string | null {
    if (!header) return null;
    const [scheme, value] = header.split(' ');
    return scheme?.toLowerCase() === 'bearer' && value ? value : null;
  }
}
