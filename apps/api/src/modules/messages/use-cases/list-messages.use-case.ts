import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import type { ChatChannel } from '../../channels/chat-channel';
import { CHAT_CHANNEL } from '../../channels/chat-channel.constants';
import type { WidgetSessionContext } from '../../widget-sessions/types/widget-session.types';
import { MESSAGE_REPOSITORY } from '../message.constants';
import type { MessageRepository } from '../repository/message.repository';
import { toMessageResponse } from '../types/message.types';

@Injectable()
export class ListMessagesUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY) private readonly messages: MessageRepository,
    @Inject(CHAT_CHANNEL) private readonly channel: ChatChannel,
  ) {}

  async execute(session: WidgetSessionContext) {
    const outboundExternalMessageIds = await this.messages.listVisitorChannelMessageIds(session.id);
    const incoming = await this.channel.receive({
      sessionId: session.id,
      widgetId: session.widgetId,
      outboundExternalMessageIds,
    });

    for (const message of incoming) {
      await this.messages.createOperatorMessage({
        id: randomUUID(),
        sessionId: session.id,
        content: message.content,
        channelMessageId: message.externalMessageId,
        createdAt: message.createdAt,
      });
    }

    const messages = await this.messages.listMessages(session.id);
    return { data: { messages: messages.map(toMessageResponse) } };
  }
}
