import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { DatabaseModule } from '../../database/database.module';
import { DrizzleWidgetSessionRepository } from './repository/drizzle-widget-session.repository';
import { WidgetOriginService } from './services/widget-origin.service';
import { WidgetSessionTokenService } from './services/widget-session-token.service';
import type { WidgetSessionOptions } from './types/widget-session-options.types';
import { CreateWidgetSessionUseCase } from './use-cases/create-widget-session.use-case';
import { VerifyWidgetSessionUseCase } from './use-cases/verify-widget-session.use-case';
import { WidgetSessionGuard } from './widget-session.guard';
import { WIDGET_SESSION_OPTIONS, WIDGET_SESSION_REPOSITORY } from './widget-session.constants';
import { WidgetSessionsController } from './widget-sessions.controller';

const JWT_ISSUER = 'poc-chatwidget-api';
const JWT_AUDIENCE = 'poc-chatwidget';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('WIDGET_SESSION_JWT_SECRET'),
        signOptions: { algorithm: 'HS256', audience: JWT_AUDIENCE, issuer: JWT_ISSUER },
      }),
    }),
  ],
  controllers: [WidgetSessionsController],
  providers: [
    CreateWidgetSessionUseCase,
    VerifyWidgetSessionUseCase,
    WidgetOriginService,
    WidgetSessionTokenService,
    WidgetSessionGuard,
    DrizzleWidgetSessionRepository,
    { provide: WIDGET_SESSION_REPOSITORY, useExisting: DrizzleWidgetSessionRepository },
    {
      provide: WIDGET_SESSION_OPTIONS,
      inject: [ConfigService],
      useFactory: (config: ConfigService): WidgetSessionOptions => ({
        audience: JWT_AUDIENCE,
        issuer: JWT_ISSUER,
        ttlSeconds: config.getOrThrow<number>('WIDGET_SESSION_JWT_TTL_SECONDS'),
      }),
    },
  ],
  exports: [VerifyWidgetSessionUseCase, WidgetSessionGuard],
})
export class WidgetSessionsModule {}
