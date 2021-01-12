import { AuthService } from './auth.service';
import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { LoginDTO, OtpLoginDTO, OtpRequestDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { VerifyDTO } from './dto/verify.dto';
import { RateLimit, RateLimiterInterceptor } from 'nestjs-rate-limiter';
import { ForgetPasswordDTO } from './dto/forget.dto';
import { ResetPasswordDTO } from './dto/reset.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  async register(@Body() registerDTO: RegisterDTO) {
    return await this.authService.register(registerDTO);
  }

  @Post('/login')
  async login(@Body() loginDTO: LoginDTO) {
    return await this.authService.login(loginDTO);
  }

  @Post('/verify')
  async verify(@Body() verifyDTO: VerifyDTO) {
    return await this.authService.verify(verifyDTO);
  }

  @Post('/forget')
  @UseInterceptors(RateLimiterInterceptor)
  @RateLimit({
    keyPrefix: 'forget-request',
    duration: 60,
    points: 1,
    errorMessage: 'Accounts cannot be created more than once in per minute',
  })
  async forgetPassword(@Body() forgetDto: ForgetPasswordDTO) {
    return await this.authService.forgetPassword(forgetDto);
  }

  @Post('/reset')
  async resetPassword(@Body() resetDto: ResetPasswordDTO) {
    return await this.authService.resetPassword(resetDto);
  }

  @Post('/otp-request')
  @UseInterceptors(RateLimiterInterceptor)
  @RateLimit({
    keyPrefix: 'opt-request',
    duration: 60,
    points: 1,
    errorMessage: 'Accounts cannot be created more than once in per minute',
  })
  async otpRequest(@Body() otpDTO: OtpRequestDTO) {
    return await this.authService.otpRequest(otpDTO);
  }

  @Post('/otp-login')
  async otpLogin(@Body() otpDTO: OtpLoginDTO) {
    return await this.authService.otpLogin(otpDTO);
  }
}
