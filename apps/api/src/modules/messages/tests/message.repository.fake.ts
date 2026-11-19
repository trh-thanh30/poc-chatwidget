import type { MessageRepository } from '../repository/message.repository';
import type {
  ChatMessage,
  CreateVisitorMessageResult,
  NewOperatorMessage,
  NewVisitorMessage,
} from '../types/message.types';

export class InMemoryMessageRepository implements MessageRepository {
  readonly messages: ChatMessage[] = [];

  async createVisitorMessage(input: NewVisitorMessage): Promise<CreateVisitorMessageResult> {
    const existing = this.messages.find(
      (message) =>
        message.sessionId === input.sessionId && message.idempotencyKey === input.idempotencyKey,
    );
    if (existing) return { message: existing, created: false };

    const message: ChatMessage = {
      ...input,
      direction: 'visitor',
      channelMessageId: null,
    };
    this.messages.push(message);
    return { message, created: true };
  }

  async createOperatorMessage(input: NewOperatorMessage): Promise<ChatMessage> {
    const existing = this.messages.find(
      (message) => message.channelMessageId === input.channelMessageId,
    );
    if (existing) return existing;

    const message: ChatMessage = {
      ...input,
      direction: 'operator',
      idempotencyKey: null,
    };
    this.messages.push(message);
    return message;
  }

  async setVisitorChannelMessageId(messageId: string, channelMessageId: string): Promise<void> {
    const message = this.messages.find(
      (candidate) => candidate.id === messageId && candidate.direction === 'visitor',
    );
    if (message) message.channelMessageId = channelMessageId;
  }

  async listVisitorChannelMessageIds(sessionId: string): Promise<string[]> {
    return this.messages.flatMap((message) =>
      message.sessionId === sessionId &&
      message.direction === 'visitor' &&
      message.channelMessageId
        ? [message.channelMessageId]
        : [],
    );
  }

  async listMessages(sessionId: string): Promise<ChatMessage[]> {
    return this.messages
      .filter((message) => message.sessionId === sessionId)
      .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
  }
}
