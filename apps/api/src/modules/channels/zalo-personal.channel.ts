import { type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';

import type {
  ChannelMessage,
  ChannelMessageResult,
  ChatChannel,
  ReceiveChannelMessages,
  SendChannelMessage,
} from './chat-channel';
import type { ZaloPersonalClient, ZaloThreadType } from './zca-personal.client';
import { ChannelUnavailableError } from './channel-unavailable.error';

export type ZaloPersonalChannelOptions = {
  operatorThreadId: string;
  operatorThreadType: ZaloThreadType;
};

export class ZaloPersonalChannel implements ChatChannel, OnModuleInit, OnModuleDestroy {
  private available = false;
  private readonly pendingReplies = new Map<string, ChannelMessage[]>();
  private readonly seenIncomingMessageIds = new Set<string>();

  constructor(
    private readonly options: ZaloPersonalChannelOptions,
    private readonly client: ZaloPersonalClient,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect({
        onAvailable: () => {
          this.available = true;
        },
        onMessage: (message) => {
          if (this.seenIncomingMessageIds.has(message.externalMessageId)) return;
          this.seenIncomingMessageIds.add(message.externalMessageId);
          const replies = this.pendingReplies.get(message.replyToExternalMessageId) ?? [];
          replies.push({
            externalMessageId: message.externalMessageId,
            content: message.content,
            createdAt: message.createdAt,
          });
          this.pendingReplies.set(message.replyToExternalMessageId, replies);
        },
        onUnavailable: () => {
          this.available = false;
        },
      });
      this.available = true;
    } catch {
      this.available = false;
    }
  }

  onModuleDestroy(): void {
    this.available = false;
    this.client.stop();
  }

  async send(input: SendChannelMessage): Promise<ChannelMessageResult> {
    if (!this.available) throw new ChannelUnavailableError();

    const content = `[Chat Widget · ${input.widgetId} · ${input.sessionId.slice(0, 8)}]\n${input.content}`;
    try {
      const externalMessageId = await this.client.sendText(
        content,
        this.options.operatorThreadId,
        this.options.operatorThreadType,
      );
      return { externalMessageId: `zalo:${externalMessageId}` };
    } catch {
      throw new ChannelUnavailableError();
    }
  }

  async receive(input: ReceiveChannelMessages): Promise<ChannelMessage[]> {
    const replies = input.outboundExternalMessageIds.flatMap(
      (externalMessageId) => this.pendingReplies.get(externalMessageId) ?? [],
    );
    for (const externalMessageId of input.outboundExternalMessageIds) {
      this.pendingReplies.delete(externalMessageId);
    }
    return replies;
  }
}
