import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
// import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { EmailService } from 'src/modules/email/email.service';
import { LogModule } from 'src/modules/log/log.module';
import { MongoModule } from 'src/modules/mongo/mong.module';
import { MongoService } from 'src/modules/mongo/mongo.service';
import { UserRepository } from 'src/modules/user/user.repository';
import { UserService } from 'src/modules/user/user.service';
import { WebsocketModule } from 'src/modules/websocket/websocket.module';

import { FileModule } from 'src/modules/file/file.module';
import { MockWebsocketModel } from 'src/modules/mongo/mock-websocket.model';
import { PlanModule } from 'src/modules/plan/plan.module';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { AtStrategy } from './strategies/at.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RtStrategy } from './strategies/rt.strategy';
import { LocalService } from 'src/modules/aws/multer';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    LocalStrategy,
    AtStrategy,
    RtStrategy,
    UserService,
    UserRepository,
    EmailService,
    MongoService,
    { provide: 'WebsocketModel', useClass: MockWebsocketModel },
    LocalService,
  ],
  imports: [
    PrismaModule,
    JwtModule,
    LogModule,
    PlanModule,
    WebsocketModule,
    MongoModule,
  ],
  exports: [AuthService, AuthRepository],
})
export class AuthModule {}
