import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest, JwtPayload } from '../types';

/** The verified token payload. Never read the role from the request body. */
export const CurrentUser = createParamDecorator(
  (field: keyof JwtPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return field ? request.user?.[field] : request.user;
  },
);
