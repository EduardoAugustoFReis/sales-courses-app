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

@ApiTags('Lessons')
@ApiParam({ name: 'moduleId', type: Number })
@Controller('modules/:moduleId/lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova aula dentro de um módulo' })
  createLesson(
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    return this.lessonsService.create(moduleId, createLessonDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Listar todas as aulas do módulo' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listAllLesson(
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @GetUser() user: RequestUserDto,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.lessonsService.listAll(
      moduleId,
      user.sub,
      Number(page),
      Number(limit),
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':lessonId')
  @ApiOperation({ summary: 'Listar detalhes de uma aula específica' })
  @ApiParam({ name: 'lessonId', type: Number })
  listOneLesson(
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @GetUser() user: RequestUserDto,
  ) {
    return this.lessonsService.listOne(moduleId, lessonId, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':lessonId')
  @ApiOperation({ summary: 'Excluir uma aula do módulo' })
  @ApiParam({ name: 'lessonId', type: Number })
  deleteLesson(
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
  ) {
    return this.lessonsService.delete(moduleId, lessonId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':lessonId')
  @ApiOperation({ summary: 'Atualizar dados de uma aula' })
  @ApiParam({ name: 'lessonId', type: Number })
  updateLesson(
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.update(moduleId, lessonId, updateLessonDto);
  }
}
