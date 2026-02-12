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
  Req,
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
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly courserService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Criar um novo curso' })
  @ApiResponse({ status: 201, description: 'Curso criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos enviados' })
  createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @GetUser() user: RequestUserDto,
  ) {
    return this.courserService.create(createCourseDto, user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  @Get('/teacher-courses')
  listMyCourses(
    @GetUser() user: RequestUserDto,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.courserService.listByTeacher(
      user.sub,
      Number(page),
      Number(limit),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar cursos com paginação' })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Página atual',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Quantidade de itens por página',
  })
  @ApiResponse({ status: 200, description: 'Lista paginada de cursos' })
  listAllCourses(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.courserService.listAll(Number(page), Number(limit));
  }

  @Get(':id/public')
  getPublicCourse(@Param('id', ParseIntPipe) id: number) {
    return this.courserService.getPublicCourse(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um curso pelo ID' })
  @ApiParam({ name: 'id', example: 1, description: 'ID do curso' })
  @ApiResponse({ status: 200, description: 'Curso encontrado' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  listOneCourses(@Param('id', ParseIntPipe) id: number) {
    return this.courserService.listOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Deletar um curso' })
  @ApiParam({ name: 'id', example: 1, description: 'ID do curso' })
  @ApiResponse({ status: 200, description: 'Curso removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  deleteCourses(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: RequestUserDto,
  ) {
    return this.courserService.delete(id, user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: 'Atualizar um curso' })
  @ApiParam({ name: 'id', example: 1, description: 'ID do curso' })
  @ApiResponse({ status: 200, description: 'Curso atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
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
  @ApiOperation({ summary: 'Publicar um curso' })
  @ApiParam({ name: 'id', example: 1, description: 'ID do curso' })
  @ApiResponse({
    status: 200,
    description: 'Curso publicado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Curso não encontrado',
  })
  publishCourse(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: RequestUserDto,
  ) {
    return this.courserService.publish(id, user.sub);
  }
}
