import { Injectable, CACHE_MANAGER, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { MailService } from './../mail/mail.service';
import { generateRandomKey } from './auth.utils';

@Injectable()
export class AuthListener {
  constructor(
    private mailService: MailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  @OnEvent('auth.registered')
  async userRegisteredEvent(user: UserEntity) {
    const otpCode = await this.cacheOtpCode(user.email, 'confirm');
    await this.mailService.sendConfirmationEmail(user, otpCode);
  }

  @OnEvent('auth.verified')
  async userVerifiedEvent(user: UserEntity) {
    await this.userRepository.update(user, { email_verified_at: new Date() });
    await this.mailService.sendWelcomeEmail(user);
  }

  @OnEvent('auth.forget')
  async forgetPasswordEvent(user: UserEntity) {
    const otpCode = await this.cacheOtpCode(user.email, 'forget');
    await this.mailService.sendOtpRequestEmail(user, otpCode);
  }

  @OnEvent('auth.otp.request')
  async userOtpRequestEvent(user: UserEntity) {
    const otpCode = await this.cacheOtpCode(user.email);
    await this.mailService.sendOtpRequestEmail(user, otpCode);
  }

  private async cacheOtpCode(email: string, key = 'otp'): Promise<number> {
    const otpCode = generateRandomKey();
    await this.cacheManager.set(`auth.${key}.${email}`, otpCode, {
      ttl: 1 * 60 * 60, // 1 hour
    });
    return otpCode;
  }
}
