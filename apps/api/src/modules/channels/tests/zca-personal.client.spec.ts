import { describe, expect, it, vi } from 'vitest';

import {
  ZcaPersonalClient,
  type ZcaPersonalSdkApi,
  type ZcaPersonalSdkMessage,
} from '../zca-personal.client';

describe('ZcaPersonalClient', () => {
  it('normalizes only quoted plain-text replies from the configured operator thread', async () => {
    const messageHandlers: Array<(message: ZcaPersonalSdkMessage) => void> = [];
    const listener = {
      onAvailable: vi.fn(),
      onMessage: vi.fn((handler: (message: ZcaPersonalSdkMessage) => void) => {
        messageHandlers.push(handler);
      }),
      onUnavailable: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const api: ZcaPersonalSdkApi = {
      listener,
      sendMessage: vi.fn().mockResolvedValue({ message: { msgId: 987 }, attachment: [] }),
    };
    const client = new ZcaPersonalClient(
      {
        cookieJson: '[]',
        imei: 'poc-imei',
        userAgent: 'poc-user-agent',
      },
      { operatorThreadId: 'operator-thread', operatorThreadType: 'group' },
      vi.fn().mockResolvedValue(api),
    );
    const onMessage = vi.fn();

    await client.connect({ onAvailable: vi.fn(), onMessage, onUnavailable: vi.fn() });
    messageHandlers[0]?.({
      isSelf: false,
      threadId: 'operator-thread',
      type: 'group',
      data: {
        content: 'Phản hồi từ operator',
        msgId: 'reply-1',
        ts: '1794960001000',
        quote: { globalMsgId: 123456 },
      },
    });
    messageHandlers[0]?.({
      isSelf: false,
      threadId: 'another-thread',
      type: 'group',
      data: {
        content: 'Sai thread',
        msgId: 'reply-2',
        ts: '1794960001000',
        quote: { globalMsgId: 123456 },
      },
    });

    expect(onMessage).toHaveBeenCalledOnce();
    expect(onMessage).toHaveBeenCalledWith({
      externalMessageId: 'zalo:reply-1',
      replyToExternalMessageId: 'zalo:123456',
      content: 'Phản hồi từ operator',
      createdAt: new Date('2026-11-18T00:00:01.000Z'),
    });
    await expect(client.sendText('Visitor message', 'operator-thread', 'group')).resolves.toBe(
      '987',
    );
    client.stop();
    expect(listener.stop).toHaveBeenCalledOnce();
  });
});
