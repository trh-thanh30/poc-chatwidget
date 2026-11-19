import type {
  ChatMessage,
  CreateVisitorMessageResult,
  NewOperatorMessage,
  NewVisitorMessage,
} from '../types/message.types';

export interface MessageRepository {
  createVisitorMessage(input: NewVisitorMessage): Promise<CreateVisitorMessageResult>;
  createOperatorMessage(input: NewOperatorMessage): Promise<ChatMessage>;
  setVisitorChannelMessageId(messageId: string, channelMessageId: string): Promise<void>;
  listVisitorChannelMessageIds(sessionId: string): Promise<string[]>;
  listMessages(sessionId: string): Promise<ChatMessage[]>;
}
