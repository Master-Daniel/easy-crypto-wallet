import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAdminSettingDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsString()
  value: string;
}
