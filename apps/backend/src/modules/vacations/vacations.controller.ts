import { Body, Controller, Post } from '@nestjs/common';
import { VacationsService } from './vacations.service';

@Controller('vacations')
export class VacationsController {
  constructor(private readonly vacationsService: VacationsService) {}

  @Post('sync')
  async sync(@Body() body: { userExternalId: string; from: string; to: string }) {
    await this.vacationsService.syncLeaves(body.userExternalId, body.from, body.to);
    return { success: true };
  }
}
