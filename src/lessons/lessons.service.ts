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
  constructor(private readonly prisma: PrismaService) {}

  private async findModuleOrFail(courseId: number, moduleId: number) {
    const module = await this.prisma.module.findFirst({
      where: {
        id: moduleId,
        courseId,
      },
      select: {
        id: true,
        course: {
          select: {
            id: true,
            status: true,
            teacherId: true,
            purchases: {
              select: {
                studentId: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!module) {
      throw new NotFoundException('Módulo não encontrado para este curso');
    }

    return module;
  }

  private async findLessonOrFail(moduleId: number, lessonId: number) {
    const lesson = await this.prisma.lesson.findFirst({
      where: {
        id: lessonId,
        moduleId,
      },
    });

    if (!lesson) {
      throw new NotFoundException('Aula não encontrada neste módulo');
    }

    return lesson;
  }

  private validateStudentAccess(course: any, userId: number) {
    if (course.status === 'DRAFT') {
      throw new UnauthorizedException('Este curso não está publicado');
    }

    const hasPurchase = course.purchases.some(
      (p) => p.studentId === userId && p.status === 'PAID',
    );

    if (!hasPurchase) {
      throw new ForbiddenException('Você não tem acesso a este conteúdo');
    }
  }

  private validateTeacherOwner(course: any, teacherId: number) {
    if (course.teacherId !== teacherId) {
      throw new ForbiddenException('Você não é o professor deste curso');
    }
  }

  async create({
    courseId,
    moduleId,
    teacherId,
    dto,
  }: {
    courseId: number;
    moduleId: number;
    teacherId: number;
    dto: CreateLessonDto;
  }) {
    const module = await this.findModuleOrFail(courseId, moduleId);

    this.validateTeacherOwner(module.course, teacherId);

    const lastLesson = await this.prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const nextPosition = lastLesson ? lastLesson.position + 1 : 1;

    const newLesson = await this.prisma.lesson.create({
      data: {
        title: dto.title,
        videoUrl: dto.videoUrl,
        duration: dto.duration,
        position: nextPosition,
        moduleId,
      },
    });

    return newLesson;
  }

  async findAll({
    courseId,
    moduleId,
    userId,
    page = 1,
    limit = 10,
  }: {
    courseId: number;
    moduleId: number;
    userId: number;
    page?: number;
    limit?: number;
  }) {
    const module = await this.findModuleOrFail(courseId, moduleId);

    if (module.course.teacherId !== userId) {
      this.validateStudentAccess(module.course, userId);
    }

    const skip = (page - 1) * limit;

    const [total, lessons] = await this.prisma.$transaction([
      this.prisma.lesson.count({ where: { moduleId } }),
      this.prisma.lesson.findMany({
        where: { moduleId },
        orderBy: { position: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: lessons,
    };
  }

  async findOne({
    courseId,
    moduleId,
    lessonId,
    userId,
  }: {
    courseId: number;
    moduleId: number;
    lessonId: number;
    userId: number;
  }) {
    const module = await this.findModuleOrFail(courseId, moduleId);

    if (module.course.teacherId !== userId) {
      this.validateStudentAccess(module.course, userId);
    }

    const lesson = await this.findLessonOrFail(moduleId, lessonId);

    return lesson;
  }

  async update({
    courseId,
    moduleId,
    lessonId,
    teacherId,
    dto,
  }: {
    courseId: number;
    moduleId: number;
    lessonId: number;
    teacherId: number;
    dto: UpdateLessonDto;
  }) {
    const module = await this.findModuleOrFail(courseId, moduleId);

    this.validateTeacherOwner(module.course, teacherId);

    const lesson = await this.findLessonOrFail(moduleId, lessonId);

    const updated = await this.prisma.lesson.update({
      where: { id: lesson.id },
      data: dto,
    });

    return {
      message: 'Aula atualizada com sucesso',
      data: updated,
    };
  }

  async remove({
    courseId,
    moduleId,
    lessonId,
    teacherId,
  }: {
    courseId: number;
    moduleId: number;
    lessonId: number;
    teacherId: number;
  }) {
    const module = await this.findModuleOrFail(courseId, moduleId);

    this.validateTeacherOwner(module.course, teacherId);

    await this.findLessonOrFail(moduleId, lessonId);

    await this.prisma.lesson.delete({
      where: { id: lessonId },
    });

    return {
      message: 'Aula deletada com sucesso',
    };
  }
}
