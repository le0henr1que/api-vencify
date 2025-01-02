import { PrismaModule } from '../../database/prisma/prisma.module';
import { BatchController } from './batch.controller';
import { BatchMapping } from './batch.mapping';
import { BatchRepository } from './batch.repository';
import { BatchService } from './batch.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [BatchController],
  providers: [BatchService, BatchMapping, BatchRepository],
  imports: [PrismaModule],
  exports: [BatchService, BatchRepository],
})
export class BatchModule {}
