import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CourseStatus } from 'generated/prisma/enums';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Título do curso',
    example: 'Curso de NestJS Completo',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Descrição detalhada do curso',
    example: 'Aprenda NestJS do zero ao avançado',
    required: false,
  })
  @ApiProperty({ description: 'Descrição do curso' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'URL da imagem de capa do curso',
    example: 'https://example.com/image.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: 'Preço do curso',
    example: 129.9,
  })
  @ApiProperty({ description: 'Preço do curso' })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'Status atual do curso',
    enum: CourseStatus,
    example: CourseStatus.DRAFT,
    required: false,
  })
  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;
}
