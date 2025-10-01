import { Module, OnModuleInit } from '@nestjs/common';
import { ObservabilityController } from './observability.controller';
import { MetricsService } from './observability.service';

@Module({
  controllers: [ObservabilityController],
  providers: [MetricsService],
  exports: [MetricsService]
})
export class ObservabilityModule implements OnModuleInit {
  constructor(private readonly metrics: MetricsService) {}

  onModuleInit(): void {
    this.metrics.registerDefaultMetrics();
  }
}
