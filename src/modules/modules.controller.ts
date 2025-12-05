import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { RequestUserDto } from 'src/common/dto/request-user.dto';

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

  @UseGuards(JwtAuthGuard)
  @Get()
  listAllModules(
    @Param('courseId', ParseIntPipe) courseId: number,
    @GetUser() user: RequestUserDto,
  ) {
    return this.modulesService.listAll(courseId, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':moduleId')
  listOneModule(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @GetUser() user: RequestUserDto,
  ) {
    return this.modulesService.listOne(courseId, moduleId, user.sub);
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
