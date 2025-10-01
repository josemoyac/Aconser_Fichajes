import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller()
export class HealthController {
  constructor(private readonly health: HealthCheckService, private readonly prisma: PrismaService) {}

  @Get('health')
  @Public()
  @HealthCheck()
  check() {
    return this.health.check([() => this.prisma.$queryRaw`SELECT 1`]);
  }

  @Get('ready')
  @Public()
  async ready() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  }
}
