import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Request } from 'express';

type UserProps = {
  role: string;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Pegar os roles esperados da rota (vindos do decorator)
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se a rota não tiver decorator @Roles, permitir acesso
    if (!requiredRoles) return true;

    // 2. Pegar o usuário do request (vem do JwtStrategy)
    const request: Request = context.switchToHttp().getRequest();
    const user = request.user as UserProps;

    // Se não tiver usuário, acesso negado
    if (!user) throw new ForbiddenException('Usuário não autenticado');

    // 3. Verificar se o role do user é permitido
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Você não tem permissão para acessar esta rota`,
      );
    }

    return true;
  }
}
