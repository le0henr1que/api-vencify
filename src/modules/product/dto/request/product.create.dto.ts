import { $Enums, Prisma } from '@prisma/client';
import { DecimalJsLike } from '@prisma/client/runtime/library';

// TODO-GENERATOR: INSERT THE DTO CREATE HERE
// TODO-GENERATOR: PUT THE @ApiProperty() in each property
// TODO-GENERATOR: PUT THE @IsNotEmpty() in each property or @IsOptional() to be recognized in request
export class ProductCreateDto implements Prisma.ProductUncheckedCreateInput {
  id?: string;
  name: string;
  description?: string;
  price: string | number | Prisma.Decimal | DecimalJsLike;
  code: string;
  validate?: string | Date;
  local?: string;
  bar_code?: string;
  status?: $Enums.StatusEnum;
  created_at?: string | Date;
  updated_at?: string | Date;
  deleted_at?: string | Date;
  version?: number;
  category_id?: string;
  batches?: Prisma.BatchUncheckedCreateNestedManyWithoutProductInput;
}
