import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prismaService: PrismaService) {}

  create = async (createCourseDto: CreateCourseDto, userId: number) => {
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

  listAll = async () => {
    const courses = await this.prismaService.course.findMany({
      include: {
        teacher: {
          select: { id: true, name: true },
        },
      },
    });

    return courses;
  };

  listOne = async (id: number) => {
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

  delete = async (id: number, userId: number) => {
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
  ) => {
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
}
