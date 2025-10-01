import { Body, Controller, Post } from '@nestjs/common';
import { ConsentsService } from './consents.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.service';

@Controller('consents')
export class ConsentsController {
  constructor(private readonly consentsService: ConsentsService) {}

  @Post()
  async register(
    @CurrentUser() user: AuthenticatedUser,
    @Body('action') action: 'CONSENT_GIVEN' | 'CONSENT_REVOKED'
  ) {
    return this.consentsService.registerConsent(user.id, action);
  }
}
