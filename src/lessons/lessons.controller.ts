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
  UseGuards,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { RequestUserDto } from 'src/common/dto/request-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Lessons')
@ApiBearerAuth()
@ApiParam({ name: 'courseId', type: Number })
@ApiParam({ name: 'moduleId', type: Number })
@Controller('courses/:courseId/modules/:moduleId/lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  // ========================
  // CREATE
  // ========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  @Post()
  @ApiOperation({ summary: 'Criar uma nova aula dentro do módulo' })
  create(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Body() dto: CreateLessonDto,
    @GetUser() user: RequestUserDto,
  ) {
    return this.lessonsService.create({
      courseId,
      moduleId,
      teacherId: user.sub,
      dto,
    });
  }

  // ========================
  // READ — LIST
  // ========================
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar aulas do módulo' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @GetUser() user: RequestUserDto,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.lessonsService.findAll({
      courseId,
      moduleId,
      userId: user.sub,
      page: Number(page),
      limit: Number(limit),
    });
  }

  // ========================
  // READ — BY ID
  // ========================
  @UseGuards(JwtAuthGuard)
  @Get(':lessonId')
  @ApiOperation({ summary: 'Buscar detalhes de uma aula' })
  @ApiParam({ name: 'lessonId', type: Number })
  findOne(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @GetUser() user: RequestUserDto,
  ) {
    return this.lessonsService.findOne({
      courseId,
      moduleId,
      lessonId,
      userId: user.sub,
    });
  }

  // ========================
  // UPDATE
  // ========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  @Patch(':lessonId')
  @ApiOperation({ summary: 'Atualizar uma aula' })
  update(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Body() dto: UpdateLessonDto,
    @GetUser() user: RequestUserDto,
  ) {
    return this.lessonsService.update({
      courseId,
      moduleId,
      lessonId,
      teacherId: user.sub,
      dto,
    });
  }

  // ========================
  // DELETE
  // ========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  @Delete(':lessonId')
  @ApiOperation({ summary: 'Excluir uma aula' })
  remove(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @GetUser() user: RequestUserDto,
  ) {
    return this.lessonsService.remove({
      courseId,
      moduleId,
      lessonId,
      teacherId: user.sub,
    });
  }
}
