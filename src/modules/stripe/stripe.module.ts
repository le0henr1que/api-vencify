import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { PlanRepository } from '../plan/plan.repository';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { LogModule } from '../log/log.module';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { WebsocketModule } from '../websocket/websocket.module';
// import { MongooseModule } from '@nestjs/mongoose';
import { WebsocketSchema, WebsocketSchemaName } from '../mongo/websocket.model';
import { PlanModule } from '../plan/plan.module';
import { EmailModule } from '../email/email.module';
import { MongoModule } from '../mongo/mong.module';
import { MongoService } from '../mongo/mongo.service';
import { MockWebsocketModel } from '../mongo/mock-websocket.model';

@Module({
  controllers: [StripeController],
  providers: [
    StripeService,
    PlanRepository,
    PrismaService,
    AuthService,
    MongoService,
    { provide: 'WebsocketModel', useClass: MockWebsocketModel },
  ],
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    LogModule,
    forwardRef(() => UserModule),
    JwtModule,
    PlanModule,
    EmailModule,
    WebsocketModule,
    // MongooseModule.forFeature([
    //   { name: WebsocketSchemaName, schema: WebsocketSchema },
    // ]),
    // MongooseModule,
    MongoModule,
  ],
  exports: [StripeService],
})
export class StripeModule {}
