import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  isEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { AssignmentDto } from '../common.dto';
import { ConfirmType } from 'src/utils/constants';

export class UserCreateDto {
  @ApiProperty({
    example: 'emailusuario@gmail.com',
    description: 'E-mail do usuário',
  })
  @IsNotEmpty({ message: 'O campo de email deve ser preenchido' })
  access_token: string;

  @ApiProperty({
    example: 'emailusuario@gmail.com',
    description: 'E-mail do usuário',
  })
  @IsNotEmpty({ message: 'O campo de email deve ser preenchido' })
  isNotification: string;

  @ApiProperty({
    example: 'emailusuario@gmail.com',
    description: 'E-mail do usuário',
  })
  @IsNotEmpty({ message: 'O campo de email deve ser preenchido' })
  notificationInterval: string;

  @ApiProperty({
    example: 'emailusuario@gmail.com',
    description: 'E-mail do usuário',
  })
  @IsNotEmpty({ message: 'O campo de email deve ser preenchido' })
  organization_name: string;
}
