import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CourseStatus } from 'generated/prisma/enums';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;
}
