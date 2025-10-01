import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { BCProjectDto, BCProjectsPort } from '../ports/bc-projects.port';

@Injectable()
export class BCRestAdapter extends BCProjectsPort {
  private readonly client: AxiosInstance;
  private readonly webhookSecret: string;

  constructor(configService: ConfigService) {
    super();
    this.client = axios.create({
      baseURL: configService.get<string>('integrations.bc.baseUrl'),
      timeout: 5000
    });
    this.webhookSecret = configService.get<string>('integrations.bc.webhookSecret') ?? '';
  }

  async listProjects(): Promise<BCProjectDto[]> {
    const response = await this.retry(() => this.client.get<BCProjectDto[]>('/projects'));
    return response.data;
  }

  async getProjectByExternalId(externalId: string): Promise<BCProjectDto | null> {
    try {
      const response = await this.retry(() => this.client.get<BCProjectDto>(`/projects/${externalId}`));
      return response.data;
    } catch (error) {
      return null;
    }
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
