import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsNumber, IsNotEmpty } from 'class-validator';

// TODO-GENERATOR: INSERT THE DTO UPDATE PROPERTIES HERE
// TODO-GENERATOR: PUT THE @ApiProperty() in each property
// TODO-GENERATOR: PUT THE @IsNotEmpty() in each property or @IsOptional() to be recognized in request
export class CategoryUpdateDto implements Prisma.CategoryUpdateInput {
  @ApiProperty({
    description: 'Versão da Category',
    example: 1,
  })
  @IsNumber({}, { message: 'O campo version deve ser um número' })
  @IsNotEmpty({ message: 'A versão é obrigatória' })
  version: number;
}