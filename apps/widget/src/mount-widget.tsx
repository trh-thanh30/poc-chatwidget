import { createRoot, type Root } from 'react-dom/client';

import type { ChatClient } from './features/chat/api/chat.api';
import type { WidgetSessionClient } from './features/session/api/widget-session.api';
import { ChatWidget, type ChatWidgetConfig } from './widget';
import { WidgetErrorBoundary } from './widget-error-boundary';
import widgetStyles from './styles.css?inline';

export const WIDGET_HOST_ID = 'poc-chatwidget-root';

const mountedRoots = new WeakMap<HTMLElement, Root>();

export type WidgetRuntimeDependencies = {
  chatClient?: ChatClient;
  sessionClient?: WidgetSessionClient;
};

export function mountChatWidget(
  config: ChatWidgetConfig,
  targetDocument: Document = document,
  dependencies: WidgetRuntimeDependencies = {},
): HTMLElement {
  const existingHost = targetDocument.getElementById(WIDGET_HOST_ID);
  if (existingHost) return existingHost;

  const host = targetDocument.createElement('div');
  host.id = WIDGET_HOST_ID;
  host.dataset.widgetId = config.widgetId ?? '';
  host.setAttribute('aria-live', 'polite');

  const shadowRoot = host.attachShadow({ mode: 'open' });
  const style = targetDocument.createElement('style');
  style.textContent = widgetStyles;

  const mountPoint = targetDocument.createElement('div');
  mountPoint.id = 'chat-widget-app';

  shadowRoot.append(style, mountPoint);
  targetDocument.body.append(host);

  const root = createRoot(mountPoint);
  mountedRoots.set(host, root);
  root.render(
    <WidgetErrorBoundary>
      <ChatWidget
        config={config}
        chatClient={dependencies.chatClient}
        sessionClient={dependencies.sessionClient}
      />
    </WidgetErrorBoundary>,
  );

  return host;
}

export function destroyChatWidget(targetDocument: Document = document): void {
  const host = targetDocument.getElementById(WIDGET_HOST_ID);
  if (!host) return;

  mountedRoots.get(host)?.unmount();
  mountedRoots.delete(host);
  host.remove();
}
