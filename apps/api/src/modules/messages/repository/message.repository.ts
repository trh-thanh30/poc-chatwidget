import type {
  ChatMessage,
  CreateVisitorMessageResult,
  NewOperatorMessage,
  NewVisitorMessage,
} from '../types/message.types';

export interface MessageRepository {
  createVisitorMessage(input: NewVisitorMessage): Promise<CreateVisitorMessageResult>;
  createOperatorMessage(input: NewOperatorMessage): Promise<ChatMessage>;
  listMessages(sessionId: string): Promise<ChatMessage[]>;
}
