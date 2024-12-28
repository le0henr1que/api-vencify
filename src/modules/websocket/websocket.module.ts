import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma/prisma.module';

import { LogModule } from '../log/log.module';
import { MongoModule } from '../mongo/mong.module';
import { MongoService } from '../mongo/mongo.service';
import { WebsocketRepository } from './websocket.repository';
import { WebsocketService } from './websocket.service';
import { MockWebsocketModel } from '../mongo/mock-websocket.model';

@Module({
  imports: [LogModule, PrismaModule, MongoModule],
  controllers: [],
  providers: [
    WebsocketService,
    LogModule,
    WebsocketRepository,
    MongoService,
    { provide: 'WebsocketModel', useClass: MockWebsocketModel },
  ],
  exports: [WebsocketService, WebsocketRepository],
})
export class WebsocketModule {}
