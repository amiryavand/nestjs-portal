import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  family: string;

  @IsString()
  @IsOptional()
  username: string;

  @IsString()
  @IsOptional()
  avatar: string;
}
