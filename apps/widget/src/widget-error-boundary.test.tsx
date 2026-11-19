// @vitest-environment jsdom

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { WidgetErrorBoundary } from './widget-error-boundary';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

function BrokenWidget(): never {
  throw new Error('sensitive runtime detail');
}

afterEach(() => vi.restoreAllMocks());

describe('WidgetErrorBoundary', () => {
  it('contains a Widget render failure and exposes a local retry action', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await act(async () => {
      root.render(
        <WidgetErrorBoundary>
          <BrokenWidget />
        </WidgetErrorBoundary>,
      );
    });

    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      'Chat tạm thời chưa khả dụng',
    );
    expect(container.textContent).not.toContain('sensitive runtime detail');
    expect(container.querySelector<HTMLButtonElement>('button')?.textContent).toContain(
      'Thử lại Widget',
    );

    await act(async () => root.unmount());
  });
});
