import { $Enums, Prisma } from '@prisma/client';

// TODO-GENERATOR: INSERT THE DTO CREATE HERE
// TODO-GENERATOR: PUT THE @ApiProperty() in each property
// TODO-GENERATOR: PUT THE @IsNotEmpty() in each property or @IsOptional() to be recognized in request
export class BatchCreateDto implements Prisma.BatchUncheckedCreateInput {
  id?: string;
  product_id: string;
  quantity?: number;
  batchCode: string;
  expires_at?: string | Date;
  created_at?: string | Date;
  updated_at?: string | Date;
  deleted_at?: string | Date;
  supplier_id?: string;
  version?: number;
  status?: $Enums.StatusEnum;
}
