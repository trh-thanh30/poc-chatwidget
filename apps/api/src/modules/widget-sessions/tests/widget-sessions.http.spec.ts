import { type INestApplication } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { createValidationPipe } from '../../../common/http/validation.pipe';
import { WidgetOriginService } from '../services/widget-origin.service';
import { WidgetSessionTokenService } from '../services/widget-session-token.service';
import { CreateWidgetSessionUseCase } from '../use-cases/create-widget-session.use-case';
import { VerifyWidgetSessionUseCase } from '../use-cases/verify-widget-session.use-case';
import { WIDGET_SESSION_REPOSITORY } from '../widget-session.constants';
import { WidgetSessionsController } from '../widget-sessions.controller';
import { WidgetSessionGuard } from '../widget-session.guard';
import { InMemoryWidgetSessionRepository } from './widget-session.repository.fake';

const JWT_SECRET = 'test-secret-that-is-at-least-32-bytes-long';

describe('Widget sessions HTTP contract', () => {
  let app: INestApplication;

  async function createApp() {
    const repository = new InMemoryWidgetSessionRepository();
    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: JWT_SECRET,
          signOptions: { audience: 'poc-chatwidget', issuer: 'poc-chatwidget-api' },
        }),
      ],
      controllers: [WidgetSessionsController],
      providers: [
        CreateWidgetSessionUseCase,
        VerifyWidgetSessionUseCase,
        WidgetOriginService,
        WidgetSessionTokenService,
        WidgetSessionGuard,
        { provide: WIDGET_SESSION_REPOSITORY, useValue: repository },
        {
          provide: 'WIDGET_SESSION_OPTIONS',
          useValue: { audience: 'poc-chatwidget', issuer: 'poc-chatwidget-api', ttlSeconds: 900 },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(createValidationPipe());
    await app.init();
    return repository;
  }

  afterEach(async () => {
    await app?.close();
  });

  it('creates a session token for an allowed exact origin', async () => {
    await createApp();

    const response = await request(app.getHttpServer())
      .post('/api/v1/widget-sessions')
      .set('Origin', 'HTTP://LOCALHOST:5173')
      .send({ widgetId: 'demo-widget' })
      .expect(201);

    expect(response.body).toMatchObject({
      data: {
        expiresAt: expect.any(String),
        token: expect.any(String),
      },
    });
  });

  it.each([
    ['unknown-widget', 'http://localhost:5173', 404, 'WIDGET_NOT_FOUND'],
    ['demo-widget', 'https://evil.example', 403, 'ORIGIN_NOT_ALLOWED'],
  ])('rejects widget %s from %s', async (widgetId, origin, status, code) => {
    await createApp();

    const response = await request(app.getHttpServer())
      .post('/api/v1/widget-sessions')
      .set('Origin', origin)
      .send({ widgetId })
      .expect(status);

    expect(response.body).toMatchObject({ error: { code } });
    expect(JSON.stringify(response.body)).not.toContain('localhost:5173');
  });

  it('rejects a disabled widget even when its origin is allowed', async () => {
    const repository = await createApp();
    repository.widgets.set('demo-widget', {
      id: 'demo-widget',
      enabled: false,
      allowedOrigins: ['http://localhost:5173'],
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/widget-sessions')
      .set('Origin', 'http://localhost:5173')
      .send({ widgetId: 'demo-widget' })
      .expect(403);

    expect(response.body).toMatchObject({ error: { code: 'ORIGIN_NOT_ALLOWED' } });
  });

  it('accepts a valid session token only with its bound origin', async () => {
    await createApp();
    const created = await request(app.getHttpServer())
      .post('/api/v1/widget-sessions')
      .set('Origin', 'http://localhost:5173')
      .send({ widgetId: 'demo-widget' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/v1/widget-sessions/current')
      .set('Origin', 'http://localhost:5173')
      .set('Authorization', `Bearer ${created.body.data.token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      data: {
        origin: 'http://localhost:5173',
        sessionId: expect.any(String),
        widgetId: 'demo-widget',
      },
    });
  });

  it('rejects a token from another origin even when that origin is also allowed', async () => {
    await createApp();
    const created = await request(app.getHttpServer())
      .post('/api/v1/widget-sessions')
      .set('Origin', 'http://localhost:5173')
      .send({ widgetId: 'demo-widget' });

    const response = await request(app.getHttpServer())
      .get('/api/v1/widget-sessions/current')
      .set('Origin', 'https://partner.example')
      .set('Authorization', `Bearer ${created.body.data.token}`)
      .expect(403);

    expect(response.body).toMatchObject({ error: { code: 'SESSION_ORIGIN_MISMATCH' } });
  });

  it('rejects a tampered token without exposing verification details', async () => {
    await createApp();
    const created = await request(app.getHttpServer())
      .post('/api/v1/widget-sessions')
      .set('Origin', 'http://localhost:5173')
      .send({ widgetId: 'demo-widget' });
    const token = `${created.body.data.token.slice(0, -1)}x`;

    const response = await request(app.getHttpServer())
      .get('/api/v1/widget-sessions/current')
      .set('Origin', 'http://localhost:5173')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);

    expect(response.body).toEqual({
      error: { code: 'SESSION_TOKEN_INVALID', message: 'Session token is invalid.' },
    });
  });

  it('verifies JWT issuer, audience and expiry', async () => {
    await createApp();
    const jwt = app.get(JwtService);
    const baseOptions = {
      audience: 'poc-chatwidget',
      expiresIn: 900,
      issuer: 'poc-chatwidget-api',
      jwtid: 'test-jti',
      subject: '00000000-0000-4000-8000-000000000000',
    };
    const claims = { origin: 'http://localhost:5173', wid: 'demo-widget' };
    const invalidTokens = [
      await jwt.signAsync(claims, { ...baseOptions, issuer: 'wrong-issuer' }),
      await jwt.signAsync(claims, { ...baseOptions, audience: 'wrong-audience' }),
      await jwt.signAsync(claims, { ...baseOptions, expiresIn: -1 }),
    ];

    for (const token of invalidTokens) {
      const response = await request(app.getHttpServer())
        .get('/api/v1/widget-sessions/current')
        .set('Origin', 'http://localhost:5173')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
      expect(response.body).toMatchObject({ error: { code: 'SESSION_TOKEN_INVALID' } });
    }
  });

  it('does not accept an origin supplied in the request body', async () => {
    await createApp();

    const response = await request(app.getHttpServer())
      .post('/api/v1/widget-sessions')
      .send({ widgetId: 'demo-widget', origin: 'http://localhost:5173' })
      .expect(403);

    expect(response.body).toEqual({
      error: { code: 'ORIGIN_REQUIRED', message: 'A valid Origin header is required.' },
    });
  });

  it.each(['disabled', 'origin-removed'] as const)(
    'rechecks widget access when it is %s',
    async (change) => {
      const repository = await createApp();
      const created = await request(app.getHttpServer())
        .post('/api/v1/widget-sessions')
        .set('Origin', 'http://localhost:5173')
        .send({ widgetId: 'demo-widget' });
      const widget = repository.widgets.get('demo-widget')!;
      repository.widgets.set('demo-widget', {
        ...widget,
        enabled: change === 'disabled' ? false : widget.enabled,
        allowedOrigins: change === 'origin-removed' ? [] : widget.allowedOrigins,
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/widget-sessions/current')
        .set('Origin', 'http://localhost:5173')
        .set('Authorization', `Bearer ${created.body.data.token}`)
        .expect(403);

      expect(response.body).toMatchObject({ error: { code: 'WIDGET_ACCESS_REVOKED' } });
    },
  );

  it.each(['revoked', 'expired'] as const)('rejects a %s persisted session', async (change) => {
    const repository = await createApp();
    const created = await request(app.getHttpServer())
      .post('/api/v1/widget-sessions')
      .set('Origin', 'http://localhost:5173')
      .send({ widgetId: 'demo-widget' });
    const session = [...repository.sessions.values()][0]!;
    if (change === 'revoked') repository.revokedSessionIds.add(session.id);
    if (change === 'expired') session.expiresAt = new Date(0);

    const response = await request(app.getHttpServer())
      .get('/api/v1/widget-sessions/current')
      .set('Origin', 'http://localhost:5173')
      .set('Authorization', `Bearer ${created.body.data.token}`)
      .expect(401);

    expect(response.body).toMatchObject({ error: { code: 'SESSION_TOKEN_INVALID' } });
  });
});
