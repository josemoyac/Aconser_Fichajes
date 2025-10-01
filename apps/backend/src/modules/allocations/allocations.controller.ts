import { Body, Controller, ForbiddenException, Get, Param, Post } from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.service';
import { FinalizeAllocationDto } from './dto/finalize-allocation.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('allocations')
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  @Get(':userId/:month')
  async getAllocation(
    @Param('userId') userId: string,
    @Param('month') month: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    if (user.id !== userId && user.role !== Role.ADMIN) {
      throw new ForbiddenException();
    }
    return this.allocationsService.getMonthlyAllocation(userId, month);
  }

  @Post(':month/finalize')
  async finalize(
    @Param('month') month: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: FinalizeAllocationDto
  ) {
    return this.allocationsService.finalizeAllocation(user, month, dto.allocations);
  }

  @Get(':month/report')
  @Roles(Role.ADMIN)
  async report(@Param('month') month: string) {
    return this.allocationsService.getReport(month);
  }
}
