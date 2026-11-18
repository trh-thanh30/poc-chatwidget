export type ChatMessageDirection = 'visitor' | 'operator';

export type ChatMessage = {
  id: string;
  direction: ChatMessageDirection;
  content: string;
  createdAt: string;
};

export type SendChatMessageInput = {
  content: string;
  idempotencyKey: string;
};

export type SendChatMessageResponse = {
  data: {
    message: ChatMessage;
  };
};

export type ListChatMessagesResponse = {
  data: {
    messages: ChatMessage[];
  };
};
