import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { TimeEntrySource, TimeEntryType } from '@prisma/client';

export class CreateTimeEntryDto {
  @IsEnum(TimeEntryType)
  type!: TimeEntryType;

  @IsOptional()
  @IsISO8601()
  occurredAt?: string;

  @IsOptional()
  @IsEnum(TimeEntrySource)
  source?: TimeEntrySource;

  @IsOptional()
  @IsString()
  notes?: string;
}
