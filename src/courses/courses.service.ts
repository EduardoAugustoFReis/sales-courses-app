import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import {
  CourseDetailResponse,
  CreateCourseResponse,
  DeleteCourseResponse,
  PaginationCourse,
  PublishCourseResponse,
  UpdateCourseResponse,
} from './types/courses.types';

@Injectable()
export class CoursesService {
  constructor(private readonly prismaService: PrismaService) {}

  create = async (
    createCourseDto: CreateCourseDto,
    userId: number,
  ): Promise<CreateCourseResponse> => {
    const newCourse = await this.prismaService.course.create({
      data: {
        title: createCourseDto.title,
        description: createCourseDto.description,
        imageUrl: createCourseDto.imageUrl,
        price: createCourseDto.price,
        status: createCourseDto.status,
        teacherId: userId,
      },
    });

    return { message: 'Curso criado com sucesso.', newCourse };
  };

  listByTeacher = async (teacherId: number, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [total, courses] = await this.prismaService.$transaction([
      this.prismaService.course.count({
        where: { teacherId },
      }),
      this.prismaService.course.findMany({
        where: { teacherId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
      data: courses,
    };
  };

  listAll = async (page = 1, limit = 10): Promise<PaginationCourse> => {
    const skip = (page - 1) * limit;

    const [total, courses] = await this.prismaService.$transaction([
      this.prismaService.course.count({
        where: { status: 'PUBLISHED' },
      }),
      this.prismaService.course.findMany({
        where: { status: 'PUBLISHED' },
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
    ]);

    return {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
      data: courses,
    };
  };

  getPublicCourse = async (id: number) => {
    const course = await this.prismaService.course.findUnique({
      where: { id },
      include: {
        teacher: {
          select: { name: true, },
        },
        modules: {
          select: {
            id: true,
            lessons: {
              select: { duration: true },
            },
          },
        },
      },
    });

    if (!course || course.status !== 'PUBLISHED') {
      throw new NotFoundException('Curso não encontrado');
    }

    const totalLessons = course.modules.reduce(
      (acc, module) => acc + module.lessons.length,
      0,
    );

    const totalDuration = course.modules.reduce(
      (acc, module) =>
        acc + module.lessons.reduce((sum, l) => sum + l.duration, 0),
      0,
    );

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      imageUrl: course.imageUrl,
      price: course.price,
      teacher: course.teacher,
      stats: {
        modules: course.modules.length,
        lessons: totalLessons,
        duration: totalDuration,
      },
    };
  };

  listOne = async (id: number): Promise<CourseDetailResponse> => {
    const course = await this.prismaService.course.findUnique({
      where: {
        id: id,
      },
      include: {
        teacher: {
          select: { id: true, name: true },
        },
        modules: {
          select: { id: true, title: true, position: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    return course;
  };

  delete = async (
    id: number,
    userId: number,
  ): Promise<DeleteCourseResponse> => {
    const course = await this.prismaService.course.findUnique({
      where: {
        id: id,
      },
    });

    if (!course) throw new NotFoundException('Curso não encontrado!');

    if (course.teacherId !== userId) {
      throw new UnauthorizedException('Você não pode deletar esse curso.');
    }

    await this.prismaService.course.delete({
      where: { id: course.id },
    });

    return { message: 'Curso deletado com sucesso' };
  };

  update = async (
    id: number,
    updateCourseDto: UpdateCourseDto,
    userId: number,
  ): Promise<UpdateCourseResponse> => {
    const course = await this.prismaService.course.findUnique({
      where: {
        id: id,
      },
    });

    if (!course) throw new NotFoundException('Curso não encontrado');

    if (course.teacherId !== userId) {
      throw new UnauthorizedException('Você não pode editar este curso');
    }

    const updatedCourse = await this.prismaService.course.update({
      where: {
        id: course.id,
      },
      data: {
        title: updateCourseDto.title ?? course.title,
        description: updateCourseDto.description ?? course.description,
        imageUrl: updateCourseDto.imageUrl ?? course.imageUrl,
        price: updateCourseDto.price ?? course.price,
        status: updateCourseDto.status ?? course.status,
      },
    });

    return { message: 'Curso atualizado com sucesso', updatedCourse };
  };

  publish = async (
    id: number,
    userId: number,
  ): Promise<PublishCourseResponse> => {
    const course = await this.prismaService.course.findUnique({
      where: { id },
      include: {
        modules: true,
      },
    });

    if (!course) throw new NotFoundException('Curso não encontrado');

    if (course.teacherId !== userId) {
      throw new UnauthorizedException('Você não pode publicar este curso');
    }

    if (course.status !== 'DRAFT') {
      throw new UnauthorizedException('Este curso já está publicado');
    }

    if (course.modules.length === 0) {
      throw new UnauthorizedException(
        'O curso precisa ter pelo menos 1 módulo antes de ser publicado',
      );
    }

    const updatedCourse = await this.prismaService.course.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });

    return {
      message: 'Curso publicado com sucesso',
      updatedCourse,
    };
  };

}
