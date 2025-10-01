import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { A3LeaveDto, A3LeavePort } from '../ports/a3-leave.port';

@Injectable()
export class A3RestAdapter extends A3LeavePort {
  private readonly client: AxiosInstance;
  private readonly webhookSecret: string;

  constructor(configService: ConfigService) {
    super();
    this.client = axios.create({
      baseURL: configService.get<string>('integrations.a3.baseUrl'),
      timeout: 5000,
      headers: {
        'x-api-key': configService.get<string>('integrations.a3.apiKey')
      }
    });
    this.webhookSecret = configService.get<string>('integrations.a3.webhookSecret') ?? '';
  }

  async listLeaves(userExternalId: string, from: string, to: string): Promise<A3LeaveDto[]> {
    const response = await this.retry(() =>
      this.client.get<A3LeaveDto[]>('/leaves', { params: { userExternalId, from, to } })
    );
    return response.data;
  }

  async verifyWebhook(signature: string, payload: string): Promise<boolean> {
    const expected = crypto.createHmac('sha256', this.webhookSecret).update(payload).digest('hex');
    return expected === signature;
  }

  private async retry<T>(fn: () => Promise<T>, attempt = 1): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= 3) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 100 * Math.pow(2, attempt)));
      return this.retry(fn, attempt + 1);
    }
  }
}
