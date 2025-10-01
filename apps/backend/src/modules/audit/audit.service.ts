import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  find(entity?: string, entityId?: string, from?: string, to?: string) {
    return this.prisma.auditLog.findMany({
      where: {
        entity: entity || undefined,
        entityId: entityId || undefined,
        createdAt: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 500
    });
  }
}
