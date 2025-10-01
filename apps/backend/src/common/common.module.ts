import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { PinoLogger } from './logger/pino-logger.service';
import { RequestContextInterceptor } from './interceptors/request-context.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { RequestContextMiddleware } from './middleware/request-context.middleware';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    PinoLogger,
    RequestContextMiddleware,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ],
  exports: [PinoLogger, PrismaModule, RequestContextMiddleware]
})
export class CommonModule {}
