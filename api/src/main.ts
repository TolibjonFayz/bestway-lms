import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from './config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const prefix = config.getOrThrow<string>('apiPrefix');
  app.setGlobalPrefix(prefix);

  app.useGlobalPipes(
    new ValidationPipe({
      /* Strip anything the DTO does not declare, and reject the request when
         a client sends extra fields — a role in the body must never survive. */
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  const origins = config.getOrThrow<AppConfig['corsOrigins']>('corsOrigins');
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  const port = config.getOrThrow<number>('port');
  await app.listen(port);
  logger.log(`API listening on http://localhost:${port}/${prefix}`);
  logger.log(`CORS origins: ${origins.join(', ')}`);
}

void bootstrap();
