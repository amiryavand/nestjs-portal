import { Module, CacheModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RateLimiterModule } from 'nestjs-rate-limiter';
import * as redisStore from 'cache-manager-redis-store';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthListener } from './auth.listener';
import { MailModule } from '../mail/mail.module';
import { UserEntity } from '../user/entities/user.entity';

@Module({
  providers: [AuthService, JwtStrategy, AuthListener],
  controllers: [AuthController],
  exports: [JwtStrategy],
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MailModule,
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT,
    }),
    RateLimiterModule,
  ],
})
export class AuthModule {}
