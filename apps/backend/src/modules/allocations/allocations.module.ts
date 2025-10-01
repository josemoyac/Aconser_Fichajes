import { Module } from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { AllocationsController } from './allocations.controller';
import { ShiftsModule } from '../shifts/shifts.module';
import { HolidaysModule } from '../holidays/holidays.module';
import { VacationsModule } from '../vacations/vacations.module';
import { SettingsModule } from '../settings/settings.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [ShiftsModule, HolidaysModule, VacationsModule, SettingsModule, PermissionsModule],
  providers: [AllocationsService],
  controllers: [AllocationsController],
  exports: [AllocationsService]
})
export class AllocationsModule {}
