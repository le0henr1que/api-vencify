import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'user@gmail.com',
  })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  @Transform(
    ({ value }: TransformFnParams) =>
      typeof value === 'string' && value?.trim() && value?.toLowerCase(),
  )
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: '123456',
  })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  password: string;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'User',
  })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;
}
