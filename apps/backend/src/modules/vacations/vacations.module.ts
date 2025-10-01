import { forwardRef, Module } from '@nestjs/common';
import { VacationsService } from './vacations.service';
import { VacationsController } from './vacations.controller';
import { IntegrationsModule } from '../integrations/integrations.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [forwardRef(() => IntegrationsModule), UsersModule],
  providers: [VacationsService],
  controllers: [VacationsController],
  exports: [VacationsService]
})
export class VacationsModule {}
