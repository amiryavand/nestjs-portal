import { UserEntity } from '../user/entities/user.entity';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class MailService {
  constructor(@InjectQueue('mail') private mailQueue: Queue) {}

  async sendConfirmationEmail(
    user: UserEntity,
    code: number,
  ): Promise<boolean> {
    try {
      await this.mailQueue.add('confirmation', { code, user });
      return true;
    } catch (error) {
      // this.logger.error(`Error queueing confirmation email to user ${user.email}`)
      return false;
    }
  }

  async sendWelcomeEmail(user: UserEntity): Promise<boolean> {
    try {
      await this.mailQueue.add('welcome', { user });
      return true;
    } catch (error) {
      // this.logger.error(`Error queueing confirmation email to user ${user.email}`)
      return false;
    }
  }

  async sendOtpRequestEmail(user: UserEntity, code: number): Promise<boolean> {
    try {
      await this.mailQueue.add('otprequest', { user, code });
      return true;
    } catch (error) {
      // this.logger.error(`Error queueing confirmation email to user ${user.email}`)
      return false;
    }
  }
}
