// @vitest-environment jsdom

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { destroyChatWidget, mountChatWidget } from '../../../mount-widget';
import { HttpClientError } from '../../../lib/http-client';
import { createWidgetQueryClient } from '../../../lib/query-client';
import type { WidgetSessionClient } from '../../session/api/widget-session.api';
import type { ChatClient } from '../api/chat.api';
import { ChatPanel } from '../chat-panel';
import type { ChatMessage } from '../types/chat.types';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const visitorMessage: ChatMessage = {
  id: 'visitor-message',
  direction: 'visitor',
  content: 'Xin chào',
  createdAt: '2026-11-18T10:00:00.000Z',
};

const operatorReply: ChatMessage = {
  id: 'operator-reply',
  direction: 'operator',
  content: 'Mock reply: Xin chào',
  createdAt: '2026-11-18T10:00:00.001Z',
};

const sessionClient: WidgetSessionClient = {
  createSession: vi.fn().mockResolvedValue({
    token: 'memory-only-session-token',
    expiresAt: '2026-11-18T10:15:00.000Z',
  }),
};

async function flushUi(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

async function mountOpenChat(chatClient: ChatClient): Promise<HTMLElement> {
  let host!: HTMLElement;
  await act(async () => {
    host = mountChatWidget(
      { apiUrl: 'http://localhost:3000/api/v1', widgetId: 'demo-widget' },
      document,
      { chatClient, sessionClient },
    );
  });
  await flushUi();
  await act(async () =>
    host.shadowRoot
      ?.querySelector<HTMLButtonElement>('button[aria-label="Mở cửa sổ chat"]')
      ?.click(),
  );
  await flushUi();
  return host;
}

async function enterDraft(
  composer: HTMLTextAreaElement | null | undefined,
  value: string,
): Promise<void> {
  await act(async () => {
    const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
    if (composer) setValue?.call(composer, value);
    composer?.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

afterEach(() => {
  act(() => destroyChatWidget());
  vi.restoreAllMocks();
});

describe('Widget chat flow', () => {
  it('sends a visitor message and renders the Mock reply after refetch', async () => {
    let resolveSend!: (message: ChatMessage) => void;
    const chatClient: ChatClient = {
      listMessages: vi
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([visitorMessage, operatorReply]),
      sendMessage: vi.fn(
        () =>
          new Promise<ChatMessage>((resolve) => {
            resolveSend = resolve;
          }),
      ),
    };

    let host!: HTMLElement;
    await act(async () => {
      host = mountChatWidget(
        { apiUrl: 'http://localhost:3000/api/v1', widgetId: 'demo-widget' },
        document,
        { chatClient, sessionClient },
      );
    });
    await flushUi();

    const launcher = host.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[aria-label="Mở cửa sổ chat"]',
    );
    await act(async () => launcher?.click());
    await flushUi();

    const composer = host.shadowRoot?.querySelector<HTMLTextAreaElement>('#chat-message');
    expect(composer?.disabled).toBe(false);
    await act(async () => {
      if (!composer) return;
      const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
      setValue?.call(composer, 'Xin chào');
      composer.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await act(async () =>
      composer?.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', shiftKey: true }),
      ),
    );
    expect(chatClient.sendMessage).not.toHaveBeenCalled();
    await act(async () =>
      composer?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' })),
    );

    expect(host.shadowRoot?.textContent).toContain('Đang gửi');
    expect(chatClient.sendMessage).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSend(visitorMessage);
      await Promise.resolve();
    });
    await flushUi();

    expect(host.shadowRoot?.textContent).toContain('Xin chào');
    expect(host.shadowRoot?.textContent).toContain('Mock reply: Xin chào');
    expect(host.shadowRoot?.textContent).toContain('Đã gửi');
  });

  it('rejects whitespace-only drafts with accessible feedback', async () => {
    const chatClient: ChatClient = {
      listMessages: vi.fn().mockResolvedValue([]),
      sendMessage: vi.fn(),
    };
    let host!: HTMLElement;
    await act(async () => {
      host = mountChatWidget(
        { apiUrl: 'http://localhost:3000/api/v1', widgetId: 'demo-widget' },
        document,
        { chatClient, sessionClient },
      );
    });
    await flushUi();
    const launcher = host.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[aria-label="Mở cửa sổ chat"]',
    );
    await act(async () => launcher?.click());
    await flushUi();

    const composer = host.shadowRoot?.querySelector<HTMLTextAreaElement>('#chat-message');
    await act(async () => {
      const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
      if (composer) setValue?.call(composer, '   ');
      composer?.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => composer?.form?.requestSubmit());

    expect(host.shadowRoot?.querySelector('#chat-composer-feedback')?.textContent).toContain(
      'Hãy nhập nội dung',
    );
    expect(composer?.getAttribute('aria-invalid')).toBe('true');
    expect(chatClient.sendMessage).not.toHaveBeenCalled();
  });

  it('rejects drafts over 2,000 Unicode characters', async () => {
    const chatClient: ChatClient = {
      listMessages: vi.fn().mockResolvedValue([]),
      sendMessage: vi.fn(),
    };
    let host!: HTMLElement;
    await act(async () => {
      host = mountChatWidget(
        { apiUrl: 'http://localhost:3000/api/v1', widgetId: 'demo-widget' },
        document,
        { chatClient, sessionClient },
      );
    });
    await flushUi();
    await act(async () =>
      host.shadowRoot
        ?.querySelector<HTMLButtonElement>('button[aria-label="Mở cửa sổ chat"]')
        ?.click(),
    );
    await flushUi();

    const composer = host.shadowRoot?.querySelector<HTMLTextAreaElement>('#chat-message');
    await act(async () => {
      const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
      if (composer) setValue?.call(composer, '🙂'.repeat(2_001));
      composer?.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => composer?.form?.requestSubmit());

    expect(host.shadowRoot?.querySelector('#chat-composer-feedback')?.textContent).toContain(
      'tối đa 2.000 ký tự',
    );
    expect(chatClient.sendMessage).not.toHaveBeenCalled();
  });

  it('does not create duplicate send intents on double submit', async () => {
    let resolveSend!: (message: ChatMessage) => void;
    const chatClient: ChatClient = {
      listMessages: vi.fn().mockResolvedValue([]),
      sendMessage: vi.fn(
        () =>
          new Promise<ChatMessage>((resolve) => {
            resolveSend = resolve;
          }),
      ),
    };
    let host!: HTMLElement;
    await act(async () => {
      host = mountChatWidget(
        { apiUrl: 'http://localhost:3000/api/v1', widgetId: 'demo-widget' },
        document,
        { chatClient, sessionClient },
      );
    });
    await flushUi();
    await act(async () =>
      host.shadowRoot
        ?.querySelector<HTMLButtonElement>('button[aria-label="Mở cửa sổ chat"]')
        ?.click(),
    );
    await flushUi();

    const composer = host.shadowRoot?.querySelector<HTMLTextAreaElement>('#chat-message');
    await act(async () => {
      const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
      if (composer) setValue?.call(composer, 'Một lần thôi');
      composer?.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => {
      composer?.form?.requestSubmit();
      composer?.form?.requestSubmit();
    });

    expect(chatClient.sendMessage).toHaveBeenCalledTimes(1);
    const firstIntent = vi.mocked(chatClient.sendMessage).mock.calls[0]?.[0];
    expect(firstIntent).toMatchObject({
      content: 'Một lần thôi',
      idempotencyKey: expect.any(String),
    });

    await act(async () => {
      resolveSend({ ...visitorMessage, content: 'Một lần thôi' });
      await Promise.resolve();
    });
  });

  it('keeps the draft and reuses its idempotency key after a network failure', async () => {
    const chatClient: ChatClient = {
      listMessages: vi.fn().mockResolvedValue([]),
      sendMessage: vi
        .fn()
        .mockRejectedValueOnce(new HttpClientError({ kind: 'network' }))
        .mockResolvedValueOnce({ ...visitorMessage, content: 'Xin thử lại' }),
    };
    let host!: HTMLElement;
    await act(async () => {
      host = mountChatWidget(
        { apiUrl: 'http://localhost:3000/api/v1', widgetId: 'demo-widget' },
        document,
        { chatClient, sessionClient },
      );
    });
    await flushUi();
    await act(async () =>
      host.shadowRoot
        ?.querySelector<HTMLButtonElement>('button[aria-label="Mở cửa sổ chat"]')
        ?.click(),
    );
    await flushUi();

    const composer = host.shadowRoot?.querySelector<HTMLTextAreaElement>('#chat-message');
    await act(async () => {
      const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
      if (composer) setValue?.call(composer, 'Xin thử lại');
      composer?.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => composer?.form?.requestSubmit());
    await flushUi();

    expect(composer?.value).toBe('Xin thử lại');
    expect(host.shadowRoot?.querySelector('#chat-composer-feedback')?.textContent).toContain(
      'Nội dung vẫn được giữ lại',
    );
    const firstKey = vi.mocked(chatClient.sendMessage).mock.calls[0]?.[0].idempotencyKey;

    await act(async () => composer?.form?.requestSubmit());
    await flushUi();

    expect(vi.mocked(chatClient.sendMessage).mock.calls[1]?.[0].idempotencyKey).toBe(firstKey);
    expect(composer?.value).toBe('');
  });

  it('shows a specific recoverable message when the selected channel is unavailable', async () => {
    const chatClient: ChatClient = {
      listMessages: vi.fn().mockResolvedValue([]),
      sendMessage: vi.fn().mockRejectedValue(
        new HttpClientError({
          kind: 'http',
          status: 503,
          code: 'CHANNEL_UNAVAILABLE',
        }),
      ),
    };
    const host = await mountOpenChat(chatClient);
    const composer = host.shadowRoot?.querySelector<HTMLTextAreaElement>('#chat-message');

    await enterDraft(composer, 'Giữ lại nội dung này');
    await act(async () => composer?.form?.requestSubmit());
    await flushUi();

    expect(composer?.value).toBe('Giữ lại nội dung này');
    expect(host.shadowRoot?.querySelector('#chat-composer-feedback')?.textContent).toContain(
      'Kênh hỗ trợ đang tạm gián đoạn',
    );
  });

  it('keeps the draft and disables send while a server rate-limit cooldown is active', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    try {
      const chatClient: ChatClient = {
        listMessages: vi.fn().mockResolvedValue([]),
        sendMessage: vi.fn().mockRejectedValue(
          new HttpClientError({
            kind: 'http',
            status: 429,
            code: 'MESSAGE_RATE_LIMITED',
            retryAfterSeconds: 7,
          }),
        ),
      };
      const host = await mountOpenChat(chatClient);

      const composer = host.shadowRoot?.querySelector<HTMLTextAreaElement>('#chat-message');
      await enterDraft(composer, 'Xin đừng gửi mất');
      await act(async () => composer?.form?.requestSubmit());
      await flushUi();

      const submit = composer?.form?.querySelector<HTMLButtonElement>('button[type="submit"]');
      const feedback = host.shadowRoot?.querySelector('#chat-composer-feedback');
      expect(composer?.value).toBe('Xin đừng gửi mất');
      expect(submit?.disabled).toBe(true);
      expect(feedback?.textContent).toContain('Thử lại sau 7 giây');
      expect(feedback?.textContent).toContain('Nội dung vẫn được giữ lại');
      expect(chatClient.sendMessage).toHaveBeenCalledTimes(1);

      const liveStatus = feedback?.querySelector('[role="status"]');
      const announcement = liveStatus?.textContent;
      expect(announcement).not.toContain('7 giây');

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1_000);
      });

      expect(liveStatus?.textContent).toBe(announcement);
      expect(feedback?.textContent).toContain('Thử lại sau 6 giây');
    } finally {
      vi.useRealTimers();
    }
  });

  it('reenables send after cooldown without automatically resending the draft', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    try {
      const chatClient: ChatClient = {
        listMessages: vi.fn().mockResolvedValue([]),
        sendMessage: vi.fn().mockRejectedValue(
          new HttpClientError({
            kind: 'http',
            status: 429,
            code: 'MESSAGE_RATE_LIMITED',
            retryAfterSeconds: 2,
          }),
        ),
      };
      const host = await mountOpenChat(chatClient);

      const composer = host.shadowRoot?.querySelector<HTMLTextAreaElement>('#chat-message');
      await enterDraft(composer, 'Gửi lại khi tôi yêu cầu');
      await act(async () => composer?.form?.requestSubmit());
      await flushUi();

      const submit = composer?.form?.querySelector<HTMLButtonElement>('button[type="submit"]');
      expect(submit?.disabled).toBe(true);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(2_000);
      });

      expect(submit?.disabled).toBe(false);
      expect(composer?.value).toBe('Gửi lại khi tôi yêu cầu');
      expect(chatClient.sendMessage).toHaveBeenCalledTimes(1);
      expect(host.shadowRoot?.querySelector('#chat-composer-feedback')?.textContent).toBe('');
    } finally {
      vi.useRealTimers();
    }
  });

  it('clears an active cooldown when the verified session client changes', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    const container = document.createElement('div');
    const root = createRoot(container);
    const queryClient = createWidgetQueryClient();
    const limitedClient: ChatClient = {
      listMessages: vi.fn().mockResolvedValue([]),
      sendMessage: vi
        .fn()
        .mockRejectedValue(
          new HttpClientError({ kind: 'http', status: 429, retryAfterSeconds: 10 }),
        ),
    };
    const nextSessionClient: ChatClient = {
      listMessages: vi.fn().mockResolvedValue([]),
      sendMessage: vi.fn(),
    };

    try {
      await act(async () => {
        root.render(
          <QueryClientProvider client={queryClient}>
            <ChatPanel client={limitedClient} widgetId="demo-widget" />
          </QueryClientProvider>,
        );
      });
      await flushUi();

      const composer = container.querySelector<HTMLTextAreaElement>('#chat-message');
      await enterDraft(composer, 'Draft thuộc phiên mới');
      await act(async () => composer?.form?.requestSubmit());
      await flushUi();
      expect(composer?.form?.querySelector<HTMLButtonElement>('button')?.disabled).toBe(true);

      await act(async () => {
        root.render(
          <QueryClientProvider client={queryClient}>
            <ChatPanel client={nextSessionClient} widgetId="demo-widget" />
          </QueryClientProvider>,
        );
      });

      expect(composer?.form?.querySelector<HTMLButtonElement>('button')?.disabled).toBe(false);
      expect(container.querySelector('#chat-composer-feedback')?.textContent).toBe('');
    } finally {
      await act(async () => root.unmount());
      queryClient.clear();
      vi.useRealTimers();
    }
  });

  it('renders HTML and script-like message content as text only', async () => {
    const content = '<script>globalThis.compromised = true</script>';
    const chatClient: ChatClient = {
      listMessages: vi.fn().mockResolvedValue([{ ...operatorReply, content }]),
      sendMessage: vi.fn(),
    };
    let host!: HTMLElement;
    await act(async () => {
      host = mountChatWidget(
        { apiUrl: 'http://localhost:3000/api/v1', widgetId: 'demo-widget' },
        document,
        { chatClient, sessionClient },
      );
    });
    await flushUi();
    await act(async () =>
      host.shadowRoot
        ?.querySelector<HTMLButtonElement>('button[aria-label="Mở cửa sổ chat"]')
        ?.click(),
    );
    await flushUi();

    const bubble = host.shadowRoot?.querySelector('.message-bubble p');
    expect(bubble?.textContent).toBe(content);
    expect(host.shadowRoot?.querySelector('.message-bubble script')).toBeNull();
    expect(
      (globalThis as typeof globalThis & { compromised?: boolean }).compromised,
    ).toBeUndefined();
  });

  it('starts message queries only after session readiness and aborts them on unmount', async () => {
    let resolveSession!: (session: { token: string; expiresAt: string }) => void;
    let querySignal: AbortSignal | undefined;
    const pendingSessionClient: WidgetSessionClient = {
      createSession: vi.fn<WidgetSessionClient['createSession']>(
        () =>
          new Promise((resolve) => {
            resolveSession = resolve;
          }),
      ),
    };
    const chatClient: ChatClient = {
      listMessages: vi.fn((signal) => {
        querySignal = signal;
        return new Promise<ChatMessage[]>(() => undefined);
      }),
      sendMessage: vi.fn(),
    };
    let host!: HTMLElement;
    await act(async () => {
      host = mountChatWidget(
        { apiUrl: 'http://localhost:3000/api/v1', widgetId: 'demo-widget' },
        document,
        { chatClient, sessionClient: pendingSessionClient },
      );
    });
    await act(async () =>
      host.shadowRoot
        ?.querySelector<HTMLButtonElement>('button[aria-label="Mở cửa sổ chat"]')
        ?.click(),
    );

    expect(chatClient.listMessages).not.toHaveBeenCalled();

    await act(async () => {
      resolveSession({
        token: 'ready-token',
        expiresAt: '2026-11-18T10:15:00.000Z',
      });
      await Promise.resolve();
    });
    await flushUi();

    expect(chatClient.listMessages).toHaveBeenCalledTimes(1);
    expect(querySignal?.aborted).toBe(false);

    await act(async () => destroyChatWidget());
    expect(querySignal?.aborted).toBe(true);
  });

  it('polls for operator replies only while the ready chat panel is open', async () => {
    vi.useFakeTimers();
    try {
      const chatClient: ChatClient = {
        listMessages: vi
          .fn()
          .mockResolvedValueOnce([visitorMessage])
          .mockResolvedValue([visitorMessage, operatorReply]),
        sendMessage: vi.fn(),
      };
      let host!: HTMLElement;
      await act(async () => {
        host = mountChatWidget(
          { apiUrl: 'http://localhost:3000/api/v1', widgetId: 'demo-widget' },
          document,
          { chatClient, sessionClient },
        );
        await Promise.resolve();
      });
      await act(async () => {
        host.shadowRoot
          ?.querySelector<HTMLButtonElement>('button[aria-label="Mở cửa sổ chat"]')
          ?.click();
        await Promise.resolve();
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(chatClient.listMessages).toHaveBeenCalledTimes(1);
      expect(host.shadowRoot?.textContent).not.toContain('Mock reply: Xin chào');

      await act(async () => {
        await vi.advanceTimersByTimeAsync(2_000);
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(chatClient.listMessages).toHaveBeenCalledTimes(2);

      await act(async () =>
        host.shadowRoot
          ?.querySelector<HTMLButtonElement>('button[aria-label="Đóng cửa sổ chat"]')
          ?.click(),
      );
      const callsAfterClose = vi.mocked(chatClient.listMessages).mock.calls.length;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(4_000);
      });
      expect(chatClient.listMessages).toHaveBeenCalledTimes(callsAfterClose);
    } finally {
      vi.useRealTimers();
    }
  });
});
