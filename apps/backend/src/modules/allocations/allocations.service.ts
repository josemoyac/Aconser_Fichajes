import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DateTime } from 'luxon';
import { HolidaysService } from '../holidays/holidays.service';
import { VacationsService } from '../vacations/vacations.service';
import { SettingsService } from '../settings/settings.service';
import { PermissionsService } from '../permissions/permissions.service';
import { AuthenticatedUser } from '../auth/auth.service';

@Injectable()
export class AllocationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly holidaysService: HolidaysService,
    private readonly vacationsService: VacationsService,
    private readonly settingsService: SettingsService,
    private readonly permissionsService: PermissionsService
  ) {}

  async getMonthlyAllocation(userId: string, month: string) {
    const summary = await this.calculateMonthlySummary(userId, month);
    let allocation = await this.prisma.monthlyAllocation.findUnique({
      where: {
        userId_month: {
          userId,
          month
        }
      },
      include: {
        projects: true
      }
    });
    if (!allocation) {
      allocation = await this.prisma.monthlyAllocation.create({
        data: {
          userId,
          month,
          baseHours: summary.baseHours,
          extraHours: summary.extraHours,
          finalized: false
        },
        include: { projects: true }
      });
    } else if (!allocation.finalized) {
      allocation = await this.prisma.monthlyAllocation.update({
        where: { id: allocation.id },
        data: {
          baseHours: summary.baseHours,
          extraHours: summary.extraHours
        },
        include: { projects: true }
      });
    }
    return { allocation, summary };
  }

  async finalizeAllocation(
    user: AuthenticatedUser,
    month: string,
    projectHours: { projectId: string; hours: number }[]
  ) {
    const { allocation, summary } = await this.getMonthlyAllocation(user.id, month);
    if (allocation.finalized) {
      throw new BadRequestException('La imputación ya está finalizada');
    }
    const total = projectHours.reduce((acc, item) => acc + item.hours, 0);
    const expected = Number(summary.baseHours + summary.extraHours);
    if (Math.abs(total - expected) > 0.01) {
      throw new BadRequestException('La suma debe coincidir con la bolsa total');
    }
    const permissions = await this.permissionsService.getProjectsForUser(user.id);
    const allowedIds = new Set(permissions.map((perm) => perm.projectId));
    for (const project of projectHours) {
      if (!allowedIds.has(project.projectId)) {
        throw new BadRequestException('Proyecto no permitido');
      }
    }
    await this.prisma.monthlyProjectAllocation.deleteMany({ where: { monthlyAllocationId: allocation.id } });
    for (const project of projectHours) {
      await this.prisma.monthlyProjectAllocation.create({
        data: {
          monthlyAllocationId: allocation.id,
          projectId: project.projectId,
          hours: project.hours
        }
      });
    }
    return this.prisma.monthlyAllocation.update({
      where: { id: allocation.id },
      data: {
        finalized: true,
        finalizedAt: new Date()
      },
      include: { projects: true }
    });
  }

  async calculateMonthlySummary(userId: string, month: string) {
    const settings = await this.settingsService.getSettings();
    const [year, monthPart] = month.split('-').map((part) => parseInt(part, 10));
    const start = DateTime.fromObject({ year, month: monthPart, day: 1 }, { zone: settings.timezone });
    const end = start.endOf('month');
    const shifts = await this.prisma.shift.findMany({
      where: {
        userId,
        startEntry: {
          localDate: {
            gte: start.toISODate(),
            lte: end.toISODate()
          }
        }
      },
      include: {
        startEntry: true,
        endEntry: true
      }
    });
    const vacations = await this.prisma.vacationDay.findMany({
      where: {
        userId,
        date: {
          gte: start.toISODate(),
          lte: end.toISODate()
        },
        approved: true
      }
    });
    const vacationSet = new Set(vacations.map((v) => v.date));
    let baseHours = 0;
    let extraHours = 0;
    const days: { date: string; baseHours: number; extraHours: number; presenceHours: number }[] = [];
    for (let current = start; current.toMillis() <= end.toMillis(); current = current.plus({ days: 1 })) {
      const date = current.toISODate();
      let dailyBase = 0;
      let dailyExtra = 0;
      let presenceMinutes = 0;
      const dayShifts = shifts.filter((shift) => shift.startEntry.localDate === date);
      for (const shift of dayShifts) {
        const startDt = DateTime.fromJSDate(shift.startEntry.occurredAtUtc);
        const endDt = shift.endEntry
          ? DateTime.fromJSDate(shift.endEntry.occurredAtUtc)
          : startDt;
        presenceMinutes += Math.max(Math.round(endDt.diff(startDt, 'minutes').minutes), 0);
      }
      const presenceHours = presenceMinutes / 60;
      if (vacationSet.has(date)) {
        dailyBase = 8;
        dailyExtra = Math.max(0, presenceHours);
      } else {
        const isWorkingDay = await this.holidaysService.isWorkingDay(current.toJSDate(), settings.holidaysRegion);
        if (isWorkingDay) {
          dailyBase = 8;
          dailyExtra = Math.max(0, presenceHours - 8);
        } else {
          dailyBase = 0;
          dailyExtra = Math.max(0, presenceHours);
        }
      }
      baseHours += dailyBase;
      extraHours += dailyExtra;
      days.push({ date, baseHours: dailyBase, extraHours: dailyExtra, presenceHours });
    }
    return { baseHours, extraHours, days };
  }

  async getReport(month: string) {
    return this.prisma.monthlyAllocation.findMany({
      where: { month },
      include: {
        user: true,
        projects: { include: { project: true } }
      }
    });
  }
}
