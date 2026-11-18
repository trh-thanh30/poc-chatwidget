import { useEffect, useId, useRef, useState, type FormEvent, type SVGProps } from 'react';

import type { WidgetSessionClient } from './features/session/api/widget-session.api';
import { SessionState } from './features/session/components/session-state';
import { useWidgetSession } from './features/session/hooks/use-widget-session';

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
  config,
  sessionClient,
}: {
  config: ChatWidgetConfig;
  sessionClient?: WidgetSessionClient;
}) {
  const [isOpen, setIsOpen] = useState(false);
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

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape' || !isOpen) return;
      setIsOpen(false);
      launcherRef.current?.focus();
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
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

          <main className="conversation">
            <SessionState
              state={sessionState}
              configurationIssue={configurationIssue}
              onRetry={retry}
            />
          </main>

          <form className="composer" onSubmit={handleSubmit}>
            <label htmlFor={`${panelId}-message`}>Tin nhắn</label>
            <div className="composer-row">
              <textarea
                id={`${panelId}-message`}
                rows={1}
                disabled
                placeholder="Nhập tin nhắn..."
                aria-describedby={`${panelId}-notice`}
              />
              <button type="submit" disabled aria-label="Gửi tin nhắn">
                <ArrowIcon />
              </button>
            </div>
            <p id={`${panelId}-notice`} className="preview-note">
              Bản xem trước · {widgetId || 'chưa cấu hình'}
            </p>
          </form>
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
  );
}
