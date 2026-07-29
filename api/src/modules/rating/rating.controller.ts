import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { JwtPayload } from '@/common/types';
import { RatingQueryDto } from './dto/rating-query.dto';
import { RatingService } from './rating.service';
import { RatingDto } from './rating.types';

@Controller('rating')
@Roles(UserRole.Student)
export class RatingController {
  constructor(private readonly rating: RatingService) {}

  @Get()
  get(
    @CurrentUser() user: JwtPayload,
    @Query() query: RatingQueryDto,
  ): Promise<RatingDto> {
    return this.rating.forStudent(user.sub, query);
  }
}
