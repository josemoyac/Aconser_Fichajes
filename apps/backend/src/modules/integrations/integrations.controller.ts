import { BadRequestException, Body, Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { A3LeavePort } from './ports/a3-leave.port';
import { BCProjectsPort } from './ports/bc-projects.port';
import { VacationsService } from '../vacations/vacations.service';
import { ProjectsService } from '../projects/projects.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly a3Port: A3LeavePort,
    private readonly bcPort: BCProjectsPort,
    private readonly vacationsService: VacationsService,
    private readonly projectsService: ProjectsService
  ) {}

  @Post('a3/webhook')
  @Public()
  async a3Webhook(@Headers('x-signature') signature: string, @Body() body: any) {
    const payload = JSON.stringify(body);
    const valid = await this.a3Port.verifyWebhook(signature, payload);
    if (!valid) {
      throw new UnauthorizedException('Firma inválida');
    }
    for (const leave of body.leaves ?? []) {
      const externalId = leave.userExternalId ?? leave.userId;
      await this.vacationsService.syncLeaves(externalId, leave.date, leave.date);
    }
    return { success: true };
  }

  @Post('a3/sync')
  async syncA3(@Body() body: { userExternalId: string; from: string; to: string }) {
    if (!body.userExternalId) {
      throw new BadRequestException('userExternalId requerido');
    }
    await this.vacationsService.syncLeaves(body.userExternalId, body.from, body.to);
    return { success: true };
  }

  @Post('bc/webhook')
  @Public()
  async bcWebhook(@Headers('x-signature') signature: string, @Body() body: any) {
    const payload = JSON.stringify(body);
    const valid = await this.bcPort.verifyWebhook(signature, payload);
    if (!valid) {
      throw new UnauthorizedException('Firma inválida');
    }
    await this.projectsService.syncFromBusinessCentral();
    return { success: true };
  }

  @Post('bc/sync')
  async syncBC() {
    await this.projectsService.syncFromBusinessCentral();
    return { success: true };
  }
}
