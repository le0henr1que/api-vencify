import { Prisma } from '@prisma/client';

import { CrudTypeMap } from '../../base/interfaces/ICrudTypeMap';

export class BatchTypeMap implements CrudTypeMap {
  aggregate: Prisma.BatchAggregateArgs;
  count: Prisma.BatchCountArgs;
  create: Prisma.BatchCreateInput;
  createUnchecked: Prisma.BatchUncheckedCreateInput;
  delete: Prisma.BatchDeleteArgs;
  deleteMany: Prisma.BatchDeleteManyArgs;
  findFirst: Prisma.BatchFindFirstArgs;
  findMany: Prisma.BatchFindManyArgs;
  findUnique: Prisma.BatchFindUniqueArgs;
  update: Prisma.BatchUpdateInput;
  updateMany: Prisma.BatchUpdateManyArgs;
  upsert: Prisma.BatchUpsertArgs;
  where: Prisma.BatchWhereInput;
  select: Prisma.BatchSelect;
  orderBy: Prisma.BatchOrderByWithRelationInput;
}
