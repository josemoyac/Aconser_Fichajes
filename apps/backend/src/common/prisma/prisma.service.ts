import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RequestContextMiddleware } from '../middleware/request-context.middleware';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly context: RequestContextMiddleware) {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    this.$use(async (params, next) => {
      if (params.model === 'AuditLog') {
        return next(params);
      }
      const beforeData = params.args?.data ? JSON.stringify(params.args.data) : null;
      const result = await next(params);
      const auditableModels = [
        'TimeEntry',
        'Shift',
        'MonthlyAllocation',
        'MonthlyProjectAllocation',
        'VacationDay',
        'Project',
        'User',
        'Settings'
      ];
      if (auditableModels.includes(params.model ?? '')) {
        const store = this.context.getStore();
        const actorUserId = store?.userId ?? null;
        const action = `${params.model}.${params.action}`;
        await super.auditLog.create({
          data: {
            actorUserId,
            action,
            entity: params.model ?? 'Unknown',
            entityId: this.extractEntityId(result),
            before: beforeData,
            after: result ? JSON.stringify(result) : null
          }
        });
      }
      return result;
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  private extractEntityId(result: unknown): string {
    if (!result || typeof result !== 'object') {
      return 'unknown';
    }
    const maybe = result as { id?: string };
    return maybe.id ?? 'unknown';
  }
}
