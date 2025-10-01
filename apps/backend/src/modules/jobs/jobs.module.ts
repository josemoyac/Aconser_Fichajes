import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { ProjectsModule } from '../projects/projects.module';
import { VacationsModule } from '../vacations/vacations.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ProjectsModule, VacationsModule, UsersModule],
  providers: [JobsService]
})
export class JobsModule {}
