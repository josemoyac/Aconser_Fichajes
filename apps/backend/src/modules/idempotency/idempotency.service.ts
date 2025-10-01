import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { IdempotencyStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  async execute<T>(key: string | undefined, handler: () => Promise<T>): Promise<T> {
    if (!key) {
      return handler();
    }
    const existing = await this.prisma.idempotencyKey.findUnique({ where: { key } });
    if (existing?.status === IdempotencyStatus.COMPLETED && existing.responseHash) {
      return JSON.parse(existing.responseHash) as T;
    }
    if (existing?.status === IdempotencyStatus.IN_PROGRESS) {
      throw new Error('Operación en curso');
    }
    await this.prisma.idempotencyKey.upsert({
      where: { key },
      create: {
        key,
        status: IdempotencyStatus.IN_PROGRESS,
        requestHash: randomUUID(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 10)
      },
      update: {
        status: IdempotencyStatus.IN_PROGRESS
      }
    });
    const result = await handler();
    await this.prisma.idempotencyKey.update({
      where: { key },
      data: {
        status: IdempotencyStatus.COMPLETED,
        responseHash: JSON.stringify(result)
      }
    });
    return result;
  }
}
