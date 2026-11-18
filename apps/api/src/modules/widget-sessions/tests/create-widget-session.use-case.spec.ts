import { JwtService } from '@nestjs/jwt';
import { describe, expect, it } from 'vitest';

import { WidgetOriginService } from '../services/widget-origin.service';
import { WidgetSessionTokenService } from '../services/widget-session-token.service';
import { CreateWidgetSessionUseCase } from '../use-cases/create-widget-session.use-case';
import { InMemoryWidgetSessionRepository } from './widget-session.repository.fake';

const options = { audience: 'poc-chatwidget', issuer: 'poc-chatwidget-api', ttlSeconds: 900 };

describe('CreateWidgetSessionUseCase', () => {
  it('creates a persisted session and token for an allowed exact origin', async () => {
    const repository = new InMemoryWidgetSessionRepository();
    const tokenService = new WidgetSessionTokenService(
      new JwtService({ secret: 'test-secret-that-is-at-least-32-bytes-long' }),
      options,
    );
    const useCase = new CreateWidgetSessionUseCase(
      repository,
      new WidgetOriginService(),
      tokenService,
    );

    const result = await useCase.execute({
      origin: 'HTTP://LOCALHOST:5173',
      widgetId: 'demo-widget',
    });

    expect(result.data).toEqual({
      expiresAt: expect.any(String),
      token: expect.any(String),
    });
    expect([...repository.sessions.values()][0]).toMatchObject({
      origin: 'http://localhost:5173',
      widgetId: 'demo-widget',
    });
  });
});
