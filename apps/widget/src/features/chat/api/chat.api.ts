import { createHttpClient } from '../../../lib/http-client';
import type {
  ChatMessage,
  ListChatMessagesResponse,
  SendChatMessageInput,
  SendChatMessageResponse,
} from '../types/chat.types';

export interface ChatClient {
  listMessages(signal: AbortSignal): Promise<ChatMessage[]>;
  sendMessage(input: SendChatMessageInput, signal: AbortSignal): Promise<ChatMessage>;
}

export function createChatClient(
  apiUrl: string,
  getAccessToken: () => string | undefined,
): ChatClient {
  const http = createHttpClient({ baseUrl: apiUrl, getAccessToken });

  return {
    async listMessages(signal) {
      const response = await http.get<ListChatMessagesResponse>('/messages', { signal });
      return response.data.data.messages;
    },
    async sendMessage(input, signal) {
      const response = await http.post<SendChatMessageResponse>('/messages', input, { signal });
      return response.data.data.message;
    },
  };
}
