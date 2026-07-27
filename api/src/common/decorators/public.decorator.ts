import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/* JwtAuthGuard is registered globally so routes fail closed. Anything that has
   to be reachable without a token opts out here, explicitly. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
