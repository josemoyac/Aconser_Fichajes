import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { PinoLogger } from './common/logger/pino-logger.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true
  });
  const configService = app.get(ConfigService);
  const logger = app.get(PinoLogger);
  app.useLogger(logger);

  const frontendUrl = configService.get<string>('app.frontendUrl');
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
  });
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:'],
        'connect-src': ["'self'", frontendUrl ?? 'http://localhost:5173']
      }
    }
  }));
  app.use(cookieParser(configService.get<string>('app.sessionSecret')));
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true }));
  app.use(new RequestContextMiddleware().use);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true
    })
  );

  const port = configService.get<number>('app.port');
  await app.listen(port);
  Logger.log(`Aplicación escuchando en puerto ${port}`, 'Bootstrap');
}

bootstrap();
