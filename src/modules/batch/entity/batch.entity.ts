import { $Enums, Batch } from '@prisma/client';
import { BaseEntity } from 'src/modules/base/base.entity';

// TODO-GENERATOR: IMPLEMENT THE INTERFACE
// TODO-GENERATOR: PUT THE @ApiProperty() in each property
export class BatchEntity extends BaseEntity implements Batch {
  product_id: string;
  quantity: number;
  batchCode: string;
  expires_at: Date;
  supplier_id: string;
}
