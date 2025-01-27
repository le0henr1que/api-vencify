import { ApiProperty } from "@nestjs/swagger";
import { $Enums } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty } from "class-validator";

export class FileParamsResponseDto {
  @ApiProperty({
    example: "user",
    description:
      "Entidade à qual o arquivo será relacionado. (as entidades podem estar em minúsculas)",
  })
  @IsNotEmpty({
    message: "Entidade do arquivo é obrigatório",
  })
  @IsEnum($Enums.AssignmentsEnum, {
    message:
      "Entidade inválida. Valores permitidos: " +
      Object.values($Enums.AssignmentsEnum).join(", "),
  })
  @Transform(({ value }) => value?.toUpperCase())
  entity_name: $Enums.AssignmentsEnum;
}
