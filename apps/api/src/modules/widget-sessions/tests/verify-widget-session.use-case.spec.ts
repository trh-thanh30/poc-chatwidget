import { JwtService } from '@nestjs/jwt';
import { describe, expect, it } from 'vitest';

import { WidgetOriginService } from '../services/widget-origin.service';
import { WidgetSessionTokenService } from '../services/widget-session-token.service';
import { CreateWidgetSessionUseCase } from '../use-cases/create-widget-session.use-case';
import { VerifyWidgetSessionUseCase } from '../use-cases/verify-widget-session.use-case';
import { InMemoryWidgetSessionRepository } from './widget-session.repository.fake';

const options = { audience: 'poc-chatwidget', issuer: 'poc-chatwidget-api', ttlSeconds: 900 };

describe('VerifyWidgetSessionUseCase', () => {
  it('re-checks persisted Widget access for a valid token', async () => {
    const repository = new InMemoryWidgetSessionRepository();
    const originService = new WidgetOriginService();
    const tokenService = new WidgetSessionTokenService(
      new JwtService({ secret: 'test-secret-that-is-at-least-32-bytes-long' }),
      options,
    );
    const createUseCase = new CreateWidgetSessionUseCase(repository, originService, tokenService);
    const verifyUseCase = new VerifyWidgetSessionUseCase(repository, originService, tokenService);
    const created = await createUseCase.execute({
      origin: 'http://localhost:5173',
      widgetId: 'demo-widget',
    });

    const session = await verifyUseCase.execute({
      origin: 'http://localhost:5173',
      token: created.data.token,
    });

    expect(session).toMatchObject({
      origin: 'http://localhost:5173',
      widgetId: 'demo-widget',
    });
  });
});
