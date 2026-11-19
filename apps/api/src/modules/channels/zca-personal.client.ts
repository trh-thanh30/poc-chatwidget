import { ThreadType, Zalo, type Credentials, type Message } from 'zca-js';

export type ZaloThreadType = 'user' | 'group';

export type ZaloIncomingMessage = {
  externalMessageId: string;
  replyToExternalMessageId: string;
  content: string;
  createdAt: Date;
};

export type ZaloPersonalClientHandlers = {
  onAvailable(): void;
  onMessage(message: ZaloIncomingMessage): void;
  onUnavailable(): void;
};

export interface ZaloPersonalClient {
  connect(handlers: ZaloPersonalClientHandlers): Promise<void>;
  sendText(content: string, threadId: string, threadType: ZaloThreadType): Promise<string>;
  stop(): void;
}

export type ZcaPersonalCredentials = {
  cookieJson: string;
  imei: string;
  userAgent: string;
};

export type ZcaPersonalSdkMessage = {
  isSelf: boolean;
  threadId: string;
  type: ZaloThreadType;
  data: {
    content: unknown;
    msgId: string;
    ts: string;
    quote?: { globalMsgId: number };
  };
};

export type ZcaPersonalSdkApi = {
  listener: {
    onAvailable(handler: () => void): void;
    onMessage(handler: (message: ZcaPersonalSdkMessage) => void): void;
    onUnavailable(handler: () => void): void;
    start(): void;
    stop(): void;
  };
  sendMessage(
    content: string,
    threadId: string,
    threadType: ZaloThreadType,
  ): Promise<{ message: { msgId: number } | null; attachment: Array<{ msgId: number }> }>;
};

export type ZcaPersonalSdkFactory = (
  credentials: ZcaPersonalCredentials,
) => Promise<ZcaPersonalSdkApi>;

function toSdkMessage(message: Message): ZcaPersonalSdkMessage {
  return {
    isSelf: message.isSelf,
    threadId: message.threadId,
    type: message.type === ThreadType.Group ? 'group' : 'user',
    data: {
      content: message.data.content,
      msgId: message.data.msgId,
      ts: message.data.ts,
      ...(message.data.quote
        ? { quote: { globalMsgId: message.data.quote.globalMsgId } }
        : {}),
    },
  };
}

async function createZcaApi(credentials: ZcaPersonalCredentials): Promise<ZcaPersonalSdkApi> {
  const parsedCookie: unknown = JSON.parse(credentials.cookieJson);
  if (!Array.isArray(parsedCookie)) throw new Error('Zalo cookie must be a JSON array.');

  const api = await new Zalo().login({
    cookie: parsedCookie as Credentials['cookie'],
    imei: credentials.imei,
    userAgent: credentials.userAgent,
  });

  return {
    listener: {
      onAvailable(handler) {
        api.listener.on('connected', handler);
      },
      onMessage(handler) {
        api.listener.on('message', (message) => handler(toSdkMessage(message)));
      },
      onUnavailable(handler) {
        api.listener.on('closed', () => handler());
        api.listener.on('disconnected', () => handler());
        api.listener.on('error', () => handler());
      },
      start() {
        api.listener.start({ retryOnClose: true });
      },
      stop() {
        api.listener.stop();
      },
    },
    sendMessage(content, threadId, threadType) {
      return api.sendMessage(
        content,
        threadId,
        threadType === 'group' ? ThreadType.Group : ThreadType.User,
      );
    },
  };
}

export class ZcaPersonalClient implements ZaloPersonalClient {
  private api: ZcaPersonalSdkApi | undefined;

  constructor(
    private readonly credentials: ZcaPersonalCredentials,
    private readonly options: {
      operatorThreadId: string;
      operatorThreadType: ZaloThreadType;
    },
    private readonly createApi: ZcaPersonalSdkFactory = createZcaApi,
  ) {}

  async connect(handlers: ZaloPersonalClientHandlers): Promise<void> {
    const api = await this.createApi(this.credentials);
    this.api = api;
    api.listener.onAvailable(handlers.onAvailable);
    api.listener.onUnavailable(handlers.onUnavailable);
    api.listener.onMessage((message) => {
      const quoteId = message.data.quote?.globalMsgId;
      if (
        message.isSelf ||
        message.threadId !== this.options.operatorThreadId ||
        message.type !== this.options.operatorThreadType ||
        typeof message.data.content !== 'string' ||
        !message.data.msgId ||
        quoteId === undefined
      ) {
        return;
      }

      const timestamp = Number(message.data.ts);
      handlers.onMessage({
        externalMessageId: `zalo:${message.data.msgId}`,
        replyToExternalMessageId: `zalo:${quoteId}`,
        content: message.data.content,
        createdAt: Number.isFinite(timestamp) ? new Date(timestamp) : new Date(),
      });
    });
    api.listener.start();
    handlers.onAvailable();
  }

  async sendText(
    content: string,
    threadId: string,
    threadType: ZaloThreadType,
  ): Promise<string> {
    if (!this.api) throw new Error('Zalo Personal client is not connected.');
    const response = await this.api.sendMessage(content, threadId, threadType);
    if (!response.message) throw new Error('Zalo did not return a message ID.');
    return String(response.message.msgId);
  }

  stop(): void {
    this.api?.listener.stop();
    this.api = undefined;
  }
}
