import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UserUpdateDto {
  @ApiProperty({
    description: 'Versão do usuário',
    example: 3,
  })
  @IsNumber({}, { message: 'O campo de versão deve ser um número' })
  @IsNotEmpty({ message: 'A versão é obrigatória' })
  version: number;

  @ApiPropertyOptional({
    example: 'Leonardo Silva',
    description: 'Nome do usuário',
  })
  @IsString({ message: 'O campo de nome deve ser uma string' })
  @MaxLength(200, {
    message: 'O campo de nome deve ter menos de 200 caracteres',
  })
  @IsOptional()
  @Transform(
    ({ value }: TransformFnParams) =>
      typeof value === 'string' && value?.trim(),
  )
  name?: string;

  @ApiPropertyOptional({
    description: 'Número de telefone do usuário',
    example: '123456789',
  })
  @IsString({ message: 'O campo de número de telefone deve ser uma string' })
  @IsOptional()
  whatsapp_number?: string;

  @ApiPropertyOptional({
    description: 'Número de telefone do usuário',
    example: '123456789',
  })
  @IsString({ message: 'O campo de número de telefone deve ser uma string' })
  @IsOptional()
  phone_number?: string;

  @ApiPropertyOptional({
    description: 'Id do avatar do usuário',
    example: '1',
  })
  @IsString({ message: 'O campo de número de telefone deve ser uma string' })
  @IsOptional()
  file_id?: string;
}
