import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { isRateLimitHttpClientError } from '../../../lib/http-client.error';
import type { ChatClient } from '../api/chat.api';
import { chatKeys } from '../api/chat.keys';
import type { ChatMessage, SendChatMessageInput } from '../types/chat.types';
import { useRateLimitCooldown } from './use-rate-limit-cooldown';

const POLL_INTERVAL_MS = 2_000;

export function useChatMessages({
  client,
  enabled = true,
  widgetId,
}: {
  client: ChatClient;
  enabled?: boolean;
  widgetId: string;
}) {
  const queryClient = useQueryClient();
  const mutationController = useRef<AbortController | null>(null);
  const sendLocked = useRef(false);
  const rateLimit = useRateLimitCooldown(client);
  const queryKey = chatKeys.messages(widgetId);
  const messages = useQuery({
    enabled,
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
    if (sendLocked.current || rateLimit.isBlockedNow()) return false;
    sendLocked.current = true;
    try {
      await sendMutation.mutateAsync(input);
      return true;
    } catch (error) {
      if (isRateLimitHttpClientError(error)) rateLimit.start(error.retryAfterSeconds);
      return false;
    } finally {
      sendLocked.current = false;
    }
  }

  return { messages, rateLimit, send, sendMutation };
}
