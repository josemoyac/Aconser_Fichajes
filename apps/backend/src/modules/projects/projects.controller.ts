import { Controller, Get, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async list() {
    return this.projectsService.listProjects();
  }

  @Post('sync')
  @Roles(Role.ADMIN)
  async sync() {
    await this.projectsService.syncFromBusinessCentral();
    return { success: true };
  }
}
