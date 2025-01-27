import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { CrudType } from "src/modules/base/interfaces/ICrudTypeMap";

import { FileTypeMap } from "../type/file.type.map";

export class DefaultFilterFile<T extends FileTypeMap> {
  @IsOptional()
  @ApiPropertyOptional()
  page?: number = 1;

  @IsOptional()
  @ApiPropertyOptional()
  perPage?: number = 10;

  @IsOptional()
  @ApiPropertyOptional()
  search?: string;

  @IsOptional()
  @ApiPropertyOptional({
    example: {
      id: "desc",
    },
  })
  orderBy?: T[CrudType.ORDER_BY] = { id: "desc" };

  where?: T[CrudType.WHERE];

  select?: T[CrudType.SELECT];

  @IsOptional()
  @ApiPropertyOptional()
  id?: string;
}
