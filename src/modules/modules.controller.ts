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
  UseGuards,
} from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { RequestUserDto } from 'src/common/dto/request-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Modules')
@ApiParam({ name: 'courseId', type: Number })
@Controller('courses/:courseId/modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  @Post()
  @ApiOperation({ summary: 'Criar um módulo em um curso' })
  @ApiResponse({ status: 201, description: 'Módulo criado com sucesso' })
  createModule(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() createModuleDto: CreateModuleDto,
  ) {
    return this.modulesService.create(courseId, createModuleDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  @Get('/teacher')
  listTeacherModules(
    @Param('courseId', ParseIntPipe) courseId: number,
    @GetUser() user: RequestUserDto,
  ) {
    return this.modulesService.listTeacherModules(courseId, user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  @Get('teacher/:moduleId')
  listOneTeacherModule(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @GetUser() user: RequestUserDto,
  ) {
    return this.modulesService.listOneTeacher(courseId, moduleId, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Listar módulos de um curso' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de módulos retornada' })
  listAllModules(
    @Param('courseId', ParseIntPipe) courseId: number,
    @GetUser() user: RequestUserDto,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.modulesService.listAll(
      courseId,
      user.sub,
      Number(page),
      Number(limit),
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':moduleId')
  @ApiOperation({ summary: 'Listar um módulo específico' })
  @ApiParam({ name: 'moduleId', type: Number })
  listOneModule(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @GetUser() user: RequestUserDto,
  ) {
    return this.modulesService.listOne(courseId, moduleId, user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  @ApiBearerAuth()
  @Delete(':moduleId')
  @ApiOperation({ summary: 'Excluir um módulo' })
  @ApiParam({ name: 'moduleId', type: Number })
  @ApiResponse({ status: 200, description: 'Módulo deletado com sucesso' })
  deleteModule(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @GetUser() user: RequestUserDto,
  ) {
    return this.modulesService.delete(courseId, moduleId, user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  @ApiBearerAuth()
  @Patch(':moduleId')
  @ApiOperation({ summary: 'Atualizar um módulo' })
  @ApiParam({ name: 'moduleId', type: Number })
  @ApiResponse({ status: 200, description: 'Módulo atualizado com sucesso' })
  updateModule(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @GetUser() user: RequestUserDto,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return this.modulesService.update(
      courseId,
      moduleId,
      user.sub,
      updateModuleDto,
    );
  }
}
