import { $Enums, Category } from '@prisma/client';
import { BaseEntity } from 'src/modules/base/base.entity';

// TODO-GENERATOR: IMPLEMENT THE INTERFACE
// TODO-GENERATOR: PUT THE @ApiProperty() in each property
export class CategoryEntity extends BaseEntity implements Category {
  name: string;
  description: string;
  supplier_id: string;
}
