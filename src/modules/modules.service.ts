import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModulesService {
  constructor(private readonly prismaService: PrismaService) {}

  private async findCourseOrFail(courseId: number) {
    const course = await this.prismaService.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Curso não encontrado');
    return course;
  }

  private async findModuleOrFail(moduleId: number) {
    const module = await this.prismaService.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });
    if (!module) throw new NotFoundException('Módulo não encontrado');
    return module;
  }

  create = async (courseId: number, createModuleDto: CreateModuleDto) => {
    await this.findCourseOrFail(courseId);
    const newModule = await this.prismaService.module.create({
      data: {
        title: createModuleDto.title,
        position: createModuleDto.position,
        courseId,
      },
      include: {
        course: true,
      },
    });

    return { message: 'Modulo criado.', newModule };
  };

  listAll = async (courseId: number) => {
    await this.findCourseOrFail(courseId);

    return this.prismaService.module.findMany({
      where: { courseId },
      orderBy: { position: 'asc' },
      include: { course: true },
    });
  };

  listOne = async (courseId: number, moduleId: number) => {
    await this.findCourseOrFail(courseId);
    const module = await this.findModuleOrFail(moduleId);

    if (module.courseId !== courseId) {
      throw new NotFoundException('Este módulo não pertence a esse curso.');
    }

    return module;
  };

  delete = async (courseId: number, moduleId: number) => {
    await this.findCourseOrFail(courseId);
    const module = await this.findModuleOrFail(moduleId);

    if (module.courseId !== courseId) {
      throw new NotFoundException('Este módulo não pertence a esse curso.');
    }

    await this.prismaService.module.delete({
      where: {
        id: module.id,
      },
    });

    return { message: 'Modulo deletado.' };
  };

  update = async (
    courseId: number,
    moduleId: number,
    updateModuleDto: UpdateModuleDto,
  ) => {
    await this.findCourseOrFail(courseId);
    const module = await this.findModuleOrFail(moduleId);

    if (module.courseId !== courseId) {
      throw new NotFoundException('Este módulo não pertence a esse curso.');
    }

    const updatedModule = await this.prismaService.module.update({
      where: {
        id: module.id,
      },
      data: {
        title: updateModuleDto.title ?? module.title,
        position: updateModuleDto.position ?? module.position,
      },
      include: {
        course: true,
      },
    });

    return { message: 'Modulo atualizado', updatedModule };
  };
}
