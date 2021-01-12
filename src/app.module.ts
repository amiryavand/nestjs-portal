import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RBAcModule } from 'nestjs-rbac';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseConnectionService } from './db-connection.service';
import { HttpExceptionFilter } from './http-exception.filter';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { UserModule } from './user/user.module';
import { RBACstorage } from './rbac-storage.interface';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConnectionService,
    }),
    AuthModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
      },
    }),
    MailModule,
    EventEmitterModule.forRoot(),
    UserModule,
    RBAcModule.forRoot(RBACstorage),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
