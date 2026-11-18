export type MessageDirection = 'visitor' | 'operator';

export type ChatMessage = {
  id: string;
  sessionId: string;
  direction: MessageDirection;
  content: string;
  idempotencyKey: string | null;
  channelMessageId: string | null;
  createdAt: Date;
};

export type NewVisitorMessage = Omit<
  ChatMessage,
  'direction' | 'channelMessageId' | 'idempotencyKey'
> & {
  idempotencyKey: string;
};

export type NewOperatorMessage = Omit<
  ChatMessage,
  'direction' | 'idempotencyKey' | 'channelMessageId'
> & {
  channelMessageId: string;
};

export type CreateVisitorMessageResult = {
  message: ChatMessage;
  created: boolean;
};

export type MessageResponse = {
  id: string;
  direction: MessageDirection;
  content: string;
  createdAt: string;
};

export function toMessageResponse(message: ChatMessage): MessageResponse {
  return {
    id: message.id,
    direction: message.direction,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  };
}
