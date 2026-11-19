import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import { BadRequestError } from '../../../common/errors/bad-request.error';
import type { ChatChannel } from '../../channels/chat-channel';
import { CHAT_CHANNEL } from '../../channels/chat-channel.constants';
import type { WidgetSessionContext } from '../../widget-sessions/types/widget-session.types';
import { MESSAGE_MAX_LENGTH, MESSAGE_REPOSITORY } from '../message.constants';
import type { MessageRepository } from '../repository/message.repository';
import { toMessageResponse } from '../types/message.types';

type SendMessageInput = {
  session: WidgetSessionContext;
  content: string;
  idempotencyKey: string;
};

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY) private readonly messages: MessageRepository,
    @Inject(CHAT_CHANNEL) private readonly channel: ChatChannel,
  ) {}

  async execute(input: SendMessageInput) {
    const content = input.content.trim();
    if (!content || Array.from(content).length > MESSAGE_MAX_LENGTH) {
      throw new BadRequestError('VALIDATION_ERROR', 'Request validation failed.');
    }

    const result = await this.messages.createVisitorMessage({
      id: randomUUID(),
      sessionId: input.session.id,
      content,
      idempotencyKey: input.idempotencyKey,
      createdAt: new Date(),
    });

    if (!result.message.channelMessageId) {
      const sent = await this.channel.send({
        sessionId: input.session.id,
        widgetId: input.session.widgetId,
        messageId: result.message.id,
        content: result.message.content,
        createdAt: result.message.createdAt,
      });
      await this.messages.setVisitorChannelMessageId(
        result.message.id,
        sent.externalMessageId,
      );
    }

    return { data: { message: toMessageResponse(result.message) } };
  }
}
