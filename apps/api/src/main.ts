import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { createValidationPipe } from './common/http/validation.pipe';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.getOrThrow<number>('PORT');

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'OPTIONS'],
    origin: true,
  });
  app.useGlobalPipes(createValidationPipe());
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
  Logger.log(`API listening on http://localhost:${port}/api/v1`, 'Bootstrap');
}

void bootstrap();
