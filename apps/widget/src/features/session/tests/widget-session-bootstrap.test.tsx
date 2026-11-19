// @vitest-environment jsdom

import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ChatClient } from '../../chat/api/chat.api';
import { destroyChatWidget, mountChatWidget } from '../../../mount-widget';
import { WidgetSessionApiError, type WidgetSessionClient } from '../api/widget-session.api';
import type { WidgetSession } from '../types/widget-session.types';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const chatClient: ChatClient = {
  listMessages: vi.fn().mockResolvedValue([]),
  sendMessage: vi.fn(),
};

afterEach(() => {
  act(() => destroyChatWidget());
});

describe('Widget session bootstrap', () => {
  it('moves an allowed host from initializing to ready without rendering the JWT', async () => {
    let resolveSession!: (value: { token: string; expiresAt: string }) => void;
    const client: WidgetSessionClient = {
      createSession: vi.fn<WidgetSessionClient['createSession']>(
        () =>
          new Promise<WidgetSession>((resolve) => {
            resolveSession = resolve;
          }),
      ),
    };

    let host!: HTMLElement;
    await act(async () => {
      host = mountChatWidget(
        { apiUrl: 'http://localhost:3000/api/v1', widgetId: 'demo-widget' },
        document,
        { chatClient, sessionClient: client },
      );
    });

    const launcher = host.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[aria-label="Mở cửa sổ chat"]',
    );
    await act(async () => launcher?.click());

    expect(host.shadowRoot?.querySelector('[role="status"]')?.textContent).toContain(
      'Đang xác thực website',
    );

    await act(async () => {
      resolveSession({ token: 'memory-only-secret-token', expiresAt: '2026-11-18T10:00:00.000Z' });
      await Promise.resolve();
    });

    expect(host.shadowRoot?.textContent).toContain('Đã kết nối · Sẵn sàng');
    expect(host.shadowRoot?.textContent).not.toContain('memory-only-secret-token');
    expect(window.location.href).not.toContain('memory-only-secret-token');
    expect(window.localStorage.getItem('widget-session')).toBeNull();
    expect(window.sessionStorage.getItem('widget-session')).toBeNull();
    expect(client.createSession).toHaveBeenCalledWith('demo-widget', expect.any(AbortSignal));
  });

  it.each([
    ['denied', 'Website chưa được cấp quyền'],
    ['not-found', 'Không tìm thấy Widget'],
  ] as const)('shows a distinct %s state without reporting ready', async (kind, message) => {
    const client: WidgetSessionClient = {
      createSession: vi.fn().mockRejectedValue(new WidgetSessionApiError(kind)),
    };
    let host!: HTMLElement;

    await act(async () => {
      host = mountChatWidget(
        { apiUrl: 'http://localhost:3000/api/v1', widgetId: 'demo-widget' },
        document,
        { chatClient, sessionClient: client },
      );
      await Promise.resolve();
    });
    const launcher = host.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[aria-label="Mở cửa sổ chat"]',
    );
    await act(async () => launcher?.click());

    expect(host.shadowRoot?.querySelector('[role="alert"]')?.textContent).toContain(message);
    expect(host.shadowRoot?.textContent).not.toContain('Đã kết nối · Sẵn sàng');
  });

  it('recovers from an unavailable API when the visitor retries', async () => {
    const client: WidgetSessionClient = {
      createSession: vi
        .fn()
        .mockRejectedValueOnce(new WidgetSessionApiError('unavailable'))
        .mockResolvedValueOnce({ token: 'retry-token', expiresAt: '2026-11-18T10:00:00.000Z' }),
    };
    let host!: HTMLElement;

    await act(async () => {
      host = mountChatWidget(
        { apiUrl: 'http://localhost:3000/api/v1', widgetId: 'demo-widget' },
        document,
        { chatClient, sessionClient: client },
      );
      await Promise.resolve();
    });
    const launcher = host.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[aria-label="Mở cửa sổ chat"]',
    );
    await act(async () => launcher?.click());
    const retry = Array.from(
      host.shadowRoot?.querySelectorAll<HTMLButtonElement>('button[type="button"]') ?? [],
    ).find((button) => button.textContent?.trim() === 'Thử lại');

    expect(retry?.textContent).toContain('Thử lại');
    await act(async () => {
      retry?.click();
      await Promise.resolve();
    });

    expect(host.shadowRoot?.textContent).toContain('Đã kết nối · Sẵn sàng');
    expect(client.createSession).toHaveBeenCalledTimes(2);
  });

  it('aborts bootstrap on unmount and ignores a late response', async () => {
    let requestSignal: AbortSignal | undefined;
    let resolveSession!: (value: { token: string; expiresAt: string }) => void;
    const client: WidgetSessionClient = {
      createSession: vi.fn<WidgetSessionClient['createSession']>((_widgetId, signal) => {
        requestSignal = signal;
        return new Promise<WidgetSession>((resolve) => {
          resolveSession = resolve;
        });
      }),
    };

    await act(async () => {
      mountChatWidget(
        { apiUrl: 'http://localhost:3000/api/v1', widgetId: 'demo-widget' },
        document,
        { sessionClient: client },
      );
    });
    await act(async () => destroyChatWidget());

    expect(requestSignal?.aborted).toBe(true);
    await act(async () => {
      resolveSession({ token: 'late-token', expiresAt: '2026-11-18T10:00:00.000Z' });
      await Promise.resolve();
    });
    expect(document.querySelector('#poc-chatwidget-root')).toBeNull();
  });

  it('bootstraps only once when the embed script mounts twice', async () => {
    const client: WidgetSessionClient = {
      createSession: vi.fn().mockResolvedValue({
        token: 'singleton-token',
        expiresAt: '2026-11-18T10:00:00.000Z',
      }),
    };

    await act(async () => {
      mountChatWidget(
        { apiUrl: 'http://localhost:3000/api/v1', widgetId: 'demo-widget' },
        document,
        { sessionClient: client },
      );
      mountChatWidget(
        { apiUrl: 'http://localhost:3000/api/v1', widgetId: 'another-widget' },
        document,
        { sessionClient: client },
      );
      await Promise.resolve();
    });

    expect(client.createSession).toHaveBeenCalledTimes(1);
    expect(client.createSession).toHaveBeenCalledWith('demo-widget', expect.any(AbortSignal));
  });
});
