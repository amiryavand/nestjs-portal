import {
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  family: string;

  @IsEmail()
  email: string;

  @IsString()
  mobile: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsString()
  @IsOptional()
  username: string;
}
