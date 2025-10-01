import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.service';

@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('month') month = new Date().toISOString().slice(0, 7)
  ) {
    return this.shiftsService.listShifts(user.id, month);
  }

  @Post(':id/close')
  async close(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body('endEntryId') endEntryId: string
  ) {
    return this.shiftsService.closeShift(user.id, id, endEntryId);
  }
}
