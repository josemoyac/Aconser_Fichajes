import { Module } from '@nestjs/common';
import { TimeEntriesService } from './time-entries.service';
import { TimeEntriesController } from './time-entries.controller';
import { ShiftsModule } from '../shifts/shifts.module';
import { HolidaysModule } from '../holidays/holidays.module';
import { VacationsModule } from '../vacations/vacations.module';
import { SettingsModule } from '../settings/settings.module';
import { IdempotencyModule } from '../idempotency/idempotency.module';

@Module({
  imports: [ShiftsModule, HolidaysModule, VacationsModule, SettingsModule, IdempotencyModule],
  providers: [TimeEntriesService],
  controllers: [TimeEntriesController],
  exports: [TimeEntriesService]
})
export class TimeEntriesModule {}
