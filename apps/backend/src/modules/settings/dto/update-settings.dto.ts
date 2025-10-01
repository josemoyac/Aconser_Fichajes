import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsNumber()
  retroEditDaysLimit?: number;

  @IsOptional()
  @IsNumber()
  auditRetentionDays?: number;

  @IsOptional()
  @IsBoolean()
  pwaEnabled?: boolean;

  @IsOptional()
  @IsString()
  holidaysRegion?: string;
}
