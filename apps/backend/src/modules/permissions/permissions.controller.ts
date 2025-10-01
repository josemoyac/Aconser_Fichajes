import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('users/:id/projects')
  async getProjects(@Param('id') id: string) {
    return this.permissionsService.getProjectsForUser(id);
  }

  @Post('permissions')
  @Roles(Role.ADMIN)
  async updatePermissions(@Body() dto: UpdatePermissionsDto) {
    await this.permissionsService.setPermissions(dto.userId, dto.projectIds);
    return { success: true };
  }
}
