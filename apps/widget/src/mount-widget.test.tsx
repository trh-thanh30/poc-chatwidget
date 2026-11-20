// @vitest-environment jsdom

import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { destroyChatWidget, mountChatWidget, WIDGET_HOST_ID } from './mount-widget';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

afterEach(() => {
  act(() => destroyChatWidget());
});

describe('mountChatWidget', () => {
  it('mounts once inside an isolated shadow root', async () => {
    let firstHost!: HTMLElement;
    await act(async () => {
      firstHost = mountChatWidget({
        apiUrl: 'http://localhost:3000/api/v1',
        widgetId: 'demo-widget',
      });
    });

    const secondHost = mountChatWidget({ widgetId: 'another-widget' });

    expect(firstHost).toBe(secondHost);
    expect(document.querySelectorAll(`#${WIDGET_HOST_ID}`)).toHaveLength(1);
    expect(firstHost.shadowRoot).not.toBeNull();
    expect(firstHost.shadowRoot?.querySelector('style')).not.toBeNull();
    expect(document.head.querySelector('style')).toBeNull();
    expect(firstHost.hasAttribute('aria-live')).toBe(false);
    expect(
      firstHost.shadowRoot?.querySelector('button[aria-label="Mở cửa sổ chat"]'),
    ).not.toBeNull();
  });

  it('opens and closes the accessible dialog', async () => {
    vi.useFakeTimers();
    let host!: HTMLElement;
    await act(async () => {
      host = mountChatWidget({ widgetId: 'demo-widget' });
    });

    const launcher = host.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[aria-label="Mở cửa sổ chat"]',
    );

    await act(async () => launcher?.click());

    expect(host.shadowRoot?.querySelector('[role="dialog"]')).not.toBeNull();
    expect(launcher?.getAttribute('aria-expanded')).toBe('true');
    expect(host.shadowRoot?.querySelector('[role="dialog"]')?.getAttribute('aria-hidden')).toBe(
      'false',
    );

    const closeButton = host.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[aria-label="Đóng cửa sổ chat"]',
    );
    expect(host.shadowRoot?.activeElement).toBe(closeButton);
    await act(async () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));

    expect(host.shadowRoot?.querySelector('[role="dialog"]')?.getAttribute('data-state')).toBe(
      'closing',
    );
    expect(host.shadowRoot?.querySelector('[role="dialog"]')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
    expect(host.shadowRoot?.querySelector('[role="dialog"]')?.hasAttribute('inert')).toBe(true);
    expect(host.shadowRoot?.activeElement).toBe(launcher);

    await act(async () => vi.advanceTimersByTime(180));
    expect(host.shadowRoot?.querySelector('[role="dialog"]')).toBeNull();
    vi.useRealTimers();
  });
});
