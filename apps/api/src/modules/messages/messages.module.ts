import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

import { DatabaseModule } from '../../database/database.module';
import { CHAT_CHANNEL } from '../channels/chat-channel.constants';
import { MockChatChannel } from '../channels/mock-chat.channel';
import { WidgetSessionsModule } from '../widget-sessions/widget-sessions.module';
import { MESSAGE_REPOSITORY } from './message.constants';
import { MessagesController } from './messages.controller';
import {
  MESSAGE_RATE_LIMIT,
  MESSAGE_RATE_LIMIT_WINDOW_MS,
  MessageRateLimitGuard,
} from './policies/message-rate-limit.guard';
import { DrizzleMessageRepository } from './repository/drizzle-message.repository';
import { ListMessagesUseCase } from './use-cases/list-messages.use-case';
import { SendMessageUseCase } from './use-cases/send-message.use-case';

@Module({
  imports: [
    DatabaseModule,
    WidgetSessionsModule,
    ThrottlerModule.forRoot([
      {
        limit: MESSAGE_RATE_LIMIT,
        ttl: MESSAGE_RATE_LIMIT_WINDOW_MS,
        blockDuration: 0,
      },
    ]),
  ],
  controllers: [MessagesController],
  providers: [
    SendMessageUseCase,
    ListMessagesUseCase,
    MessageRateLimitGuard,
    DrizzleMessageRepository,
    MockChatChannel,
    { provide: MESSAGE_REPOSITORY, useExisting: DrizzleMessageRepository },
    { provide: CHAT_CHANNEL, useExisting: MockChatChannel },
  ],
})
export class MessagesModule {}
