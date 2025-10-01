import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Settings } from '@prisma/client';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(): Promise<Settings> {
    let settings = await this.prisma.settings.findFirst();
    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          timezone: 'Europe/Madrid',
          retroEditDaysLimit: 30,
          auditRetentionDays: 365,
          pwaEnabled: true,
          holidaysRegion: 'ES-AN'
        }
      });
    }
    return settings;
  }

  async updateSettings(data: Partial<Settings>): Promise<Settings> {
    const existing = await this.getSettings();
    return this.prisma.settings.update({ where: { id: existing.id }, data });
  }
}
