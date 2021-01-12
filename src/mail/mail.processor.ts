import { UserEntity } from '../user/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { plainToClass } from 'class-transformer';

@Processor('mail')
export class MailProcessor {
  private logger = new Logger(MailProcessor.name);
  constructor(private readonly mailerService: MailerService) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(
      `Processing job ${job.id} of type ${job.name}. Data: ${JSON.stringify(
        job.data,
      )}`,
    );
  }

  @OnQueueCompleted()
  onComplete(job: Job, result: any) {
    this.logger.debug(
      `Completed job ${job.id} of type ${job.name}. Result: ${JSON.stringify(
        result,
      )}`,
    );
  }

  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name}: ${error.message}`,
      error.stack,
    );
  }

  @Process('confirmation')
  async sendConfirmationEmail(job: Job<{ user: UserEntity; code: number }>) {
    this.logger.debug(`Sending confirmation email to: ${job.data.user.email}`);

    try {
      const result = await this.mailerService.sendMail({
        template: 'confirmation',
        context: {
          ...job.data.user,
          code: job.data.code,
        },
        subject: `Welcome to Mahestan! Please Confirm Your Email Address`,
        to: job.data.user.email,
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send confirmation email to '${job.data.user.email}'`,
        error.stack,
      );
      throw error;
    }
  }

  @Process('welcome')
  async sendWelcomeEmail(job: Job<{ user: UserEntity }>) {
    this.logger.debug(`Sending welcome email to: ${job.data.user.email}`);

    try {
      const result = await this.mailerService.sendMail({
        template: 'welcome',
        context: {
          ...job.data.user,
        },
        subject: `Welcome to Mahestan!`,
        to: job.data.user.email,
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to '${job.data.user.email}'`,
        error.stack,
      );
      throw error;
    }
  }

  @Process('otprequest')
  async sendOtpRequestEmail(job: Job<{ user: UserEntity; code: number }>) {
    this.logger.debug(`Sending otp request email to: ${job.data.user.email}`);

    try {
      const result = await this.mailerService.sendMail({
        template: 'otp',
        context: {
          ...job.data.user,
          code: job.data.code
        },
        subject: `Mahestan - OTP Request`,
        to: job.data.user.email,
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send otp request email to '${job.data.user.email}'`,
        error.stack,
      );
      throw error;
    }
  }
}
