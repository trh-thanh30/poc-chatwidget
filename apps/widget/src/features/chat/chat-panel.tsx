import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';

import type { ChatClient } from './api/chat.api';
import { useChatMessages } from './hooks/use-chat-messages';
import { isRateLimitHttpClientError } from '../../lib/http-client.error';
import type { ChatMessage } from './types/chat.types';

const MESSAGE_MAX_LENGTH = 2_000;

function formatMessageTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function MessageItem({ message }: { message: ChatMessage }) {
  const time = formatMessageTime(message.createdAt);
  return (
    <li className="message-item" data-direction={message.direction}>
      <div className="message-bubble">
        <p>{message.content}</p>
        <time dateTime={message.createdAt}>
          {message.direction === 'visitor' ? `Đã gửi${time ? ` · ${time}` : ''}` : time}
        </time>
      </div>
    </li>
  );
}

export function ChatPanel({ client, widgetId }: { client: ChatClient; widgetId: string }) {
  const [draft, setDraft] = useState('');
  const [validationMessage, setValidationMessage] = useState<string>();
  const intent = useRef<{ content: string; idempotencyKey: string } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const { messages, rateLimit, send, sendMutation } = useChatMessages({ client, widgetId });
  const normalizedDraft = draft.trim();
  const draftLength = Array.from(normalizedDraft).length;
  const isRateLimitError = isRateLimitHttpClientError(sendMutation.error);
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
      <main className="conversation conversation--chat">
        <div
          ref={scrollAreaRef}
          className="message-scroll"
          onScroll={handleScroll}
          aria-label="Nội dung cuộc trò chuyện"
        >
          {messages.isPending ? (
            <div className="history-state" role="status" aria-live="polite">
              <span className="history-spinner" aria-hidden="true" />
              Đang tải cuộc trò chuyện…
            </div>
          ) : null}

          {messages.isError ? (
            <div className="history-state history-state--error" role="alert">
              <strong>Chưa tải được cuộc trò chuyện</strong>
              <span>Kiểm tra kết nối mạng rồi thử lại.</span>
              <button type="button" onClick={() => void messages.refetch()}>
                Tải lại
              </button>
            </div>
          ) : null}

          {!messages.isPending &&
          !messages.isError &&
          !sendMutation.isPending &&
          messages.data?.length === 0 ? (
            <div className="empty-conversation">
              <span aria-hidden="true">01</span>
              <strong>Bắt đầu cuộc trò chuyện</strong>
              <p>Gửi một lời nhắn, đội ngũ hỗ trợ sẽ phản hồi tại đây.</p>
            </div>
          ) : null}

          <ol className="message-list" aria-live="polite" aria-relevant="additions text">
            {messages.data?.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
            {sendMutation.isPending && sendMutation.variables ? (
              <li className="message-item" data-direction="visitor" data-status="sending">
                <div className="message-bubble">
                  <p>{sendMutation.variables.content}</p>
                  <span className="message-delivery" role="status">
                    Đang gửi…
                  </span>
                </div>
              </li>
            ) : null}
          </ol>
        </div>
      </main>

      <form className="composer" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <label htmlFor="chat-message">Tin nhắn</label>
        <div className="composer-row">
          <textarea
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
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m5 12 14-7-4 14-3.2-5.8L5 12Z" />
            </svg>
          </button>
        </div>
        <div id="chat-composer-feedback" className="composer-feedback">
          {validationMessage ? <span role="alert">{validationMessage}</span> : null}
          {rateLimit.isActive ? (
            <span className="rate-limit-feedback">
              <span role="status">Bạn đang gửi quá nhanh. Nội dung vẫn được giữ lại.</span>
              <span className="rate-limit-countdown" aria-hidden="true">
                Thử lại sau {rateLimit.remainingSeconds} giây.
              </span>
            </span>
          ) : null}
          {hasGenericSendError ? (
            <span role="alert">
              Tin nhắn chưa được gửi. Nội dung vẫn được giữ lại để bạn thử lại.
            </span>
          ) : null}
        </div>
        <p id="chat-composer-note" className="composer-note">
          Enter để gửi · Shift + Enter để xuống dòng
        </p>
      </form>
    </>
  );
}
