import { describe, expect, it, vi } from 'vitest';

import type { ZaloPersonalClient, ZaloPersonalClientHandlers } from '../zca-personal.client';
import { ZaloPersonalChannel } from '../zalo-personal.channel';

describe('ZaloPersonalChannel', () => {
  it('forwards a Widget message to the configured operator thread', async () => {
    const client: ZaloPersonalClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      sendText: vi.fn().mockResolvedValue('123456'),
      stop: vi.fn(),
    };
    const channel = new ZaloPersonalChannel(
      { operatorThreadId: 'operator-thread', operatorThreadType: 'group' },
      client,
    );

    await channel.onModuleInit();
    const result = await channel.send({
      sessionId: 'session-12345678',
      widgetId: 'demo-widget',
      messageId: 'message-id',
      content: 'Xin chào operator',
      createdAt: new Date('2026-11-18T00:00:00.000Z'),
    });

    expect(client.connect).toHaveBeenCalledOnce();
    expect(client.sendText).toHaveBeenCalledWith(
      '[Chat Widget · demo-widget · session-]\nXin chào operator',
      'operator-thread',
      'group',
    );
    expect(result).toEqual({ externalMessageId: 'zalo:123456' });

    channel.onModuleDestroy();
    expect(client.stop).toHaveBeenCalledOnce();
  });

  it('routes a quoted operator reply once to the owning Widget session', async () => {
    let handlers!: ZaloPersonalClientHandlers;
    const client: ZaloPersonalClient = {
      connect: vi.fn(async (registeredHandlers) => {
        handlers = registeredHandlers;
      }),
      sendText: vi.fn(),
      stop: vi.fn(),
    };
    const channel = new ZaloPersonalChannel(
      { operatorThreadId: 'operator-thread', operatorThreadType: 'user' },
      client,
    );
    await channel.onModuleInit();

    const reply = {
      externalMessageId: 'zalo:operator-reply-1',
      replyToExternalMessageId: 'zalo:visitor-message-1',
      content: 'Mình đã nhận được tin nhắn.',
      createdAt: new Date('2026-11-18T00:00:01.000Z'),
    };
    handlers.onMessage(reply);
    handlers.onMessage(reply);

    await expect(
      channel.receive({
        sessionId: 'session-a',
        widgetId: 'demo-widget',
        outboundExternalMessageIds: ['zalo:visitor-message-1'],
      }),
    ).resolves.toEqual([
      {
        externalMessageId: reply.externalMessageId,
        content: reply.content,
        createdAt: reply.createdAt,
      },
    ]);
    await expect(
      channel.receive({
        sessionId: 'session-a',
        widgetId: 'demo-widget',
        outboundExternalMessageIds: ['zalo:visitor-message-1'],
      }),
    ).resolves.toEqual([]);
  });

  it('stays bootable and returns a stable error while Zalo is unavailable', async () => {
    const client: ZaloPersonalClient = {
      connect: vi.fn().mockRejectedValue(new Error('raw credential details')),
      sendText: vi.fn(),
      stop: vi.fn(),
    };
    const channel = new ZaloPersonalChannel(
      { operatorThreadId: 'operator-thread', operatorThreadType: 'user' },
      client,
    );

    await expect(channel.onModuleInit()).resolves.toBeUndefined();
    const error = await channel
      .send({
        sessionId: 'session-a',
        widgetId: 'demo-widget',
        messageId: 'message-id',
        content: 'Không gửi được',
        createdAt: new Date(),
      })
      .catch((caught) => caught);

    expect(error.getStatus()).toBe(503);
    expect(error.getResponse()).toEqual({
      error: {
        code: 'CHANNEL_UNAVAILABLE',
        message: 'The chat channel is temporarily unavailable.',
      },
    });
    expect(String(error)).not.toContain('raw credential details');
  });

  it('allows a manual retry after a transient SDK send failure', async () => {
    const client: ZaloPersonalClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      sendText: vi
        .fn()
        .mockRejectedValueOnce(new Error('temporary failure'))
        .mockResolvedValueOnce('sent-after-retry'),
      stop: vi.fn(),
    };
    const channel = new ZaloPersonalChannel(
      { operatorThreadId: 'operator-thread', operatorThreadType: 'user' },
      client,
    );
    const input = {
      sessionId: 'session-a',
      widgetId: 'demo-widget',
      messageId: 'message-id',
      content: 'Retry me',
      createdAt: new Date(),
    };
    await channel.onModuleInit();

    await expect(channel.send(input)).rejects.toMatchObject({
      response: {
        error: { code: 'CHANNEL_UNAVAILABLE' },
      },
    });
    await expect(channel.send(input)).resolves.toEqual({
      externalMessageId: 'zalo:sent-after-retry',
    });
  });
});
