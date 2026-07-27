import { Request } from 'express';
import { UserRole } from './enums';

/** What we put in an access token, and what the guard hands to controllers. */
export interface JwtPayload {
  sub: number;
  phone: string;
  role: UserRole;
}

export interface RefreshPayload {
  sub: number;
  /** Identifies the stored refresh_tokens row so rotation can revoke it. */
  jti: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

/** The envelope every list endpoint returns. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
