import { $Enums, Prisma } from '@prisma/client';

// TODO-GENERATOR: INSERT THE DTO CREATE HERE
// TODO-GENERATOR: PUT THE @ApiProperty() in each property
// TODO-GENERATOR: PUT THE @IsNotEmpty() in each property or @IsOptional() to be recognized in request
export class SupplierCreateDto implements Prisma.SupplierUncheckedCreateInput {
  id?: string;
  name: string;
  contactInfo?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
  deleted_at?: string | Date;
  version?: number;
  status?: $Enums.StatusEnum;
  batches?: Prisma.BatchUncheckedCreateNestedManyWithoutSupplierInput;
  Category?: Prisma.CategoryUncheckedCreateNestedManyWithoutSupplierInput;
}
