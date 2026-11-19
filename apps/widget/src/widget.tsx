import { QueryClientProvider } from '@tanstack/react-query';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type SVGProps } from 'react';

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

const PANEL_EXIT_DURATION_MS = 180;

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
  const [isPanelMounted, setIsPanelMounted] = useState(false);
  const [queryClient] = useState(createWidgetQueryClient);
  const panelId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelExitTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
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
      (apiUrl && sessionToken ? createChatClient(apiUrl, () => sessionToken, retry) : undefined),
    [apiUrl, chatClientOverride, retry, sessionToken],
  );
  const availability = {
    initializing: 'Đang kết nối an toàn…',
    ready: 'Đã kết nối · Sẵn sàng',
    denied: 'Website chưa được cấp quyền',
    'not-found': 'Không tìm thấy Widget',
    unavailable: 'Chưa thể kết nối',
  }[visibleStatus];

  const openPanel = useCallback(() => {
    if (panelExitTimerRef.current) clearTimeout(panelExitTimerRef.current);
    setIsPanelMounted(true);
    setIsOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
    launcherRef.current?.focus();
    if (panelExitTimerRef.current) clearTimeout(panelExitTimerRef.current);
    panelExitTimerRef.current = setTimeout(() => {
      setIsPanelMounted(false);
      panelExitTimerRef.current = undefined;
    }, PANEL_EXIT_DURATION_MS);
  }, []);

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  useEffect(
    () => () => {
      if (panelExitTimerRef.current) clearTimeout(panelExitTimerRef.current);
      queryClient.clear();
    },
    [queryClient],
  );

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape' || !isOpen) return;
      closePanel();
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [closePanel, isOpen]);

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className="fixed right-5 bottom-5 z-[2147483000] font-sans text-base leading-6 text-[#1f2937] antialiased max-[520px]:right-3 max-[520px]:bottom-3"
        data-open={isOpen ? 'true' : 'false'}
        data-session-status={visibleStatus}
      >
        {isPanelMounted ? (
          <section
            className={`absolute right-0 bottom-[72px] grid h-[min(610px,calc(100dvh-112px))] min-h-[480px] w-[min(420px,calc(100vw-24px))] origin-bottom-right grid-rows-[auto_minmax(250px,1fr)_auto] overflow-hidden rounded-[22px_22px_6px_22px] border border-black/10 bg-white shadow-[0_28px_70px_rgb(70_16_13_/_22%),0_8px_24px_rgb(70_16_13_/_12%)] transition-[opacity,transform] duration-200 motion-reduce:transition-none max-[520px]:bottom-[66px] max-[520px]:h-[min(620px,calc(100dvh-92px))] max-[520px]:min-h-[min(470px,calc(100dvh-92px))] ${
              isOpen
                ? 'translate-y-0 scale-100 opacity-100 starting:translate-y-3 starting:scale-[0.97] starting:opacity-0'
                : 'pointer-events-none translate-y-2.5 scale-[0.97] opacity-0'
            }`}
            id={panelId}
            role="dialog"
            aria-label="Hỗ trợ trực tuyến"
            aria-hidden={!isOpen}
            data-state={isOpen ? 'open' : 'closing'}
            inert={!isOpen ? true : undefined}
          >
            <header className="grid grid-cols-[44px_minmax(0,1fr)_40px] items-center gap-2.5 bg-[#e21b14] px-4 py-4 text-white">
              <div
                className="grid size-11 place-items-center rounded-xl bg-white/18 text-white ring-1 ring-white/20"
                aria-hidden="true"
              >
                <ChatIcon className="size-6 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]" />
              </div>
              <div className="min-w-0">
                <p className="m-0 mb-0.5 text-[10px] font-extrabold tracking-[0.14em] text-white/80 uppercase">
                  Kênh hỗ trợ
                </p>
                <h2 className="m-0 truncate text-base leading-5 font-bold tracking-[-0.015em] text-white">
                  Xin chào! Bạn cần hỗ trợ?
                </h2>
                <span
                  className="mt-1.5 flex items-center gap-1.5 text-[11px] text-white font-medium"
                  aria-live="polite"
                >
                  <i
                    className={`size-1.5 rounded-full ring-[3px] ${
                      visibleStatus === 'ready'
                        ? 'bg-[#86efac] ring-white/15'
                        : visibleStatus === 'initializing'
                          ? 'bg-white/70 ring-white/10'
                          : 'bg-[#fecaca] ring-white/15'
                    }`}
                    aria-hidden="true"
                  />{' '}
                  {availability}
                </span>
              </div>
              <button
                ref={closeButtonRef}
                className="grid size-10 cursor-pointer place-items-center rounded-xl border border-white/20 bg-white/10 p-0 text-white/85 transition-colors duration-200 hover:bg-white/20 hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                type="button"
                aria-label="Đóng cửa sổ chat"
                onClick={closePanel}
              >
                <CloseIcon className="size-5 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]" />
              </button>
            </header>

            {sessionState.status === 'ready' && chatClient && widgetId ? (
              <ChatPanel client={chatClient} isActive={isOpen} widgetId={widgetId} />
            ) : (
              <>
                <main className="grid min-h-0 place-items-center overflow-y-auto bg-[#fafafa] px-6 py-7">
                  <SessionState
                    state={sessionState}
                    configurationIssue={configurationIssue}
                    onRetry={retry}
                  />
                </main>
                <form
                  className="border-t border-[#e5e7eb] bg-white px-[15px] pt-3.5 pb-3"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <label className="sr-only" htmlFor={`${panelId}-message`}>
                    Tin nhắn
                  </label>
                  <div className="grid grid-cols-[1fr_44px] items-end gap-2">
                    <textarea
                      className="min-h-11 w-full resize-none rounded-xl border border-[#d9dde3] bg-[#f5f6f7] px-3 py-2.5 text-base text-[#111827] opacity-80 outline-none placeholder:text-[#9ca3af] disabled:cursor-not-allowed"
                      id={`${panelId}-message`}
                      rows={1}
                      disabled
                      placeholder="Nhập tin nhắn…"
                    />
                    <button
                      className="grid size-11 place-items-center rounded-xl border-0 bg-[#f0f1f3] p-0 text-[#9ca3af] opacity-80 disabled:cursor-not-allowed"
                      type="submit"
                      disabled
                      aria-label="Gửi tin nhắn"
                    >
                      <ArrowIcon className="size-5 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]" />
                    </button>
                  </div>
                  <p className="mt-1.5 mb-0 text-center text-[10px] text-[#9ca3af]">
                    Kết nối an toàn để bắt đầu trò chuyện
                  </p>
                </form>
              </>
            )}
          </section>
        ) : null}

        <button
          ref={launcherRef}
          className={`group flex h-14 cursor-pointer items-center justify-end gap-2.5 overflow-hidden rounded-full border border-white/70 bg-[#e21b14] px-3.5 text-white shadow-[0_12px_30px_rgb(130_20_15_/_28%),0_3px_8px_rgb(70_10_8_/_16%)] transition-[width,transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#c91711] hover:shadow-[0_16px_34px_rgb(130_20_15_/_32%),0_4px_10px_rgb(70_10_8_/_18%)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#e21b14]/35 motion-reduce:transition-none ${
            isOpen
              ? 'w-14'
              : 'w-14 hover:w-[196px] focus-visible:w-[196px] max-[520px]:hover:w-14 max-[520px]:focus-visible:w-14'
          }`}
          type="button"
          aria-label={isOpen ? 'Đóng cửa sổ chat' : 'Mở cửa sổ chat'}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={isOpen ? closePanel : openPanel}
        >
          <span
            className={`overflow-hidden text-[13px] leading-none font-bold tracking-[0.01em] whitespace-nowrap uppercase transition-[max-width,opacity] duration-200 ease-out motion-reduce:transition-none ${
              isOpen
                ? 'max-w-0 opacity-0'
                : 'max-w-0 opacity-0 group-hover:max-w-[148px] group-hover:opacity-100 group-focus-visible:max-w-[148px] group-focus-visible:opacity-100 max-[520px]:group-hover:max-w-0 max-[520px]:group-hover:opacity-0 max-[520px]:group-focus-visible:max-w-0 max-[520px]:group-focus-visible:opacity-0'
            }`}
          >
            Bạn cần hỗ trợ?
          </span>
          {isOpen ? (
            <CloseIcon className="size-7 shrink-0 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]" />
          ) : (
            <ChatIcon className="size-7 shrink-0 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]" />
          )}
        </button>
      </div>
    </QueryClientProvider>
  );
}
