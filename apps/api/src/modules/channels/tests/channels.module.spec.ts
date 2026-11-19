import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

import { CHAT_CHANNEL } from '../chat-channel.constants';
import type { ChatChannel } from '../chat-channel';
import { ChannelsModule } from '../channels.module';
import { MockChatChannel } from '../mock-chat.channel';
import { ZaloPersonalChannel } from '../zalo-personal.channel';

describe('ChannelsModule', () => {
  it('uses MockChatChannel by default without Zalo credentials', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [ChannelsModule] })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService({ CHAT_CHANNEL: 'mock' }))
      .compile();

    expect(moduleRef.get<ChatChannel>(CHAT_CHANNEL)).toBeInstanceOf(MockChatChannel);
    await moduleRef.close();
  });

  it('selects ZaloPersonalChannel only for explicit opt-in configuration', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [ChannelsModule] })
      .overrideProvider(ConfigService)
      .useValue(
        new ConfigService({
          CHAT_CHANNEL: 'zalo-personal',
          ZALO_PERSONAL_COOKIE_JSON: '[]',
          ZALO_PERSONAL_IMEI: 'poc-imei',
          ZALO_PERSONAL_USER_AGENT: 'poc-user-agent',
          ZALO_PERSONAL_OPERATOR_THREAD_ID: 'operator-thread',
          ZALO_PERSONAL_OPERATOR_THREAD_TYPE: 'user',
        }),
      )
      .compile();

    expect(moduleRef.get<ChatChannel>(CHAT_CHANNEL)).toBeInstanceOf(ZaloPersonalChannel);
    await moduleRef.close();
  });
});
