import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserPayload } from 'src/auth/models/UserPayload';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Paginator } from 'src/utils/paginator';

import { BaseEntitySelect } from '../base/base.entity';
import { CrudType } from '../base/interfaces/ICrudTypeMap';
import { Paginated } from '../base/interfaces/IPaginated';
import { DefaultFilterFile } from './dto/request/file.filter.dto';
import { FileParamsResponseDto } from './dto/response/file.params.dto';
import { FileTypeMap } from './dto/type/file.type.map';
import { FileEntity } from './entity/file.entity';

@Injectable()
export class FileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFilteredAsync(
    entityName: FileParamsResponseDto,
    filter: DefaultFilterFile<FileTypeMap>,
    user?: UserPayload,
    transaction?: Prisma.TransactionClient,
  ): Promise<Paginated<Partial<FileEntity>>> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const AND: Record<string, any>[] = [];
    if (filter.search) {
      AND.push({
        OR: [{ name: { contains: filter.search, mode: 'insensitive' } }],
      });
    }
    if (entityName.entity_name) {
      AND.push({
        OR: [{ entity_name: entityName.entity_name }],
      });
    }
    if (filter.id) {
      AND.push({
        OR: [{ entity_id: { contains: filter.id } }],
      });
    }
    const prismaSelect: FileTypeMap[CrudType.SELECT] = {
      id: true,
      s3_path: true,
      file_name: true,
      file_type: true,
      entity_id: true,
    };

    return await Paginator.applyPagination(prisma.file, {
      ...filter,
      where: { AND },
      select: prismaSelect,
    });
  }
}
