import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import integrationsConfig from './config/integrations.config';
import securityConfig from './config/security.config';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TimeEntriesModule } from './modules/time-entries/time-entries.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { AllocationsModule } from './modules/allocations/allocations.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { SettingsModule } from './modules/settings/settings.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { AuditModule } from './modules/audit/audit.module';
import { HolidaysModule } from './modules/holidays/holidays.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { HealthModule } from './modules/health/health.module';
import { ObservabilityModule } from './modules/observability/observability.module';
import { VacationsModule } from './modules/vacations/vacations.module';
import { IdempotencyModule } from './modules/idempotency/idempotency.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ConsentsModule } from './modules/consents/consents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, integrationsConfig, securityConfig]
    }),
    TerminusModule,
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        ttl: Number(process.env.RATE_LIMIT_WINDOW ?? 60),
        limit: Number(process.env.RATE_LIMIT_MAX ?? 100)
      })
    }),
    CommonModule,
    AuthModule,
    UsersModule,
    TimeEntriesModule,
    ShiftsModule,
    AllocationsModule,
    ProjectsModule,
    SettingsModule,
    IntegrationsModule,
    AuditModule,
    HolidaysModule,
    PermissionsModule,
    HealthModule,
    ObservabilityModule,
    VacationsModule,
    IdempotencyModule,
    JobsModule,
    ConsentsModule
  ]
})
export class AppModule {}
