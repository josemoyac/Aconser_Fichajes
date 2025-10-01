import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import cron from 'node-cron';
import { ProjectsService } from '../projects/projects.service';
import { VacationsService } from '../vacations/vacations.service';
import { UsersService } from '../users/users.service';
import { DateTime } from 'luxon';

@Injectable()
export class JobsService implements OnModuleInit {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly vacationsService: VacationsService,
    private readonly usersService: UsersService
  ) {}

  onModuleInit(): void {
    const projectCron = process.env.CRON_SYNC_PROJECTS ?? '0 3 * * *';
    const leaveCron = process.env.CRON_SYNC_LEAVES ?? '5 3 * * *';
    cron.schedule(projectCron, () => this.syncProjects());
    cron.schedule(leaveCron, () => this.syncLeaves());
  }

  private async syncProjects(): Promise<void> {
    this.logger.log('Sincronizando proyectos de Business Central');
    await this.projectsService.syncFromBusinessCentral();
  }

  private async syncLeaves(): Promise<void> {
    this.logger.log('Sincronizando vacaciones de A3');
    const users = await this.usersService.list();
    const from = DateTime.now().setZone('Europe/Madrid').startOf('month').toISODate() ?? '';
    const to = DateTime.now().setZone('Europe/Madrid').plus({ months: 1 }).endOf('month').toISODate() ?? '';
    for (const user of users) {
      const externalId = user.oidcSub ?? user.id;
      await this.vacationsService.syncLeaves(externalId, from, to);
    }
  }
}
