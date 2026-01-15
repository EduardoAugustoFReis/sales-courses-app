import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashingService } from 'src/common/Hash/hash.service';
import { PaginatedUsers, UserResponse } from './types/users.types';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
  ) {}

  create = async (
    createUserDto: CreateUserDto,
  ): Promise<{ message: string; newUser: UserResponse }> => {
    const passwordHashed = await this.hashingService.hashPassword(
      createUserDto.password,
    );
    const newUser = await this.prismaService.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        passwordHash: passwordHashed,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return { message: 'Usuário criado com sucesso', newUser };
  };

  listAll = async (page = 1, limit = 10): Promise<PaginatedUsers> => {
    const skip = (page - 1) * limit;

    const [total, users] = await this.prismaService.$transaction([
      this.prismaService.user.count(),
      this.prismaService.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      }),
    ]);

    return {
      page,
      total,
      limit,
      totalPages: Math.ceil(total / limit),
      data: users,
    };
  };

  listOne = async (id: number): Promise<UserResponse> => {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  };

  delete = async (id: number): Promise<{ message: string }> => {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    await this.prismaService.user.delete({
      where: {
        id: user.id,
      },
    });

    return { message: 'Usuário deletado com sucesso' };
  };

  update = async (
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<{ message: string; updatedUser: UserResponse }> => {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    let password = user.passwordHash;
    if (updateUserDto.password) {
      password = await this.hashingService.hashPassword(updateUserDto.password);
    }

    const updatedUser = await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        name: updateUserDto.name ?? user.name,
        email: updateUserDto.email ?? user.email,
        passwordHash: password,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return { message: 'Usuário atualizado com sucesso', updatedUser };
  };

  promoteToTeacher = async (id: number) => {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.role === 'TEACHER') {
      throw new BadRequestException('Usuário já é um professor');
    }

    if (user.role === 'ADMIN') {
      throw new BadRequestException('ADMIN não pode ser rebaixado/promovido');
    }

    const update = await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        role: 'TEACHER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return { message: 'Promovido a professor', update };
  };
}
