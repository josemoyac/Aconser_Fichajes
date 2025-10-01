import { Injectable } from '@nestjs/common';
import { Project, ProjectSource } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { BCProjectsPort } from '../integrations/ports/bc-projects.port';

interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

@Injectable()
export class ProjectsService {
  private projectsCache?: CacheEntry<Project[]>;

  constructor(private readonly prisma: PrismaService, private readonly bcPort: BCProjectsPort) {}

  async listProjects(force = false): Promise<Project[]> {
    if (!force && this.projectsCache && this.projectsCache.expiresAt > Date.now()) {
      return this.projectsCache.value;
    }
    const projects = await this.prisma.project.findMany({ orderBy: { name: 'asc' } });
    this.projectsCache = {
      value: projects,
      expiresAt: Date.now() + 1000 * 60 * 10
    };
    return projects;
  }

  async syncFromBusinessCentral(): Promise<void> {
    const projects = await this.bcPort.listProjects();
    for (const project of projects) {
      await this.prisma.project.upsert({
        where: { externalId: project.externalId },
        update: {
          code: project.code,
          name: project.name,
          active: project.active,
          source: ProjectSource.BC
        },
        create: {
          externalId: project.externalId,
          code: project.code,
          name: project.name,
          active: project.active,
          source: ProjectSource.BC
        }
      });
    }
    this.projectsCache = undefined;
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.prisma.project.findUnique({ where: { id } });
  }
}
