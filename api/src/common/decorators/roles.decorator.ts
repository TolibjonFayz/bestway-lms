import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums';

export const ROLES_KEY = 'roles';

/** Restrict a route (or a whole controller) to the listed roles. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
