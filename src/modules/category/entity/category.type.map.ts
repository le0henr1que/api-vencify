import { Prisma } from '@prisma/client';

import { CrudTypeMap } from '../../base/interfaces/ICrudTypeMap';

export class CategoryTypeMap implements CrudTypeMap {
  aggregate: Prisma.CategoryAggregateArgs;
  count: Prisma.CategoryCountArgs;
  create: Prisma.CategoryCreateInput;
  createUnchecked: Prisma.CategoryUncheckedCreateInput;
  delete: Prisma.CategoryDeleteArgs;
  deleteMany: Prisma.CategoryDeleteManyArgs;
  findFirst: Prisma.CategoryFindFirstArgs;
  findMany: Prisma.CategoryFindManyArgs;
  findUnique: Prisma.CategoryFindUniqueArgs;
  update: Prisma.CategoryUpdateInput;
  updateMany: Prisma.CategoryUpdateManyArgs;
  upsert: Prisma.CategoryUpsertArgs;
  where: Prisma.CategoryWhereInput;
  select: Prisma.CategorySelect;
  orderBy: Prisma.CategoryOrderByWithRelationInput;
}
