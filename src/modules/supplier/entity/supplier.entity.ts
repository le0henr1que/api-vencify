import { $Enums, Supplier } from '@prisma/client';
import { BaseEntity } from 'src/modules/base/base.entity';

// TODO-GENERATOR: IMPLEMENT THE INTERFACE
// TODO-GENERATOR: PUT THE @ApiProperty() in each property
export class SupplierEntity extends BaseEntity implements Supplier {
  name: string;
  contactInfo: string;
}
