import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { CHAT_CHANNEL } from '../channels/chat-channel.constants';
import { MockChatChannel } from '../channels/mock-chat.channel';
import { WidgetSessionsModule } from '../widget-sessions/widget-sessions.module';
import { MESSAGE_REPOSITORY } from './message.constants';
import { MessagesController } from './messages.controller';
import { DrizzleMessageRepository } from './repository/drizzle-message.repository';
import { ListMessagesUseCase } from './use-cases/list-messages.use-case';
import { SendMessageUseCase } from './use-cases/send-message.use-case';

@Module({
  imports: [DatabaseModule, WidgetSessionsModule],
  controllers: [MessagesController],
  providers: [
    SendMessageUseCase,
    ListMessagesUseCase,
    DrizzleMessageRepository,
    MockChatChannel,
    { provide: MESSAGE_REPOSITORY, useExisting: DrizzleMessageRepository },
    { provide: CHAT_CHANNEL, useExisting: MockChatChannel },
  ],
})
export class MessagesModule {}
