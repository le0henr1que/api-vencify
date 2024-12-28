import { Module } from '@nestjs/common';
import { MockAuditLogModel } from './mock-audit-log.model';
import { MockMongoService } from './mock-mongo-service';
@Module({
  providers: [
    { provide: 'AuditLogModel', useClass: MockAuditLogModel },
    { provide: 'MongoService', useClass: MockMongoService },
  ],
  exports: ['AuditLogModel', 'MongoService'],
})
export class MongoModule {}
