export type SendChannelMessage = {
  sessionId: string;
  widgetId: string;
  messageId: string;
  content: string;
  createdAt: Date;
};

export type ChannelMessageResult = {
  externalMessageId: string;
};

export type ReceiveChannelMessages = {
  sessionId: string;
  widgetId: string;
  outboundExternalMessageIds: string[];
};

export type ChannelMessage = {
  externalMessageId: string;
  content: string;
  createdAt: Date;
};

export interface ChatChannel {
  send(input: SendChannelMessage): Promise<ChannelMessageResult>;
  receive(input: ReceiveChannelMessages): Promise<ChannelMessage[]>;
}
