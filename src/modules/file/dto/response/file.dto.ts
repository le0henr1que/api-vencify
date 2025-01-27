import { ApiProperty } from "@nestjs/swagger";
import { $Enums } from "@prisma/client";
import { IsNotEmpty } from "class-validator";

export class FileDto {
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
