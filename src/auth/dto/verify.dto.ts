import { IsEmail, IsNumber } from 'class-validator';

export class VerifyDTO {
  @IsEmail()
  email: string;

  @IsNumber()
  code: number;
}
