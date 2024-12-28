import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from 'src/database/prisma/prisma.module';

import { MongoService } from '../mongo/mongo.service';
import { LogRepository } from './log.repository';
import { LogService } from './log.service';

export const mockAuditLogModel = {
  provide: 'AuditLogModel',
  useValue: {},
};
@Module({
  providers: [LogService, LogRepository, MongoService, mockAuditLogModel],
  exports: [LogService, LogRepository],
  imports: [
    PrismaModule,
    // MongooseModule.forFeature([
    //   { name: AuditLogSchemaName, schema: AuditLogSchema },
    // ]),
  ],
})
export class LogModule {}
