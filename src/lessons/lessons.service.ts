import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(private readonly prismaService: PrismaService) {}

  private async validateAccess(moduleId: number, userId: number) {
    const module = await this.prismaService.module.findUnique({
      where: { id: moduleId },
      include: {
        course: {
          include: { purchases: true, teacher: true },
        },
      },
    });

    if (!module) {
      throw new NotFoundException('Modulo não encontrado');
    }

    const course = module.course;

    if (course.status === 'DRAFT') {
      throw new UnauthorizedException('Este curso não está disponível');
    }

    const isTeacherOwner = course.teacherId === userId;

    const hasPurchase = course.purchases.some(
      (puchase) => puchase.studentId === userId && puchase.status === 'PAID',
    );

    if (!isTeacherOwner && !hasPurchase) {
      throw new ForbiddenException('Você não tem acesso a esse conteudo');
    }

    return module;
  }

  private async findModuleOrFail(moduleId: number) {
    const module = await this.prismaService.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });
    if (!module) throw new NotFoundException('Módulo não encontrado');
    return module;
  }

  private async findLessonOrFail(lessonId: number) {
    const lesson = await this.prismaService.lesson.findUnique({
      where: {
        id: lessonId,
      },
      include: { module: true },
    });

    if (!lesson) throw new NotFoundException('Lição não encontrado');
    return lesson;
  }

  create = async (moduleId: number, createLessonDto: CreateLessonDto) => {
    await this.findModuleOrFail(moduleId);

    const newLesson = await this.prismaService.lesson.create({
      data: {
        title: createLessonDto.title,
        videoUrl: createLessonDto.videoUrl,
        position: createLessonDto.position,
        duration: createLessonDto.duration,
        moduleId,
      },
      include: {
        module: true,
      },
    });

    return { message: 'Lição criada', newLesson };
  };

  async listAll(moduleId: number, userId: number, page = 1, limit = 10) {
    await this.validateAccess(moduleId, userId);

    const skip = (page - 1) * limit;

    const [total, lessons] = await this.prismaService.$transaction([
      this.prismaService.lesson.count({
        where: { moduleId },
      }),
      this.prismaService.lesson.findMany({
        where: { moduleId },
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
    ]);

    return { page, limit, totalPage: Math.ceil(total / limit), data: lessons };
  }

  listOne = async (moduleId: number, lessonId: number, userId: number) => {
    await this.validateAccess(moduleId, userId);
    const lesson = await this.findLessonOrFail(lessonId);

    if (lesson.moduleId !== moduleId) {
      throw new NotFoundException('Está aula não pertence a esse curso');
    }

    if (!lesson) throw new NotFoundException('Aula não encontrada.');

    return lesson;
  };

  delete = async (moduleId: number, lessonId: number) => {
    await this.findModuleOrFail(moduleId);
    const lesson = await this.findLessonOrFail(lessonId);

    if (lesson.moduleId !== moduleId) {
      throw new NotFoundException('Está aula não pertence a esse curso');
    }

    await this.prismaService.lesson.delete({
      where: {
        id: lesson.id,
      },
    });

    return { message: 'Lição deletada' };
  };

  update = async (
    moduleId: number,
    lessonId: number,
    updateLessonDto: UpdateLessonDto,
  ) => {
    await this.findModuleOrFail(moduleId);
    const lesson = await this.findLessonOrFail(lessonId);

    if (lesson.moduleId !== moduleId) {
      throw new NotFoundException('Está aula não pertence a esse curso');
    }

    const updatedLesson = await this.prismaService.lesson.update({
      where: {
        id: lesson.id,
      },
      data: {
        title: updateLessonDto.title ?? lesson.title,
        videoUrl: updateLessonDto.videoUrl ?? lesson.videoUrl,
        position: updateLessonDto.position ?? lesson.position,
        duration: updateLessonDto.duration ?? lesson.duration,
      },
      include: {
        module: true,
      },
    });

    return { message: 'Lição atualizada', updatedLesson };
  };
}
