import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ZaloPersonalChannel } from '../zalo-personal.channel';
import { ZcaPersonalClient, type ZaloThreadType } from '../zca-personal.client';

const liveTestEnabled = process.env.RUN_ZALO_LIVE_TESTS === '1';
const LIVE_REPLY_TIMEOUT_MS = 90_000;
const POLL_INTERVAL_MS = 2_000;

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for the opt-in Zalo live test.`);
  return value;
}

function requiredThreadType(): ZaloThreadType {
  const value = requiredEnvironment('ZALO_PERSONAL_OPERATOR_THREAD_TYPE');
  if (value === 'user' || value === 'group') return value;
  throw new Error('ZALO_PERSONAL_OPERATOR_THREAD_TYPE must be user or group.');
}

describe.runIf(liveTestEnabled)('ZaloPersonalChannel live integration', () => {
  let channel: ZaloPersonalChannel;

  beforeAll(async () => {
    const options = {
      operatorThreadId: requiredEnvironment('ZALO_PERSONAL_OPERATOR_THREAD_ID'),
      operatorThreadType: requiredThreadType(),
    };
    channel = new ZaloPersonalChannel(
      options,
      new ZcaPersonalClient(
        {
          cookieJson: requiredEnvironment('ZALO_PERSONAL_COOKIE_JSON'),
          imei: requiredEnvironment('ZALO_PERSONAL_IMEI'),
          userAgent: requiredEnvironment('ZALO_PERSONAL_USER_AGENT'),
        },
        options,
      ),
    );
    await channel.onModuleInit();
  });

  afterAll(() => channel?.onModuleDestroy());

  it(
    'sends a visitor message and receives a human quoted reply',
    async () => {
      const sent = await channel.send({
        sessionId: 'live-validation-session',
        widgetId: 'live-validation-widget',
        messageId: 'live-validation-message',
        content: 'POC live test: hãy quote tin nhắn này và trả lời bằng plain text trong 90 giây.',
        createdAt: new Date(),
      });
      const deadline = Date.now() + LIVE_REPLY_TIMEOUT_MS;

      while (Date.now() < deadline) {
        const replies = await channel.receive({
          sessionId: 'live-validation-session',
          widgetId: 'live-validation-widget',
          outboundExternalMessageIds: [sent.externalMessageId],
        });
        if (replies.length > 0) {
          expect(replies[0]).toMatchObject({
            externalMessageId: expect.stringMatching(/^zalo:/u),
            content: expect.any(String),
          });
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }

      throw new Error('No quoted Zalo reply was received before the live-test timeout.');
    },
    LIVE_REPLY_TIMEOUT_MS + 10_000,
  );
});
