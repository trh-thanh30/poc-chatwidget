import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';

import {
  isChannelUnavailableHttpClientError,
  isRateLimitHttpClientError,
} from '../../lib/http-client.error';
import type { ChatClient } from './api/chat.api';
import { useChatMessages } from './hooks/use-chat-messages';
import type { ChatMessage } from './types/chat.types';

const MESSAGE_MAX_LENGTH = 2_000;

function formatMessageTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function MessageItem({ message }: { message: ChatMessage }) {
  const time = formatMessageTime(message.createdAt);
  const isVisitor = message.direction === 'visitor';
  return (
    <li
      className={`flex w-full ${isVisitor ? 'justify-end' : 'justify-start'}`}
      data-direction={message.direction}
    >
      <div
        className={`max-w-[min(82%,285px)] border px-3 pt-2.5 pb-2 shadow-[0_4px_14px_rgb(31_41_55_/_6%)] ${
          isVisitor
            ? 'rounded-[16px_16px_5px_16px] border-[#e21b14] bg-[#e21b14] text-white'
            : 'rounded-[6px_16px_16px_16px] border-[#e5e7eb] bg-white text-[#1f2937]'
        }`}
      >
        <p className="m-0 text-sm leading-5 whitespace-pre-wrap [overflow-wrap:anywhere]">
          {message.content}
        </p>
        <time
          className={`mt-1 block text-right text-[9px] font-bold tracking-[0.03em] uppercase ${isVisitor ? 'text-white/75' : 'text-[#6b7280]'}`}
          dateTime={message.createdAt}
        >
          {message.direction === 'visitor' ? `Đã gửi${time ? ` · ${time}` : ''}` : time}
        </time>
      </div>
    </li>
  );
}

export function ChatPanel({
  client,
  isActive = true,
  widgetId,
}: {
  client: ChatClient;
  isActive?: boolean;
  widgetId: string;
}) {
  const [draft, setDraft] = useState('');
  const [validationMessage, setValidationMessage] = useState<string>();
  const intent = useRef<{ content: string; idempotencyKey: string } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const { messages, rateLimit, send, sendMutation } = useChatMessages({
    client,
    enabled: isActive,
    widgetId,
  });
  const normalizedDraft = draft.trim();
  const draftLength = Array.from(normalizedDraft).length;
  const isRateLimitError = isRateLimitHttpClientError(sendMutation.error);
  const isChannelUnavailableError = isChannelUnavailableHttpClientError(sendMutation.error);
  const hasGenericSendError = sendMutation.isError && !isRateLimitError;
  const canSend =
    !!normalizedDraft &&
    draftLength <= MESSAGE_MAX_LENGTH &&
    !sendMutation.isPending &&
    !rateLimit.isActive;

  useEffect(() => {
    if (!stickToBottom.current || !scrollAreaRef.current) return;
    scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
  }, [messages.data?.length, sendMutation.isPending]);

  function handleScroll() {
    const element = scrollAreaRef.current;
    if (!element) return;
    stickToBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 48;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sendMutation.isPending || rateLimit.isActive) return;
    if (!normalizedDraft) {
      setValidationMessage('Hãy nhập nội dung trước khi gửi.');
      return;
    }
    if (draftLength > MESSAGE_MAX_LENGTH) {
      setValidationMessage(`Tin nhắn tối đa ${MESSAGE_MAX_LENGTH.toLocaleString('vi-VN')} ký tự.`);
      return;
    }

    setValidationMessage(undefined);
    const currentIntent =
      intent.current?.content === normalizedDraft
        ? intent.current
        : { content: normalizedDraft, idempotencyKey: crypto.randomUUID() };
    intent.current = currentIntent;
    stickToBottom.current = true;

    if (await send(currentIntent)) {
      intent.current = null;
      setDraft('');
    }
  }

  function handleDraftChange(value: string) {
    setDraft(value);
    setValidationMessage(undefined);
    if (intent.current?.content !== value.trim()) intent.current = null;
    if (sendMutation.isError) sendMutation.reset();
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <>
      <main className="min-h-0 bg-[#fafafa]">
        <div
          ref={scrollAreaRef}
          className="h-full min-h-0 overflow-y-auto px-4 pt-5 pb-[18px] overscroll-contain [scrollbar-color:rgb(156_163_175_/_45%)_transparent] [scrollbar-width:thin] max-[520px]:px-[13px]"
          onScroll={handleScroll}
          aria-label="Nội dung cuộc trò chuyện"
        >
          {messages.isPending ? (
            <div
              className="grid min-h-full content-center justify-items-center gap-2 px-5 py-7 text-center text-[13px] text-[#6b7280]"
              role="status"
              aria-live="polite"
            >
              <span
                className="mb-1 size-7 animate-spin rounded-full border-[3px] border-[#e5e7eb] border-t-[#e21b14] motion-reduce:animate-none"
                aria-hidden="true"
              />
              Đang tải cuộc trò chuyện…
            </div>
          ) : null}

          {messages.isError ? (
            <div
              className="grid min-h-full content-center justify-items-center gap-2 px-5 py-7 text-center text-[13px] text-[#991b1b]"
              role="alert"
            >
              <strong className="text-base text-[#7f1d1d]">Chưa tải được cuộc trò chuyện</strong>
              <span>Kiểm tra kết nối mạng rồi thử lại.</span>
              <button
                className="mt-2 min-h-11 cursor-pointer rounded-xl border-0 bg-[#e21b14] px-[18px] font-bold text-white transition-colors duration-200 hover:bg-[#c91711] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#e21b14]/35"
                type="button"
                onClick={() => void messages.refetch()}
              >
                Tải lại
              </button>
            </div>
          ) : null}

          {!messages.isPending &&
          !messages.isError &&
          !sendMutation.isPending &&
          messages.data?.length === 0 ? (
            <div className="grid min-h-full content-center justify-items-center px-5 py-7 text-center text-[#6b7280]">
              <span
                className="mb-3 grid size-12 place-items-center rounded-xl bg-[#fee2e2] text-[11px] font-black tracking-[0.12em] text-[#e21b14]"
                aria-hidden="true"
              >
                01
              </span>
              <strong className="text-base text-[#1f2937]">Bắt đầu cuộc trò chuyện</strong>
              <p className="mt-1.5 mb-0 max-w-[250px] text-xs leading-[1.55]">
                Gửi một lời nhắn, đội ngũ hỗ trợ sẽ phản hồi tại đây.
              </p>
            </div>
          ) : null}

          <ol
            className="m-0 flex list-none flex-col gap-3 p-0 empty:hidden"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {messages.data?.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
            {sendMutation.isPending && sendMutation.variables ? (
              <li
                className="flex w-full justify-end"
                data-direction="visitor"
                data-status="sending"
              >
                <div className="max-w-[min(82%,285px)] rounded-[16px_16px_5px_16px] border border-[#e21b14] bg-[#e21b14] px-3 pt-2.5 pb-2 text-white opacity-70 shadow-[0_4px_14px_rgb(31_41_55_/_6%)]">
                  <p className="m-0 text-sm leading-5 whitespace-pre-wrap [overflow-wrap:anywhere]">
                    {sendMutation.variables.content}
                  </p>
                  <span
                    className="mt-1 block text-right text-[9px] font-bold tracking-[0.03em] text-white/75 uppercase"
                    role="status"
                  >
                    Đang gửi…
                  </span>
                </div>
              </li>
            ) : null}
          </ol>
        </div>
      </main>

      <form
        className="border-t border-[#e5e7eb] bg-white px-[15px] pt-3.5 pb-3"
        onSubmit={(event) => void handleSubmit(event)}
        noValidate
      >
        <label className="sr-only" htmlFor="chat-message">
          Tin nhắn
        </label>
        <div className="grid grid-cols-[1fr_44px] items-end gap-2">
          <textarea
            className="min-h-11 max-h-[100px] w-full resize-none rounded-xl border border-[#d9dde3] bg-[#f5f6f7] px-3 py-2.5 text-base text-[#1f2937] caret-[#e21b14] outline-none transition-[background-color,border-color,box-shadow] duration-150 placeholder:text-[#8b95a5] focus:border-[#e21b14] focus:bg-[#fff7f7] focus:shadow-[0_0_0_3px_rgb(226_27_20_/_16%)] focus-visible:outline-none aria-invalid:border-[#dc2626] aria-invalid:bg-[#f5f6f7]"
            id="chat-message"
            rows={1}
            value={draft}
            placeholder="Nhập tin nhắn…"
            aria-invalid={!!validationMessage || hasGenericSendError}
            aria-describedby="chat-composer-feedback chat-composer-note"
            onChange={(event) => handleDraftChange(event.target.value)}
            onKeyDown={handleComposerKeyDown}
          />
          <button
            className="grid size-11 cursor-pointer place-items-center rounded-xl border-0 bg-[#fee2e2] p-0 text-[#e21b14] shadow-[0_5px_14px_rgb(226_27_20_/_16%)] transition-[color,background-color,box-shadow] duration-150 hover:bg-[#e21b14] hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#e21b14]/35 disabled:cursor-not-allowed disabled:bg-[#f0f1f3] disabled:text-[#9ca3af] disabled:shadow-none disabled:opacity-80"
            type="submit"
            disabled={!canSend}
            aria-label={
              rateLimit.isActive
                ? 'Tạm dừng gửi tin nhắn'
                : hasGenericSendError
                  ? 'Thử gửi lại tin nhắn'
                  : 'Gửi tin nhắn'
            }
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
              aria-hidden="true"
            >
              <path d="m5 12 14-7-4 14-3.2-5.8L5 12Z" />
            </svg>
          </button>
        </div>
        <div
          id="chat-composer-feedback"
          className="not-empty:mt-1.5 not-empty:px-0.5 text-[11px] leading-[1.4] font-bold text-[#b42318]"
        >
          {validationMessage ? (
            <span className="block" role="alert">
              {validationMessage}
            </span>
          ) : null}
          {rateLimit.isActive ? (
            <span className="block">
              <span className="block" role="status">
                Bạn đang gửi quá nhanh. Nội dung vẫn được giữ lại.
              </span>
              <span className="mt-0.5 block text-[#7f1d1d]" aria-hidden="true">
                Thử lại sau {rateLimit.remainingSeconds} giây.
              </span>
            </span>
          ) : null}
          {hasGenericSendError ? (
            <span className="block" role="alert">
              {isChannelUnavailableError
                ? 'Kênh hỗ trợ đang tạm gián đoạn. Nội dung vẫn được giữ lại để bạn thử lại.'
                : 'Tin nhắn chưa được gửi. Nội dung vẫn được giữ lại để bạn thử lại.'}
            </span>
          ) : null}
        </div>
        <p id="chat-composer-note" className="mt-1.5 mb-0 text-center text-[10px] text-[#9ca3af]">
          Enter để gửi · Shift + Enter để xuống dòng
        </p>
      </form>
    </>
  );
}
