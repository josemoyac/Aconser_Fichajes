import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DateTime } from 'luxon';
import { ShiftStatus } from '@prisma/client';

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOpenShift(userId: string) {
    return this.prisma.shift.findFirst({
      where: { userId, status: ShiftStatus.OPEN },
      orderBy: { createdAt: 'desc' }
    });
  }

  async openShift(userId: string, startEntryId: string) {
    const existing = await this.getOpenShift(userId);
    if (existing) {
      throw new BadRequestException('Ya existe un turno abierto');
    }
    return this.prisma.shift.create({
      data: {
        userId,
        startEntryId,
        status: ShiftStatus.OPEN
      }
    });
  }

  async closeShift(userId: string, shiftId: string, endEntryId: string) {
    const shift = await this.prisma.shift.findUnique({ where: { id: shiftId }, include: { startEntry: true } });
    if (!shift || shift.userId !== userId) {
      throw new BadRequestException('Turno no encontrado');
    }
    const endEntry = await this.prisma.timeEntry.findUnique({ where: { id: endEntryId } });
    if (!endEntry) {
      throw new BadRequestException('Fichaje de salida no encontrado');
    }
    const startDate = DateTime.fromJSDate(shift.startEntry.occurredAtUtc);
    const endDate = DateTime.fromJSDate(endEntry.occurredAtUtc);
    if (endDate < startDate) {
      throw new BadRequestException('La salida no puede ser anterior a la entrada');
    }
    const duration = Math.max(Math.round(endDate.diff(startDate, 'minutes').minutes), 0);
    return this.prisma.shift.update({
      where: { id: shiftId },
      data: {
        endEntryId,
        status: ShiftStatus.CLOSED,
        durationMinutes: duration
      }
    });
  }

  async recalculateShift(shiftId: string): Promise<void> {
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
      include: { startEntry: true, endEntry: true }
    });
    if (!shift || !shift.startEntry || !shift.endEntry) {
      return;
    }
    const startDate = DateTime.fromJSDate(shift.startEntry.occurredAtUtc);
    const endDate = DateTime.fromJSDate(shift.endEntry.occurredAtUtc);
    const duration = Math.max(Math.round(endDate.diff(startDate, 'minutes').minutes), 0);
    await this.prisma.shift.update({
      where: { id: shiftId },
      data: {
        durationMinutes: duration,
        status: ShiftStatus.CLOSED
      }
    });
  }

  async listShifts(userId: string, month: string) {
    const [year, monthPart] = month.split('-').map((part) => parseInt(part, 10));
    const start = DateTime.fromObject({ year, month: monthPart, day: 1 }, { zone: 'Europe/Madrid' });
    const end = start.endOf('month');
    return this.prisma.shift.findMany({
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
      },
      orderBy: { createdAt: 'asc' }
    });
  }
}
