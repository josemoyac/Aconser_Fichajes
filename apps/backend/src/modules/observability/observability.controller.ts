import { Controller, Get, Header } from '@nestjs/common';
import { MetricsService } from './observability.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller()
export class ObservabilityController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('metrics')
  @Public()
  @Header('Content-Type', 'text/plain; version=0.0.4')
  async metrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
