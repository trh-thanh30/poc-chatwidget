import { describe, expect, it, vi } from 'vitest';

import type { ChatChannel } from '../../channels/chat-channel';
import type { WidgetSessionContext } from '../../widget-sessions/types/widget-session.types';
import { ListMessagesUseCase } from '../use-cases/list-messages.use-case';
import { SendMessageUseCase } from '../use-cases/send-message.use-case';
import { InMemoryMessageRepository } from './message.repository.fake';

const session: WidgetSessionContext = {
  id: 'f9099296-8a22-46ee-999a-00b1e935b94a',
  widgetId: 'demo-widget',
  origin: 'http://localhost:5173',
  expiresAt: new Date('2026-11-19T00:00:00.000Z'),
  revokedAt: null,
  widget: {
    id: 'demo-widget',
    enabled: true,
    allowedOrigins: ['http://localhost:5173'],
  },
};

describe('Message channel mapping', () => {
  it('persists the outbound channel ID for quoted-reply routing', async () => {
    const repository = new InMemoryMessageRepository();
    const channel: ChatChannel = {
      send: vi.fn().mockResolvedValue({ externalMessageId: 'zalo:visitor-message-1' }),
      receive: vi.fn().mockResolvedValue([]),
    };
    const sendMessage = new SendMessageUseCase(repository, channel);
    const listMessages = new ListMessagesUseCase(repository, channel);

    await sendMessage.execute({
      session,
      content: 'Xin chào',
      idempotencyKey: 'e3ea792a-41bd-4d11-9f7d-cc95e46bc7cc',
    });
    await listMessages.execute(session);

    expect(channel.receive).toHaveBeenCalledWith({
      sessionId: session.id,
      widgetId: session.widgetId,
      outboundExternalMessageIds: ['zalo:visitor-message-1'],
    });
  });

  it('retries channel delivery with the same idempotency key after a temporary failure', async () => {
    const repository = new InMemoryMessageRepository();
    const channel: ChatChannel = {
      send: vi
        .fn()
        .mockRejectedValueOnce(new Error('temporary channel failure'))
        .mockResolvedValueOnce({ externalMessageId: 'zalo:visitor-message-retried' }),
      receive: vi.fn().mockResolvedValue([]),
    };
    const sendMessage = new SendMessageUseCase(repository, channel);
    const input = {
      session,
      content: 'Xin thử gửi lại',
      idempotencyKey: 'f3c220c0-8995-486b-93ba-02605b7b919c',
    };

    await expect(sendMessage.execute(input)).rejects.toThrow('temporary channel failure');
    await expect(sendMessage.execute(input)).resolves.toMatchObject({
      data: { message: { content: 'Xin thử gửi lại' } },
    });

    expect(channel.send).toHaveBeenCalledTimes(2);
    await expect(repository.listVisitorChannelMessageIds(session.id)).resolves.toEqual([
      'zalo:visitor-message-retried',
    ]);
  });
});
