import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import type { RequestUserDto } from 'src/common/dto/request-user.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('courses')
export class CoursesController {
  constructor(private readonly courserService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @GetUser() user: RequestUserDto,
  ) {
    return this.courserService.create(createCourseDto, user.sub);
  }

  @Get()
  listAllCourses(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.courserService.listAll(Number(page), Number(limit));
  }

  @Get(':id')
  listOneCourses(@Param('id', ParseIntPipe) id: number) {
    return this.courserService.listOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  deleteCourses(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: RequestUserDto,
  ) {
    return this.courserService.delete(id, user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  updateCourse(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
    @GetUser() user: RequestUserDto,
  ) {
    return this.courserService.update(id, updateCourseDto, user.sub);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  publishCourse(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: RequestUserDto,
  ) {
    return this.courserService.publish(id, user.sub);
  }
}
