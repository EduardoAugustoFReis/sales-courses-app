import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateLessonDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  videoUrl: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  duration: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  position: number;
}
