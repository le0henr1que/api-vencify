import { Prisma } from "@prisma/client";
import { CrudTypeMap } from "src/modules/base/interfaces/ICrudTypeMap";

export class FileTypeMap implements CrudTypeMap {
  aggregate: Prisma.FileAggregateArgs;
  count: Prisma.FileCountArgs;
  create: Prisma.FileCreateInput;
  createUnchecked: Prisma.FileUncheckedCreateInput;
  delete: Prisma.FileDeleteArgs;
  deleteMany: Prisma.FileDeleteManyArgs;
  findFirst: Prisma.FileFindFirstArgs;
  findMany: Prisma.FileFindManyArgs;
  findUnique: Prisma.FileFindUniqueArgs;
  update: Prisma.FileUpdateInput;
  updateMany: Prisma.FileUpdateManyArgs;
  upsert: Prisma.FileUpsertArgs;
  where: Prisma.FileWhereInput;
  select: Prisma.FileSelect;
  orderBy: Prisma.FileOrderByWithRelationInput;
}
