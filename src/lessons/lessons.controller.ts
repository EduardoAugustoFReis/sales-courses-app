import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Controller('modules/:moduleId/lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  createLesson(
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    return this.lessonsService.create(moduleId, createLessonDto);
  }

  @Get()
  listAllLesson(@Param('moduleId', ParseIntPipe) moduleId: number) {
    return this.lessonsService.listAll(moduleId);
  }

  @Get(':lessonId')
  listOneLesson(
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
  ) {
    return this.lessonsService.listOne(moduleId, lessonId);
  }

  @Delete(':lessonId')
  deleteLesson(
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
  ) {
    return this.lessonsService.delete(moduleId, lessonId);
  }

  @Patch(':lessonId')
  updateLesson(
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.update(moduleId, lessonId, updateLessonDto);
  }
}
