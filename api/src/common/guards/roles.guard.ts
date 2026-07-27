import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../enums';
import { AuthenticatedRequest } from '../types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    /* The role comes from the verified token that JwtAuthGuard put here —
       never from the request body. */
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException('Bu amal uchun ruxsat yoʻq');
    }
    return true;
  }
}
