import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { PrismaService } from '../../common/prisma/prisma.service';
import { HolidaysRegionDto } from './dto/holidays-region.dto';

@Injectable()
export class HolidaysService {
  constructor(private readonly prisma: PrismaService) {}

  async isWorkingDay(date: Date, region: string): Promise<boolean> {
    const dt = DateTime.fromJSDate(date, { zone: 'Europe/Madrid' });
    const weekday = dt.weekday; // 1 lunes
    if (weekday >= 6) {
      return false;
    }
    const holiday = await this.prisma.holiday.findUnique({
      where: {
        region_date: {
          region,
          date: dt.toISODate()
        }
      }
    });
    if (!holiday) {
      return true;
    }
    return holiday.isWorkingDay;
  }

  async list(region: string, year: number) {
    return this.prisma.holiday.findMany({
      where: {
        region,
        date: {
          gte: `${year}-01-01`,
          lte: `${year}-12-31`
        }
      },
      orderBy: { date: 'asc' }
    });
  }

  async upsertHoliday(data: HolidaysRegionDto) {
    return this.prisma.holiday.upsert({
      where: {
        region_date: {
          region: data.region,
          date: data.date
        }
      },
      update: {
        name: data.name,
        isWorkingDay: data.isWorkingDay
      },
      create: {
        region: data.region,
        date: data.date,
        name: data.name,
        isWorkingDay: data.isWorkingDay
      }
    });
  }
}
