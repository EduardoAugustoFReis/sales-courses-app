import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFakePaymentDto {
  @ApiProperty({
    example: '4242424242424242',
    description: 'Número do cartão de crédito',
  })
  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @ApiProperty({
    example: 'Eduardo A. Reis',
    description: 'Nome impresso no cartão',
  })
  @IsString()
  @IsNotEmpty()
  holderName: string;

  @ApiProperty({
    example: '12',
    description: 'Mês de expiração do cartão (MM)',
  })
  @IsString()
  @IsNotEmpty()
  expMonth: string;

  @ApiProperty({
    example: '2030',
    description: 'Ano de expiração do cartão (YYYY)',
  })
  @IsString()
  @IsNotEmpty()
  expYear: string;

  @ApiProperty({
    example: '123',
    description: 'Código de segurança do cartão',
  })
  @IsString()
  @IsNotEmpty()
  cvv: string;
}
