import { ApiProperty } from "@nestjs/swagger";
import { $Enums, File } from "@prisma/client";
import { IsEnum, IsNotEmpty } from "class-validator";
import { BaseEntity } from "src/modules/base/base.entity";

export class FileEntity extends BaseEntity implements File {
  @ApiProperty({
    example: "1",
    description: "Identificador da File",
  })
  @IsNotEmpty({
    message: "Identificador da File é obrigatório",
  })
  id: string;

  @ApiProperty({
    example: "file_name",
    description: "Nome do arquivo",
  })
  @IsNotEmpty({
    message: "Nome do arquivo é obrigatório",
  })
  file_name: string;

  @ApiProperty({
    example: "file_type",
    description: "Tipo do arquivo",
  })
  @IsNotEmpty({
    message: "Tipo do arquivo é obrigatório",
  })
  file_type: string;

  @ApiProperty({
    example: "/path/to/file",
    description: "Path da s3 do arquivo",
  })
  @IsNotEmpty({
    message: "Path da s3 é obrigatório",
  })
  s3_path: string;

  @ApiProperty({
    example: "entity_name",
    description: "Entidade do arquivo",
  })
  @IsNotEmpty({
    message: "Entidade do arquivo é obrigatório",
  })
  @IsEnum($Enums.AssignmentsEnum)
  entity_name: $Enums.AssignmentsEnum;

  @ApiProperty({
    example: "file_size",
    description: "Tamanho do arquivo",
  })
  @IsNotEmpty({
    message: "Tamanho do arquivo é obrigatório",
  })
  entity_id: string;
}
