import { IsBoolean } from 'class-validator';

export class UpdateDepositStatusDto {
  @IsBoolean()
  status: boolean;
}
