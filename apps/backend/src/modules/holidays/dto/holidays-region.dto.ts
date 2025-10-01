import { IsBoolean, IsDateString, IsString } from 'class-validator';

export class HolidaysRegionDto {
  @IsString()
  region!: string;

  @IsDateString()
  date!: string;

  @IsString()
  name!: string;

  @IsBoolean()
  isWorkingDay!: boolean;
}
