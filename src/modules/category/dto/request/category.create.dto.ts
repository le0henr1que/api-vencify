import { $Enums, Prisma } from '@prisma/client';

// TODO-GENERATOR: INSERT THE DTO CREATE HERE
// TODO-GENERATOR: PUT THE @ApiProperty() in each property
// TODO-GENERATOR: PUT THE @IsNotEmpty() in each property or @IsOptional() to be recognized in request
export class CategoryCreateDto implements Prisma.CategoryUncheckedCreateInput {
  id?: string;
  name: string;
  description?: string;
  status?: $Enums.StatusEnum;
  created_at?: string | Date;
  updated_at?: string | Date;
  deleted_at?: string | Date;
  version?: number;
  supplier_id: string;
  products?: Prisma.ProductUncheckedCreateNestedManyWithoutCategoryInput;
}
