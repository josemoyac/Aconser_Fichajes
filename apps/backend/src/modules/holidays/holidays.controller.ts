import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { HolidaysRegionDto } from './dto/holidays-region.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('holidays')
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Get()
  async list(@Query('region') region = 'ES-AN', @Query('year') year?: string) {
    const parsedYear = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.holidaysService.list(region, parsedYear);
  }

  @Post()
  @Roles(Role.ADMIN)
  async upsert(@Body() dto: HolidaysRegionDto) {
    return this.holidaysService.upsertHoliday(dto);
  }
}
