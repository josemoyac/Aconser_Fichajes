import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  getProjectsForUser(userId: string) {
    return this.prisma.employeeProjectPermission.findMany({
      where: { userId },
      include: { project: true }
    });
  }

  async setPermissions(userId: string, projectIds: string[]): Promise<void> {
    await this.prisma.employeeProjectPermission.deleteMany({ where: { userId } });
    for (const projectId of projectIds) {
      await this.prisma.employeeProjectPermission.create({
        data: {
          userId,
          projectId
        }
      });
    }
  }
}
