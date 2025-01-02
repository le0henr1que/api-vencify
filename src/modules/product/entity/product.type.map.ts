import { Prisma } from '@prisma/client';

import { CrudTypeMap } from '../../base/interfaces/ICrudTypeMap';

export class ProductTypeMap implements CrudTypeMap {
  aggregate: Prisma.ProductAggregateArgs;
  count: Prisma.ProductCountArgs;
  create: Prisma.ProductCreateInput;
  createUnchecked: Prisma.ProductUncheckedCreateInput;
  delete: Prisma.ProductDeleteArgs;
  deleteMany: Prisma.ProductDeleteManyArgs;
  findFirst: Prisma.ProductFindFirstArgs;
  findMany: Prisma.ProductFindManyArgs;
  findUnique: Prisma.ProductFindUniqueArgs;
  update: Prisma.ProductUpdateInput;
  updateMany: Prisma.ProductUpdateManyArgs;
  upsert: Prisma.ProductUpsertArgs;
  where: Prisma.ProductWhereInput;
  select: Prisma.ProductSelect;
  orderBy: Prisma.ProductOrderByWithRelationInput;
}
