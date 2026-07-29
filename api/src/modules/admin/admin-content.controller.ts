import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '@/common/decorators/roles.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { UserRole } from '@/common/enums';
import { Paginated } from '@/common/types';
import { AdminContentService } from './admin-content.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateLessonItemDto } from './dto/create-lesson-item.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { ReorderDto } from './dto/reorder.dto';
import { UpdateLessonItemDto } from './dto/update-lesson-item.dto';
import {
  AdminCourseDto,
  AdminLessonItemDto,
  AdminUnitDetailDto,
  AdminUnitDto,
} from './admin-content.types';

@Controller('admin')
@Roles(UserRole.Admin)
export class AdminContentController {
  constructor(private readonly content: AdminContentService) {}

  @Get('courses')
  listCourses(@Query() page: PaginationDto): Promise<Paginated<AdminCourseDto>> {
    return this.content.listCourses(page);
  }

  @Post('courses')
  createCourse(@Body() dto: CreateCourseDto): Promise<AdminCourseDto> {
    return this.content.createCourse(dto);
  }

  @Get('courses/:courseId/units')
  listUnits(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query() page: PaginationDto,
  ): Promise<Paginated<AdminUnitDto>> {
    return this.content.listUnits(courseId, page);
  }

  @Post('courses/:courseId/units')
  createUnit(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateUnitDto,
  ): Promise<AdminUnitDto> {
    return this.content.createUnit(courseId, dto);
  }

  @Patch('courses/:courseId/units/reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorderUnits(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: ReorderDto,
  ): Promise<void> {
    await this.content.reorderUnits(courseId, dto);
  }

  @Get('units/:unitId')
  unitDetail(@Param('unitId', ParseIntPipe) unitId: number): Promise<AdminUnitDetailDto> {
    return this.content.unitDetail(unitId);
  }

  @Post('units/:unitId/items')
  createItem(
    @Param('unitId', ParseIntPipe) unitId: number,
    @Body() dto: CreateLessonItemDto,
  ): Promise<AdminLessonItemDto> {
    return this.content.createLessonItem(unitId, dto);
  }

  @Patch('units/:unitId/items/reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorderItems(
    @Param('unitId', ParseIntPipe) unitId: number,
    @Body() dto: ReorderDto,
  ): Promise<void> {
    await this.content.reorderItems(unitId, dto);
  }

  @Patch('items/:itemId')
  updateItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateLessonItemDto,
  ): Promise<AdminLessonItemDto> {
    return this.content.updateLessonItem(itemId, dto);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteItem(@Param('itemId', ParseIntPipe) itemId: number): Promise<void> {
    await this.content.deleteLessonItem(itemId);
  }
}
