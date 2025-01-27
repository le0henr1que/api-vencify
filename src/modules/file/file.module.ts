import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma/prisma.module';
import { S3Service } from '../aws/s3';
import { FileController } from './file.controller';
import { FileMapping } from './file.mapping';
import { FileRepository } from './file.repository';
import { FileService } from './file.service';
import { LocalService } from '../aws/multer';

@Module({
  controllers: [FileController],
  providers: [FileService, FileMapping, FileRepository, LocalService],
  imports: [PrismaModule],
  exports: [FileService, FileRepository],
})
export class FileModule {}
