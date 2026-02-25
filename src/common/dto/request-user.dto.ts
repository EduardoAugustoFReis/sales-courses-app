import { Role } from '@prisma/client';

export type RequestUserDto = {
  sub: number;
  email: string;
  role: Role;
};
