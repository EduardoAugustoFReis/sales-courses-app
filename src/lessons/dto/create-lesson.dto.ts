import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ description: 'Título da aula' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'URL do vídeo da aula' })
  @IsNotEmpty()
  @IsString()
  videoUrl: string;

  @ApiProperty({ description: 'Duração da aula em minutos' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  duration: number;

  @ApiProperty({ description: 'Posição (ordem) da aula dentro do módulo' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  position: number;
}
