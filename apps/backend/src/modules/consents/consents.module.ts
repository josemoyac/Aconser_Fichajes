import { Module } from '@nestjs/common';
import { ConsentsService } from './consents.service';
import { ConsentsController } from './consents.controller';

@Module({
  providers: [ConsentsService],
  controllers: [ConsentsController]
})
export class ConsentsModule {}
