import { AllocationsService } from '../src/modules/allocations/allocations.service';

const createMocks = () => {
  const prisma: any = {
    shift: {
      findMany: jest.fn()
    },
    vacationDay: {
      findMany: jest.fn()
    },
    monthlyAllocation: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    monthlyProjectAllocation: {
      deleteMany: jest.fn(),
      create: jest.fn()
    }
  };
  const holidaysService = {
    isWorkingDay: jest.fn().mockResolvedValue(true)
  };
  const vacationsService = {
    syncLeaves: jest.fn()
  };
  const settingsService = {
    getSettings: jest.fn().mockResolvedValue({ timezone: 'Europe/Madrid', holidaysRegion: 'ES-AN' })
  };
  const permissionsService = {
    getProjectsForUser: jest.fn().mockResolvedValue([{ projectId: 'project-1' }])
  };
  return { prisma, holidaysService, vacationsService, settingsService, permissionsService };
};

describe('AllocationsService', () => {
  it('calcula bolsa mensual con horas extra', async () => {
    const mocks = createMocks();
    const start = new Date('2024-03-15T07:00:00Z');
    const end = new Date('2024-03-15T16:00:00Z');
    mocks.prisma.shift.findMany.mockResolvedValue([
      {
        startEntry: { localDate: '2024-03-15', occurredAtUtc: start },
        endEntry: { occurredAtUtc: end }
      }
    ]);
    mocks.prisma.vacationDay.findMany.mockResolvedValue([]);
    mocks.prisma.monthlyAllocation.findUnique.mockResolvedValue(null);
    mocks.prisma.monthlyAllocation.create.mockImplementation(async ({ data }: any) => ({
      ...data,
      id: 'alloc',
      projects: []
    }));
    const service = new AllocationsService(
      mocks.prisma,
      mocks.holidaysService,
      mocks.vacationsService,
      mocks.settingsService,
      mocks.permissionsService
    );
    const { summary } = await service.getMonthlyAllocation('user', '2024-03');
    expect(summary.baseHours).toBeGreaterThanOrEqual(8);
    expect(summary.extraHours).toBeCloseTo(1);
  });

  it('valida suma de imputación', async () => {
    const mocks = createMocks();
    mocks.prisma.shift.findMany.mockResolvedValue([]);
    mocks.prisma.vacationDay.findMany.mockResolvedValue([]);
    mocks.prisma.monthlyAllocation.findUnique.mockResolvedValue({
      id: 'alloc',
      userId: 'user',
      month: '2024-03',
      baseHours: 8,
      extraHours: 0,
      finalized: false,
      projects: []
    });
    mocks.prisma.monthlyAllocation.update.mockResolvedValue({ finalized: true });
    const service = new AllocationsService(
      mocks.prisma,
      mocks.holidaysService,
      mocks.vacationsService,
      mocks.settingsService,
      mocks.permissionsService
    );
    await expect(
      service.finalizeAllocation(
        { id: 'user', email: '', name: '', role: 'EMPLOYEE' },
        '2024-03',
        [{ projectId: 'project-1', hours: 8 }]
      )
    ).resolves.toBeDefined();
  });
});
