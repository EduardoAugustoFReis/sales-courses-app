import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HashingService } from 'src/common/Hash/hash.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLoginDto } from './dto/create-login.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginResponse } from './types/auth.types';
import { RequestUserDto } from 'src/common/dto/request-user.dto';

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
  ) {}

  login = async (createLoginDto: CreateLoginDto): Promise<LoginResponse> => {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: createLoginDto.email,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'Usuário não encontrado, e-mail e/ou senha incorretos',
      );
    }

    const passwordChecked = await this.hashingService.comparePassword(
      createLoginDto.password,
      user.passwordHash,
    );

    if (!passwordChecked) {
      throw new UnauthorizedException('Acesso negado, senha incorreta');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const token = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
    };
  };

  profile = async (user: RequestUserDto) => {
    const userDb = await this.prismaService.user.findUnique({
      where: { id: user.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return userDb;
  };
}
