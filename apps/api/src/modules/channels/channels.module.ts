import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import type { ChatChannel } from './chat-channel';
import { CHAT_CHANNEL } from './chat-channel.constants';
import { MockChatChannel } from './mock-chat.channel';
import { ZaloPersonalChannel } from './zalo-personal.channel';
import { ZcaPersonalClient, type ZaloThreadType } from './zca-personal.client';

function createChatChannel(config: ConfigService): ChatChannel {
  if (config.get<'mock' | 'zalo-personal'>('CHAT_CHANNEL', 'mock') === 'mock') {
    return new MockChatChannel();
  }

  const options = {
    operatorThreadId: config.getOrThrow<string>('ZALO_PERSONAL_OPERATOR_THREAD_ID'),
    operatorThreadType: config.getOrThrow<ZaloThreadType>(
      'ZALO_PERSONAL_OPERATOR_THREAD_TYPE',
    ),
  };
  const client = new ZcaPersonalClient(
    {
      cookieJson: config.getOrThrow<string>('ZALO_PERSONAL_COOKIE_JSON'),
      imei: config.getOrThrow<string>('ZALO_PERSONAL_IMEI'),
      userAgent: config.getOrThrow<string>('ZALO_PERSONAL_USER_AGENT'),
    },
    options,
  );
  return new ZaloPersonalChannel(options, client);
}

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CHAT_CHANNEL,
      inject: [ConfigService],
      useFactory: createChatChannel,
    },
  ],
  exports: [CHAT_CHANNEL],
})
export class ChannelsModule {}
