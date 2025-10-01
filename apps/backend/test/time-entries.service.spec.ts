import { BadRequestException } from '@nestjs/common';
import { TimeEntriesService } from '../src/modules/time-entries/time-entries.service';
import { TimeEntrySource, TimeEntryType } from '@prisma/client';

const createMocks = () => {
  const prisma: any = {
    timeEntry: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    },
    shift: {
      findFirst: jest.fn()
    }
  };
  const idempotency = {
    execute: jest.fn((key: string | undefined, handler: () => Promise<unknown>) => handler())
  };
  const shiftsService = {
    openShift: jest.fn(),
    closeShift: jest.fn(),
    recalculateShift: jest.fn(),
    getOpenShift: jest.fn()
  };
  const vacationsService = {
    hasApprovedLeave: jest.fn().mockResolvedValue(false)
  };
  const settingsService = {
    getSettings: jest.fn().mockResolvedValue({ retroEditDaysLimit: 30 })
  };
  return { prisma, idempotency, shiftsService, vacationsService, settingsService };
};

describe('TimeEntriesService', () => {
  it('impide fichar en día de vacaciones', async () => {
    const mocks = createMocks();
    mocks.vacationsService.hasApprovedLeave.mockResolvedValue(true);
    const service = new TimeEntriesService(
      mocks.prisma,
      mocks.idempotency,
      mocks.shiftsService,
      mocks.vacationsService,
      mocks.settingsService
    );
    await expect(
      service.create(
        { id: 'user', email: '', name: '', role: 'EMPLOYEE' },
        { type: TimeEntryType.IN, source: TimeEntrySource.WEB },
        'key'
      )
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('usa idempotencia para doble click', async () => {
    const mocks = createMocks();
    mocks.prisma.timeEntry.create.mockResolvedValue({ id: 'entry', userId: 'user' });
    const service = new TimeEntriesService(
      mocks.prisma,
      mocks.idempotency,
      mocks.shiftsService,
      mocks.vacationsService,
      mocks.settingsService
    );
    await service.create(
      { id: 'user', email: '', name: '', role: 'EMPLOYEE' },
      { type: TimeEntryType.IN, source: TimeEntrySource.WEB },
      'duplicate'
    );
    expect(mocks.idempotency.execute).toHaveBeenCalledWith('duplicate', expect.any(Function));
  });

  it('bloquea edición fuera del límite retroactivo', async () => {
    const mocks = createMocks();
    const pastDate = new Date('2020-01-01T08:00:00Z');
    mocks.prisma.timeEntry.findUnique.mockResolvedValue({
      id: 'entry',
      userId: 'user',
      type: TimeEntryType.IN,
      source: TimeEntrySource.WEB,
      occurredAtLocal: pastDate,
      notes: null
    });
    const service = new TimeEntriesService(
      mocks.prisma,
      mocks.idempotency,
      mocks.shiftsService,
      mocks.vacationsService,
      mocks.settingsService
    );
    await expect(
      service.update(
        { id: 'user', email: '', name: '', role: 'EMPLOYEE' },
        'entry',
        { notes: 'tarde' }
      )
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
