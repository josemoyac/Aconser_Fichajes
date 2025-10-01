import { PrismaClient, ProjectSource, Role, TimeEntrySource, TimeEntryType } from '@prisma/client';
import { DateTime } from 'luxon';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();
  await prisma.project.deleteMany();
  await prisma.employeeProjectPermission.deleteMany();
  await prisma.holiday.deleteMany();
  await prisma.leaveType.deleteMany();
  await prisma.vacationDay.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: 'admin@aconser.com',
      name: 'Admin Aconser',
      role: Role.ADMIN,
      oidcSub: 'mock-admin'
    }
  });

  const employee1 = await prisma.user.create({
    data: {
      email: 'empleado1@aconser.com',
      name: 'Empleado Uno',
      role: Role.EMPLOYEE,
      oidcSub: 'mock-emp1'
    }
  });

  const employee2 = await prisma.user.create({
    data: {
      email: 'empleado2@aconser.com',
      name: 'Empleado Dos',
      role: Role.EMPLOYEE,
      oidcSub: 'mock-emp2'
    }
  });

  const projectAlpha = await prisma.project.create({
    data: {
      externalId: 'BC-100',
      code: 'ALPHA',
      name: 'Proyecto Alpha',
      source: ProjectSource.BC
    }
  });

  const projectBeta = await prisma.project.create({
    data: {
      externalId: 'BC-200',
      code: 'BETA',
      name: 'Proyecto Beta',
      source: ProjectSource.BC
    }
  });

  await prisma.employeeProjectPermission.createMany({
    data: [
      { userId: employee1.id, projectId: projectAlpha.id },
      { userId: employee1.id, projectId: projectBeta.id },
      { userId: employee2.id, projectId: projectAlpha.id }
    ]
  });

  await prisma.leaveType.create({
    data: {
      code: 'VAC',
      name: 'Vacaciones'
    }
  });

  const year = DateTime.now().year;
  const holidays = [
    { date: `${year}-01-01`, name: 'Año Nuevo' },
    { date: `${year}-02-28`, name: 'Día de Andalucía' },
    { date: `${year}-12-25`, name: 'Navidad' }
  ];
  for (const holiday of holidays) {
    await prisma.holiday.upsert({
      where: {
        region_date: {
          region: 'ES-AN',
          date: holiday.date
        }
      },
      update: {},
      create: {
        region: 'ES-AN',
        date: holiday.date,
        name: holiday.name
      }
    });
  }

  const vacationDate = DateTime.now().setZone('Europe/Madrid').startOf('month').plus({ days: 10 }).toISODate();
  if (vacationDate) {
    await prisma.vacationDay.create({
      data: {
        userId: employee1.id,
        date: vacationDate,
        leaveTypeId: (await prisma.leaveType.findFirst({ where: { code: 'VAC' } }))?.id,
        approved: true,
        source: 'A3'
      }
    });
  }

  const now = DateTime.now().setZone('Europe/Madrid').startOf('day').plus({ hours: 8 });
  const entryIn = await prisma.timeEntry.create({
    data: {
      userId: employee1.id,
      type: TimeEntryType.IN,
      occurredAtUtc: now.toUTC().toJSDate(),
      occurredAtLocal: now.toJSDate(),
      localDate: now.toISODate() ?? '',
      source: TimeEntrySource.WEB,
      createdBy: admin.id
    }
  });
  const entryOut = await prisma.timeEntry.create({
    data: {
      userId: employee1.id,
      type: TimeEntryType.OUT,
      occurredAtUtc: now.plus({ hours: 8 }).toUTC().toJSDate(),
      occurredAtLocal: now.plus({ hours: 8 }).toJSDate(),
      localDate: now.toISODate() ?? '',
      source: TimeEntrySource.WEB,
      createdBy: admin.id
    }
  });
  await prisma.shift.create({
    data: {
      userId: employee1.id,
      startEntryId: entryIn.id,
      endEntryId: entryOut.id,
      durationMinutes: 480,
      status: 'CLOSED'
    }
  });

  console.log('Datos de ejemplo cargados');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
