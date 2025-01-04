import { $Enums, Organization } from '@prisma/client';
import { BaseEntity } from 'src/modules/base/base.entity';

// TODO-GENERATOR: IMPLEMENT THE INTERFACE
// TODO-GENERATOR: PUT THE @ApiProperty() in each property
export class OrganizationEntity extends BaseEntity implements Organization {
  created_at: Date;
  deleted_at: Date;
  updated_at: Date;
  address_id: string;
  ownerId: string;
  name: string;
}
