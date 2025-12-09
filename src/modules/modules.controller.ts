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

@ApiTags('Modules')
@ApiParam({ name: 'courseId', type: Number })
@Controller('courses/:courseId/modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um módulo em um curso' })
  @ApiResponse({ status: 201, description: 'Módulo criado com sucesso' })
  createModule(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() createModuleDto: CreateModuleDto,
  ) {
    return this.modulesService.create(courseId, createModuleDto);
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':moduleId')
  @ApiOperation({ summary: 'Excluir um módulo' })
  @ApiParam({ name: 'moduleId', type: Number })
  @ApiResponse({ status: 200, description: 'Módulo deletado com sucesso' })
  deleteModule(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
  ) {
    return this.modulesService.delete(courseId, moduleId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':moduleId')
  @ApiOperation({ summary: 'Atualizar um módulo' })
  @ApiParam({ name: 'moduleId', type: Number })
  @ApiResponse({ status: 200, description: 'Módulo atualizado com sucesso' })
  updateModule(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return this.modulesService.update(courseId, moduleId, updateModuleDto);
  }
}
