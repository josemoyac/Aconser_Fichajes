import { Injectable, LoggerService } from '@nestjs/common';
import pino from 'pino';
import pinoHttp from 'pino-http';

@Injectable()
export class PinoLogger implements LoggerService {
  private readonly logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      process.env.NODE_ENV === 'production'
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname'
            }
          }
  });

  public httpLogger = pinoHttp({
    logger: this.logger,
    customLogLevel: (_req, res, err) => {
      if (res.statusCode >= 500 || err) {
        return 'error';
      }
      if (res.statusCode >= 400) {
        return 'warn';
      }
      return 'info';
    }
  });

  log(message: unknown, context?: string): void {
    this.logger.info({ context, message });
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.logger.error({ context, message, trace });
  }

  warn(message: unknown, context?: string): void {
    this.logger.warn({ context, message });
  }

  debug(message: unknown, context?: string): void {
    this.logger.debug({ context, message });
  }

  verbose(message: unknown, context?: string): void {
    this.logger.debug({ context, message });
  }
}
