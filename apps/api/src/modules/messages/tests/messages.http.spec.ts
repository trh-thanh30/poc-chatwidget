import { type INestApplication } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createValidationPipe } from '../../../common/http/validation.pipe';
import { MockChatChannel } from '../../channels/mock-chat.channel';
import { CHAT_CHANNEL } from '../../channels/chat-channel.constants';
import { WidgetOriginService } from '../../widget-sessions/services/widget-origin.service';
import { WidgetSessionTokenService } from '../../widget-sessions/services/widget-session-token.service';
import { InMemoryWidgetSessionRepository } from '../../widget-sessions/tests/widget-session.repository.fake';
import { CreateWidgetSessionUseCase } from '../../widget-sessions/use-cases/create-widget-session.use-case';
import { VerifyWidgetSessionUseCase } from '../../widget-sessions/use-cases/verify-widget-session.use-case';
import { WIDGET_SESSION_REPOSITORY } from '../../widget-sessions/widget-session.constants';
import { WidgetSessionGuard } from '../../widget-sessions/widget-session.guard';
import { WidgetSessionsController } from '../../widget-sessions/widget-sessions.controller';
import { MESSAGE_REPOSITORY } from '../message.constants';
import { MessagesController } from '../messages.controller';
import { ListMessagesUseCase } from '../use-cases/list-messages.use-case';
import { SendMessageUseCase } from '../use-cases/send-message.use-case';
import { InMemoryMessageRepository } from './message.repository.fake';

const JWT_SECRET = 'test-secret-that-is-at-least-32-bytes-long';
const ORIGIN = 'http://localhost:5173';

describe('Messages HTTP contract', () => {
  let app: INestApplication;

  async function createApp() {
    const sessionRepository = new InMemoryWidgetSessionRepository();
    const messageRepository = new InMemoryMessageRepository();
    const channel = new MockChatChannel();
    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: JWT_SECRET,
          signOptions: { audience: 'poc-chatwidget', issuer: 'poc-chatwidget-api' },
        }),
      ],
      controllers: [WidgetSessionsController, MessagesController],
      providers: [
        CreateWidgetSessionUseCase,
        VerifyWidgetSessionUseCase,
        WidgetOriginService,
        WidgetSessionTokenService,
        WidgetSessionGuard,
        SendMessageUseCase,
        ListMessagesUseCase,
        { provide: WIDGET_SESSION_REPOSITORY, useValue: sessionRepository },
        { provide: MESSAGE_REPOSITORY, useValue: messageRepository },
        { provide: CHAT_CHANNEL, useValue: channel },
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
    return { channel, sessionRepository };
  }

  async function createSessionToken(): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/widget-sessions')
      .set('Origin', ORIGIN)
      .send({ widgetId: 'demo-widget' })
      .expect(201);
    return response.body.data.token as string;
  }

  afterEach(async () => {
    await app?.close();
  });

  it('lets a verified session send a message and list its deterministic Mock reply', async () => {
    await createApp();
    const token = await createSessionToken();

    const sent = await request(app.getHttpServer())
      .post('/api/v1/messages')
      .set('Origin', ORIGIN)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Xin chào', idempotencyKey: '8ceabd90-3554-4d6b-99db-1c44d5a3960e' })
      .expect(201);

    expect(sent.body).toMatchObject({
      data: {
        message: {
          content: 'Xin chào',
          direction: 'visitor',
          id: expect.any(String),
        },
      },
    });

    const listed = await request(app.getHttpServer())
      .get('/api/v1/messages')
      .set('Origin', ORIGIN)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(listed.body.data.messages).toEqual([
      expect.objectContaining({ content: 'Xin chào', direction: 'visitor' }),
      expect.objectContaining({ content: 'Mock reply: Xin chào', direction: 'operator' }),
    ]);
  });

  it('isolates messages and channel replies between Widget sessions', async () => {
    await createApp();
    const sessionA = await createSessionToken();
    const sessionB = await createSessionToken();

    await request(app.getHttpServer())
      .post('/api/v1/messages')
      .set('Origin', ORIGIN)
      .set('Authorization', `Bearer ${sessionA}`)
      .send({ content: 'Only session A', idempotencyKey: '2e58e7bd-f0e6-4003-b637-ba79530e77c4' })
      .expect(201);

    const sessionBMessages = await request(app.getHttpServer())
      .get('/api/v1/messages')
      .set('Origin', ORIGIN)
      .set('Authorization', `Bearer ${sessionB}`)
      .expect(200);

    expect(sessionBMessages.body).toEqual({ data: { messages: [] } });

    const sessionAMessages = await request(app.getHttpServer())
      .get('/api/v1/messages')
      .set('Origin', ORIGIN)
      .set('Authorization', `Bearer ${sessionA}`)
      .expect(200);

    expect(sessionAMessages.body.data.messages).toHaveLength(2);
  });

  it('does not duplicate a visitor message or Mock reply for the same idempotency key', async () => {
    await createApp();
    const token = await createSessionToken();
    const idempotencyKey = 'bcfd38c1-221b-4e92-8586-0c5319ecbf71';

    const first = await request(app.getHttpServer())
      .post('/api/v1/messages')
      .set('Origin', ORIGIN)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Original message', idempotencyKey })
      .expect(201);

    const retried = await request(app.getHttpServer())
      .post('/api/v1/messages')
      .set('Origin', ORIGIN)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Changed retry payload', idempotencyKey })
      .expect(201);

    expect(retried.body.data.message).toEqual(first.body.data.message);

    const listed = await request(app.getHttpServer())
      .get('/api/v1/messages')
      .set('Origin', ORIGIN)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(listed.body.data.messages).toHaveLength(2);
    expect(
      listed.body.data.messages.map((message: { content: string }) => message.content),
    ).toEqual(['Original message', 'Mock reply: Original message']);
  });

  it.each(['', '   ', 'x'.repeat(2_001)])(
    'rejects empty, whitespace-only or oversized content',
    async (content) => {
      await createApp();
      const token = await createSessionToken();

      const response = await request(app.getHttpServer())
        .post('/api/v1/messages')
        .set('Origin', ORIGIN)
        .set('Authorization', `Bearer ${token}`)
        .send({ content, idempotencyKey: '76ec351a-2a5d-4d62-87a7-cb344548d620' })
        .expect(400);

      expect(response.body).toEqual({
        error: { code: 'VALIDATION_ERROR', message: 'Request validation failed.' },
      });
    },
  );

  it('accepts content at the 2,000 Unicode character boundary', async () => {
    await createApp();
    const token = await createSessionToken();

    await request(app.getHttpServer())
      .post('/api/v1/messages')
      .set('Origin', ORIGIN)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: '🙂'.repeat(2_000),
        idempotencyKey: '429f183e-fb45-4e16-a3cb-90e284d807a0',
      })
      .expect(201);
  });

  it('returns HTML and script-like content only as plain text data', async () => {
    await createApp();
    const token = await createSessionToken();
    const content = '<script>globalThis.compromised = true</script>';

    await request(app.getHttpServer())
      .post('/api/v1/messages')
      .set('Origin', ORIGIN)
      .set('Authorization', `Bearer ${token}`)
      .send({ content, idempotencyKey: '2ac710a4-638f-460f-bf9f-cb9243587078' })
      .expect(201);

    const listed = await request(app.getHttpServer())
      .get('/api/v1/messages')
      .set('Origin', ORIGIN)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(listed.body.data.messages[0]).toMatchObject({ content, direction: 'visitor' });
    expect(listed.body.data.messages[0]).not.toHaveProperty('html');
  });

  it('does not call the channel for invalid, expired or cross-origin sessions', async () => {
    const { channel, sessionRepository } = await createApp();
    const send = vi.spyOn(channel, 'send');
    const receive = vi.spyOn(channel, 'receive');
    const body = {
      content: 'Must not be forwarded',
      idempotencyKey: 'c86c559d-bcbb-4ea9-a33c-e9a576ecef4e',
    };

    await request(app.getHttpServer())
      .post('/api/v1/messages')
      .set('Origin', ORIGIN)
      .set('Authorization', 'Bearer invalid-token')
      .send(body)
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/messages')
      .set('Origin', ORIGIN)
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    const crossOriginToken = await createSessionToken();
    await request(app.getHttpServer())
      .post('/api/v1/messages')
      .set('Origin', 'https://partner.example')
      .set('Authorization', `Bearer ${crossOriginToken}`)
      .send(body)
      .expect(403);

    const expiredToken = await createSessionToken();
    const latestSession = [...sessionRepository.sessions.values()].at(-1)!;
    latestSession.expiresAt = new Date(0);
    await request(app.getHttpServer())
      .post('/api/v1/messages')
      .set('Origin', ORIGIN)
      .set('Authorization', `Bearer ${expiredToken}`)
      .send(body)
      .expect(401);

    expect(send).not.toHaveBeenCalled();
    expect(receive).not.toHaveBeenCalled();
  });
});
