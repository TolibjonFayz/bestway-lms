import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { User } from '@/database/models';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly users: typeof User,
    private readonly config: ConfigService,
  ) {}

  /** Includes the password hash — only the auth flow should call this. */
  findByPhone(phone: string): Promise<User | null> {
    return this.users.findOne({ where: { phone } });
  }

  findById(id: number): Promise<User | null> {
    return this.users.findByPk(id);
  }

  async getActiveById(id: number): Promise<User> {
    const user = await this.users.findByPk(id);
    if (!user || !user.active) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }
    return user;
  }

  hashPassword(plain: string): Promise<string> {
    const rounds = this.config.getOrThrow<number>('bcryptRounds');
    return bcrypt.hash(plain, rounds);
  }

  verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
