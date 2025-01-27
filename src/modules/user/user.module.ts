import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
// import { MongooseModule } from '@nestjs/mongoose';
import { AuthRepository } from 'src/auth/auth.repository';
import { AuthService } from 'src/auth/auth.service';
import { PrismaModule } from 'src/database/prisma/prisma.module';

import { EmailService } from '../email/email.service';
import { LogModule, mockAuditLogModel } from '../log/log.module';
import { MongoService } from '../mongo/mongo.service';
import { WebsocketSchema, WebsocketSchemaName } from '../mongo/websocket.model';
import { WebsocketModule } from '../websocket/websocket.module';
import { UserController } from './user.controller';
import { UserMapping } from './user.mapping';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { StripeModule } from '../stripe/stripe.module';
import { WebsocketService } from '../websocket/websocket.service';
import { MockWebsocketModel } from '../mongo/mock-websocket.model';
import { MockMongoService } from '../mongo/mock-mongo-service';
import { FileService } from '../file/file.service';
import { FileModule } from '../file/file.module';
import { LocalService } from '../aws/multer';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    AuthService,
    UserMapping,
    UserRepository,
    AuthRepository,
    EmailService,
    MongoService,
    MockMongoService,
    LocalService,
    { provide: 'WebsocketModel', useClass: MockWebsocketModel },
  ],
  imports: [
    PrismaModule,
    JwtModule,
    LogModule,
    WebsocketModule,
    FileModule,
    // MongooseModule.forFeature([
    //   { name: WebsocketSchemaName, schema: WebsocketSchema },
    // ]),
    StripeModule,
  ],
  exports: [UserService, UserRepository],
})
export class UserModule {}
