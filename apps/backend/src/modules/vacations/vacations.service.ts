import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { PrismaService } from '../../common/prisma/prisma.service';
import { A3LeavePort } from '../integrations/ports/a3-leave.port';
import { UsersService } from '../users/users.service';

@Injectable()
export class VacationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly a3Port: A3LeavePort,
    private readonly usersService: UsersService
  ) {}

  async hasApprovedLeave(userId: string, date: Date): Promise<boolean> {
    const isoDate = DateTime.fromJSDate(date, { zone: 'Europe/Madrid' }).toISODate();
    const vacation = await this.prisma.vacationDay.findUnique({
      where: {
        userId_date: {
          userId,
          date: isoDate
        }
      }
    });
    return vacation?.approved ?? false;
  }

  async syncLeaves(userExternalId: string, from: string, to: string): Promise<void> {
    const user = await this.usersService.findByOidcSub(userExternalId);
    const userId = user?.id ?? userExternalId;
    const leaves = await this.a3Port.listLeaves(userExternalId, from, to);
    for (const leave of leaves) {
      await this.prisma.vacationDay.upsert({
        where: {
          userId_date: {
            userId,
            date: leave.date
          }
        },
        update: {
          approved: leave.approved,
          externalRef: leave.externalRef
        },
        create: {
          userId,
          date: leave.date,
          leaveTypeId: leave.leaveTypeId,
          source: leave.source,
          externalRef: leave.externalRef,
          approved: leave.approved
        }
      });
    }
  }
}
