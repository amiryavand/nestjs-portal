import { IsEmail, IsString, IsNumber, MinLength } from 'class-validator';

export class ResetPasswordDTO {
  @IsEmail()
  email: string;

  @IsNumber()
  code: number;

  @IsString()
  @MinLength(4)
  new_password: string;
}
