import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class ModifyPasswordWithOldPasswordDto {
  @IsNotEmpty({
    message: 'A nova senha é obrigatória',
  })
  @MaxLength(255, {
    message: 'A nova senha deve ter no máximo 255 caracteres',
  })
  @ApiProperty({
    description: 'Nova senha',
    example: '123456',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'A senha deve conter no mínimo 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial',
    },
  )
  @Transform(
    ({ value }: TransformFnParams) =>
      typeof value === 'string' && value?.trim(),
  )
  newPassword: string;

  @IsNotEmpty({
    message: 'A nova senha é obrigatória',
  })
  @MaxLength(255, {
    message: 'A nova senha deve ter no máximo 255 caracteres',
  })
  @ApiProperty({
    description: 'Nova senha',
    example: '123456',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'A senha deve conter no mínimo 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial',
    },
  )
  @Transform(
    ({ value }: TransformFnParams) =>
      typeof value === 'string' && value?.trim(),
  )
  oldPassword: string;
}
