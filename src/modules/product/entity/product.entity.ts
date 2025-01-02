import { $Enums, Product } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { BaseEntity } from 'src/modules/base/base.entity';

// TODO-GENERATOR: IMPLEMENT THE INTERFACE
// TODO-GENERATOR: PUT THE @ApiProperty() in each property
export class ProductEntity extends BaseEntity implements Product {
  name: string;
  description: string;
  price: Decimal;
  code: string;
  validate: Date;
  local: string;
  bar_code: string;
  category_id: string;
}
