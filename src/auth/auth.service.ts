import { ResetPasswordDTO } from './dto/reset.dto';
import { VerifyDTO } from './dto/verify.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BadRequestException,
  CACHE_MANAGER,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO, OtpLoginDTO, OtpRequestDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { UserEntity } from '../user/entities/user.entity';
import { Cache } from 'cache-manager';
import { ForgetPasswordDTO } from './dto/forget.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
  ) {}

  async register(registerDTO: RegisterDTO) {
    try {
      const user = this.userRepository.create(registerDTO);
      await this.userRepository.save(user);
      await this.eventEmitter.emitAsync('auth.registered', user);
      return this.generateResponse(user);
    } catch (error) {
      if (error.code === '23505')
        throw new ConflictException('Username has already been taken.');
      throw new InternalServerErrorException();
    }
  }

  async login({ email, password, username }: LoginDTO) {
    const user = await this.checkUser(email, username);
    const isValid = await user.comparePassword(password);
    if (!isValid) throw new UnauthorizedException('Invalid Credentials');
    if (!user.email_verified_at)
      throw new UnauthorizedException('Email not verified');
    return this.generateResponse(user);
  }

  async verify({ email, code }: VerifyDTO) {
    const user = await this.checkUser(email);
    if (user.email_verified_at !== null)
      throw new BadRequestException('email has been already verified');

    await this.checkOtp(email, code, 'confirm');
    await this.invalidateOtpCode(email);

    await this.eventEmitter.emitAsync('auth.verified', user);
    return { message: 'email verified successfully' };
  }

  async forgetPassword({ email }: ForgetPasswordDTO) {
    const user = await this.checkUser(email);
    await this.eventEmitter.emitAsync('auth.forget', user);
    return { message: 'otp request submitted successfully' };
  }

  async resetPassword({ email, code, new_password }: ResetPasswordDTO) {
    await this.checkOtp(email, code, 'forget');
    const user = await this.checkUser(email);
    user.password = new_password;
    await user.save();
    await this.invalidateOtpCode(email, 'forget');
    return this.generateResponse(user);
  }

  async otpRequest({ email }: OtpRequestDTO) {
    const user = await this.checkUser(email);
    await this.eventEmitter.emitAsync('auth.otp.request', user);
    return { message: 'otp request submitted successfully' };
  }

  async otpLogin({ email, code }: OtpLoginDTO) {
    await this.checkOtp(email, code);
    const user = await this.checkUser(email);
    await this.invalidateOtpCode(email);
    return this.generateResponse(user);
  }

  private generateResponse(user: UserEntity) {
    const payload = { username: user.username };
    const token = this.jwtService.sign(payload);
    return { ...user.toJSON(), token };
  }

  private async checkUser(
    email: string,
    username: string = null,
  ): Promise<UserEntity> {
    const criteria = {};
    email
      ? (criteria['where'] = { email })
      : (criteria['where'] = { username });
    const user = await this.userRepository.findOne(criteria);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async checkOtp(
    email: string,
    code: number,
    key = 'otp',
  ): Promise<boolean> {
    const cachedCode: number = await this.cacheManager.get(
      `auth.${key}.${email}`,
    );
    if (!cachedCode) throw new BadRequestException('code is expired');
    if (code !== cachedCode) throw new BadRequestException('code is invalid');

    return true;
  }

  private async invalidateOtpCode(email: string, key = 'otp'): Promise<void> {
    await this.cacheManager.del(`auth.${key}.${email}`);
  }
}
