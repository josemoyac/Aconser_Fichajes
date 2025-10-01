import { Injectable } from '@nestjs/common';
import client, { Registry } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();

  registerDefaultMetrics(): void {
    client.collectDefaultMetrics({ register: this.registry });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
