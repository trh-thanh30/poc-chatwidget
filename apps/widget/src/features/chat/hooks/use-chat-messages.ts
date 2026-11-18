import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ChatClient } from '../api/chat.api';
import { chatKeys } from '../api/chat.keys';
import type { ChatMessage, SendChatMessageInput } from '../types/chat.types';

const POLL_INTERVAL_MS = 2_000;

export function useChatMessages({ client, widgetId }: { client: ChatClient; widgetId: string }) {
  const queryClient = useQueryClient();
  const mutationController = useRef<AbortController | null>(null);
  const sendLocked = useRef(false);
  const queryKey = chatKeys.messages(widgetId);
  const messages = useQuery({
    queryKey,
    queryFn: ({ signal }) => client.listMessages(signal),
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
  const sendMutation = useMutation({
    mutationFn: async (input: SendChatMessageInput) => {
      const controller = new AbortController();
      mutationController.current = controller;
      try {
        return await client.sendMessage(input, controller.signal);
      } finally {
        if (mutationController.current === controller) mutationController.current = null;
      }
    },
    onSuccess: async (sentMessage) => {
      queryClient.setQueryData<ChatMessage[]>(queryKey, (current = []) =>
        current.some((message) => message.id === sentMessage.id)
          ? current
          : [...current, sentMessage],
      );
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  useEffect(() => () => mutationController.current?.abort(), []);

  async function send(input: SendChatMessageInput): Promise<boolean> {
    if (sendLocked.current) return false;
    sendLocked.current = true;
    try {
      await sendMutation.mutateAsync(input);
      return true;
    } catch {
      return false;
    } finally {
      sendLocked.current = false;
    }
  }

  return { messages, send, sendMutation };
}
