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
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Controller('courses/:courseId/modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  createModule(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() createModuleDto: CreateModuleDto,
  ) {
    return this.modulesService.create(courseId, createModuleDto);
  }

  @Get()
  listAllModules(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.modulesService.listAll(courseId);
  }

  @Get(':moduleId')
  listOneModule(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
  ) {
    return this.modulesService.listOne(courseId, moduleId);
  }

  @Delete(':moduleId')
  deleteModule(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
  ) {
    return this.modulesService.delete(courseId, moduleId);
  }

  @Patch(':moduleId')
  updateModule(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return this.modulesService.update(courseId, moduleId, updateModuleDto);
  }
}
