import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { AuthenticatedUser } from '../auth/auth.service';
import { IdempotencyService } from '../idempotency/idempotency.service';
import { TimeEntrySource, TimeEntryType } from '@prisma/client';
import { DateTime } from 'luxon';
import { ShiftsService } from '../shifts/shifts.service';
import { VacationsService } from '../vacations/vacations.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class TimeEntriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idempotency: IdempotencyService,
    private readonly shiftsService: ShiftsService,
    private readonly vacationsService: VacationsService,
    private readonly settingsService: SettingsService
  ) {}

  list(userId: string, from: string, to: string) {
    return this.prisma.timeEntry.findMany({
      where: {
        userId,
        localDate: {
          gte: from,
          lte: to
        }
      },
      orderBy: { occurredAtUtc: 'asc' }
    });
  }

  async create(
    user: AuthenticatedUser,
    dto: CreateTimeEntryDto,
    idempotencyKey?: string
  ) {
    return this.idempotency.execute(idempotencyKey, async () => {
      const occurredAtLocal = dto.occurredAt
        ? DateTime.fromISO(dto.occurredAt, { zone: 'Europe/Madrid' })
        : DateTime.now().setZone('Europe/Madrid');
      const hasLeave = await this.vacationsService.hasApprovedLeave(user.id, occurredAtLocal.toJSDate());
      if (hasLeave) {
        throw new BadRequestException('No se puede fichar en un día de vacaciones aprobado');
      }
      const localDate = occurredAtLocal.toISODate();
      const occurredAtUtc = occurredAtLocal.toUTC();
      const entry = await this.prisma.timeEntry.create({
        data: {
          userId: user.id,
          type: dto.type,
          source: dto.source ?? TimeEntrySource.WEB,
          occurredAtUtc: occurredAtUtc.toJSDate(),
          occurredAtLocal: occurredAtLocal.toJSDate(),
          localDate,
          notes: dto.notes ?? null,
          createdBy: user.id,
          idempotencyKey: idempotencyKey ?? null
        }
      });
      if (dto.type === TimeEntryType.IN) {
        await this.shiftsService.openShift(user.id, entry.id);
      } else {
        const openShift = await this.shiftsService.getOpenShift(user.id);
        if (!openShift) {
          throw new BadRequestException('No existe turno abierto para cerrar');
        }
        await this.shiftsService.closeShift(user.id, openShift.id, entry.id);
      }
      return entry;
    });
  }

  async update(user: AuthenticatedUser, id: string, dto: UpdateTimeEntryDto) {
    const entry = await this.prisma.timeEntry.findUnique({ where: { id } });
    if (!entry || entry.userId !== user.id) {
      throw new BadRequestException('Fichaje no encontrado');
    }
    const settings = await this.settingsService.getSettings();
    const entryDate = DateTime.fromJSDate(entry.occurredAtLocal);
    const diffDays = Math.abs(entryDate.diffNow('days').days);
    if (diffDays > settings.retroEditDaysLimit) {
      throw new BadRequestException('Fuera del límite de edición retroactiva');
    }
    let occurredAtLocal = entryDate;
    if (dto.occurredAt) {
      occurredAtLocal = DateTime.fromISO(dto.occurredAt, { zone: 'Europe/Madrid' });
      const hasLeave = await this.vacationsService.hasApprovedLeave(user.id, occurredAtLocal.toJSDate());
      if (hasLeave) {
        throw new BadRequestException('No se puede mover a un día con vacaciones aprobadas');
      }
    }
    const updated = await this.prisma.timeEntry.update({
      where: { id },
      data: {
        type: dto.type ?? entry.type,
        source: dto.source ?? entry.source,
        occurredAtUtc: occurredAtLocal.toUTC().toJSDate(),
        occurredAtLocal: occurredAtLocal.toJSDate(),
        localDate: occurredAtLocal.toISODate(),
        notes: dto.notes ?? entry.notes
      }
    });
    const shift = await this.prisma.shift.findFirst({
      where: {
        OR: [{ startEntryId: id }, { endEntryId: id }]
      }
    });
    if (shift) {
      await this.shiftsService.recalculateShift(shift.id);
    }
    return updated;
  }
}
