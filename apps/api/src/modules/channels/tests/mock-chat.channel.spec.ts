import { describe, expect, it } from 'vitest';

import { MockChatChannel } from '../mock-chat.channel';

describe('MockChatChannel', () => {
  it('keeps deterministic replies within the persisted message limit', async () => {
    const channel = new MockChatChannel();

    await channel.send({
      sessionId: 'session-a',
      widgetId: 'demo-widget',
      messageId: 'message-a',
      content: 'x'.repeat(2_000),
      createdAt: new Date('2026-11-18T00:00:00.000Z'),
    });
    const [reply] = await channel.receive({
      sessionId: 'session-a',
      widgetId: 'demo-widget',
      outboundExternalMessageIds: [],
    });

    expect(reply?.content).toHaveLength(2_000);
    expect(reply?.content.startsWith('Mock reply: ')).toBe(true);
  });
});
