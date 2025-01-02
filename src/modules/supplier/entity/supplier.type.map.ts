import { Prisma } from '@prisma/client';

import { CrudTypeMap } from '../../base/interfaces/ICrudTypeMap';

export class SupplierTypeMap implements CrudTypeMap {
  aggregate: Prisma.SupplierAggregateArgs;
  count: Prisma.SupplierCountArgs;
  create: Prisma.SupplierCreateInput;
  createUnchecked: Prisma.SupplierUncheckedCreateInput;
  delete: Prisma.SupplierDeleteArgs;
  deleteMany: Prisma.SupplierDeleteManyArgs;
  findFirst: Prisma.SupplierFindFirstArgs;
  findMany: Prisma.SupplierFindManyArgs;
  findUnique: Prisma.SupplierFindUniqueArgs;
  update: Prisma.SupplierUpdateInput;
  updateMany: Prisma.SupplierUpdateManyArgs;
  upsert: Prisma.SupplierUpsertArgs;
  where: Prisma.SupplierWhereInput;
  select: Prisma.SupplierSelect;
  orderBy: Prisma.SupplierOrderByWithRelationInput;
}
