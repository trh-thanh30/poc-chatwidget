import { useEffect, useId, useMemo, useRef, useState, type SVGProps } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { createChatClient, type ChatClient } from './features/chat/api/chat.api';
import { ChatPanel } from './features/chat/chat-panel';
import type { WidgetSessionClient } from './features/session/api/widget-session.api';
import { SessionState } from './features/session/components/session-state';
import { useWidgetSession } from './features/session/hooks/use-widget-session';
import { createWidgetQueryClient } from './lib/query-client';

export type ChatWidgetConfig = {
  apiUrl?: string;
  widgetId?: string;
};

type IconProps = SVGProps<SVGSVGElement>;

function ChatIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M7.5 18.25 3.8 20l1.05-3.52A8.15 8.15 0 0 1 3 11.3C3 6.72 7.03 3 12 3s9 3.72 9 8.3-4.03 8.3-9 8.3a9.54 9.54 0 0 1-4.5-1.35Z" />
      <path d="M8 10.7h.01M12 10.7h.01M16 10.7h.01" />
    </svg>
  );
}

function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="m6.5 6.5 11 11m0-11-11 11" />
    </svg>
  );
}

function ArrowIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="m5 12 14-7-4 14-3.2-5.8L5 12Z" />
    </svg>
  );
}

export function ChatWidget({
  chatClient: chatClientOverride,
  config,
  sessionClient,
}: {
  chatClient?: ChatClient;
  config: ChatWidgetConfig;
  sessionClient?: WidgetSessionClient;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [queryClient] = useState(createWidgetQueryClient);
  const panelId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const widgetId = config.widgetId?.trim();
  const apiUrl = config.apiUrl?.trim();
  const { state: sessionState, retry } = useWidgetSession({
    apiUrl,
    widgetId,
    client: sessionClient,
  });
  const configurationIssue = !widgetId
    ? 'widget-id'
    : !apiUrl && !sessionClient
      ? 'api-url'
      : undefined;
  const visibleStatus = configurationIssue ? 'unavailable' : sessionState.status;
  const sessionToken = sessionState.status === 'ready' ? sessionState.session.token : undefined;
  const chatClient = useMemo(
    () =>
      chatClientOverride ??
      (apiUrl && sessionToken ? createChatClient(apiUrl, () => sessionToken) : undefined),
    [apiUrl, chatClientOverride, sessionToken],
  );
  const availability = {
    initializing: 'Đang kết nối an toàn…',
    ready: 'Đã kết nối · Sẵn sàng',
    denied: 'Website chưa được cấp quyền',
    'not-found': 'Không tìm thấy Widget',
    unavailable: 'Chưa thể kết nối',
  }[visibleStatus];

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  useEffect(() => () => queryClient.clear(), [queryClient]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape' || !isOpen) return;
      setIsOpen(false);
      launcherRef.current?.focus();
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className="widget-shell"
        data-open={isOpen ? 'true' : 'false'}
        data-session-status={visibleStatus}
      >
        {isOpen ? (
          <section className="chat-panel" id={panelId} role="dialog" aria-label="Hỗ trợ trực tuyến">
            <header className="chat-header">
              <div className="brand-mark" aria-hidden="true">
                <ChatIcon />
              </div>
              <div className="header-copy">
                <p className="eyebrow">Kênh hỗ trợ</p>
                <h2>Xin chào, mình có thể giúp gì?</h2>
                <span className="availability" aria-live="polite">
                  <i aria-hidden="true" /> {availability}
                </span>
              </div>
              <button
                ref={closeButtonRef}
                className="icon-button"
                type="button"
                aria-label="Đóng cửa sổ chat"
                onClick={() => setIsOpen(false)}
              >
                <CloseIcon />
              </button>
            </header>

            {sessionState.status === 'ready' && chatClient && widgetId ? (
              <ChatPanel client={chatClient} widgetId={widgetId} />
            ) : (
              <>
                <main className="conversation">
                  <SessionState
                    state={sessionState}
                    configurationIssue={configurationIssue}
                    onRetry={retry}
                  />
                </main>
                <form
                  className="composer composer--disabled"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <label htmlFor={`${panelId}-message`}>Tin nhắn</label>
                  <div className="composer-row">
                    <textarea
                      id={`${panelId}-message`}
                      rows={1}
                      disabled
                      placeholder="Nhập tin nhắn…"
                    />
                    <button type="submit" disabled aria-label="Gửi tin nhắn">
                      <ArrowIcon />
                    </button>
                  </div>
                  <p className="composer-note">Kết nối an toàn để bắt đầu trò chuyện</p>
                </form>
              </>
            )}
          </section>
        ) : null}

        <button
          ref={launcherRef}
          className="launcher"
          type="button"
          aria-label={isOpen ? 'Đóng cửa sổ chat' : 'Mở cửa sổ chat'}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="launcher-ring" aria-hidden="true" />
          {isOpen ? <CloseIcon /> : <ChatIcon />}
          <span className="launcher-label">Hỗ trợ</span>
        </button>
      </div>
    </QueryClientProvider>
  );
}
