import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IntegrationsController } from './integrations.controller';
import { A3RestAdapter } from './adapters/a3-rest.adapter';
import { BCRestAdapter } from './adapters/bc-rest.adapter';
import { A3LeavePort } from './ports/a3-leave.port';
import { BCProjectsPort } from './ports/bc-projects.port';
import { VacationsModule } from '../vacations/vacations.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ConfigModule, forwardRef(() => VacationsModule), forwardRef(() => ProjectsModule)],
  controllers: [IntegrationsController],
  providers: [
    {
      provide: A3LeavePort,
      useClass: A3RestAdapter
    },
    {
      provide: BCProjectsPort,
      useClass: BCRestAdapter
    }
  ],
  exports: [A3LeavePort, BCProjectsPort]
})
export class IntegrationsModule {}
