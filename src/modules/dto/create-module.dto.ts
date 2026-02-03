import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({
    description: 'Título do Módulo',
    example: 'Introdução.',
  })
  @IsString()
  @IsNotEmpty()
  title: string;
}
