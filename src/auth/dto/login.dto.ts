import {
  IsEmail,
  IsString,
  MinLength,
  IsNumber,
  ValidateIf,
} from 'class-validator';

export class LoginDTO {
  @ValidateIf(o => !o.username)
  @IsString()
  @IsEmail()
  email: string;

  @ValidateIf(o => !o.email)
  @IsString()
  username: string;

  @IsString()
  @MinLength(4)
  password: string;
}

export class OtpRequestDTO {
  @IsString()
  @IsEmail()
  email: string;
}

export class OtpLoginDTO extends OtpRequestDTO {
  @IsNumber()
  code: number;
}
