import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ConsentsService {
  constructor(private readonly prisma: PrismaService) {}

  async registerConsent(userId: string, action: 'CONSENT_GIVEN' | 'CONSENT_REVOKED') {
    await this.prisma.auditLog.create({
      data: {
        actorUserId: userId,
        action,
        entity: 'CONSENT',
        entityId: userId,
        before: null,
        after: JSON.stringify({ action })
      }
    });
    return { success: true };
  }
}
