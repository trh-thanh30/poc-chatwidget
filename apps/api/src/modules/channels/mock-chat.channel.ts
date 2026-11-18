import { Injectable } from '@nestjs/common';

import type {
  ChannelMessage,
  ChannelMessageResult,
  ChatChannel,
  ReceiveChannelMessages,
  SendChannelMessage,
} from './chat-channel';

const MOCK_REPLY_PREFIX = 'Mock reply: ';
const MOCK_REPLY_MAX_LENGTH = 2_000;

@Injectable()
export class MockChatChannel implements ChatChannel {
  private readonly pendingReplies = new Map<string, ChannelMessage[]>();

  async send(input: SendChannelMessage): Promise<ChannelMessageResult> {
    const replies = this.pendingReplies.get(input.sessionId) ?? [];
    replies.push({
      externalMessageId: `mock:reply:${input.messageId}`,
      content: Array.from(`${MOCK_REPLY_PREFIX}${input.content}`)
        .slice(0, MOCK_REPLY_MAX_LENGTH)
        .join(''),
      createdAt: new Date(input.createdAt.getTime() + 1),
    });
    this.pendingReplies.set(input.sessionId, replies);

    return { externalMessageId: `mock:visitor:${input.messageId}` };
  }

  async receive(input: ReceiveChannelMessages): Promise<ChannelMessage[]> {
    const replies = this.pendingReplies.get(input.sessionId) ?? [];
    this.pendingReplies.delete(input.sessionId);
    return replies;
  }
}
