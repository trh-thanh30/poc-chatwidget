import type { WidgetSessionState } from '../types/widget-session.types';

type SessionStateProps = {
  state: WidgetSessionState;
  configurationIssue?: 'api-url' | 'widget-id';
  onRetry(): void;
};

const stateSurface =
  'grid max-w-[280px] justify-items-center gap-[7px] rounded-[18px_18px_6px_18px] border p-5 text-center';
const title = 'm-0 text-[17px] font-bold tracking-[-0.015em] text-[var(--cw-ink)]';
const description = 'm-0 text-[13px] leading-[1.55] text-[var(--cw-muted)]';

function StatusMark({ kind }: { kind: 'error' | 'loading' | 'ready' }) {
  const color =
    kind === 'error' ? 'bg-[#fbe2d2] text-[#8d4e2d]' : 'bg-[#e3f4ee] text-[var(--cw-navy)]';

  return (
    <span
      className={`mb-[5px] grid size-[52px] place-items-center rounded-[17px_17px_5px_17px] ${color}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className={`size-[25px] fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round] ${kind === 'loading' ? 'animate-spin motion-reduce:animate-none' : ''}`}
      >
        {kind === 'ready' ? <path d="m7 12.5 3.2 3.2L17.5 8.5" /> : null}
        {kind === 'error' ? <path d="M12 7.5v5m0 4h.01" /> : null}
        {kind === 'loading' ? <circle cx="12" cy="12" r="7.5" /> : null}
      </svg>
    </span>
  );
}

export function SessionState({ state, configurationIssue, onRetry }: SessionStateProps) {
  if (configurationIssue === 'widget-id') {
    return (
      <div className={`${stateSurface} border-[#f1d2bc] bg-[#fff3e8]`} role="alert">
        <StatusMark kind="error" />
        <strong className={`${title} !text-[#713e27]`}>Thiếu Widget ID</strong>
        <span className={`${description} !text-[#85583f]`}>
          Hãy thêm thuộc tính data-widget-id vào script nhúng.
        </span>
      </div>
    );
  }

  if (configurationIssue === 'api-url') {
    return (
      <div className={`${stateSurface} border-[#f1d2bc] bg-[#fff3e8]`} role="alert">
        <StatusMark kind="error" />
        <strong className={`${title} !text-[#713e27]`}>Thiếu địa chỉ Chat API</strong>
        <span className={`${description} !text-[#85583f]`}>
          Hãy kiểm tra thuộc tính data-api-url trong script nhúng.
        </span>
      </div>
    );
  }

  if (state.status === 'initializing') {
    return (
      <div
        className={`${stateSurface} border-[#dae5e7] bg-[#f2f6f7]`}
        role="status"
        aria-live="polite"
      >
        <StatusMark kind="loading" />
        <strong className={title}>Đang xác thực website</strong>
        <span className={description}>Việc này thường chỉ mất vài giây.</span>
      </div>
    );
  }

  if (state.status === 'ready') {
    return (
      <div className={`${stateSurface} border-[#d3ebe3] bg-[#f2faf7]`}>
        <StatusMark kind="ready" />
        <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[var(--cw-mint-dark)]">
          Widget đã sẵn sàng
        </p>
        <strong className={title}>Bắt đầu một cuộc trò chuyện</strong>
        <span className={description}>
          Luồng gửi và nhận tin nhắn sẽ được kết nối ở task tiếp theo.
        </span>
      </div>
    );
  }

  if (state.status === 'denied') {
    return (
      <div className={`${stateSurface} border-[#f1d2bc] bg-[#fff3e8]`} role="alert">
        <StatusMark kind="error" />
        <strong className={`${title} !text-[#713e27]`}>Website chưa được cấp quyền</strong>
        <span className={`${description} !text-[#85583f]`}>
          Domain hiện tại không nằm trong danh sách được phép sử dụng Widget này.
        </span>
      </div>
    );
  }

  if (state.status === 'not-found') {
    return (
      <div className={`${stateSurface} border-[#f1d2bc] bg-[#fff3e8]`} role="alert">
        <StatusMark kind="error" />
        <strong className={`${title} !text-[#713e27]`}>Không tìm thấy Widget</strong>
        <span className={`${description} !text-[#85583f]`}>
          Hãy kiểm tra lại Widget ID trong đoạn script nhúng.
        </span>
      </div>
    );
  }

  return (
    <div className={`${stateSurface} border-[#f1d2bc] bg-[#fff3e8]`} role="alert">
      <StatusMark kind="error" />
      <strong className={`${title} !text-[#713e27]`}>Chưa thể kết nối Chat API</strong>
      <span className={`${description} !text-[#85583f]`}>Kiểm tra kết nối mạng rồi thử lại.</span>
      <button
        type="button"
        className="mt-[7px] min-h-11 min-w-28 cursor-pointer rounded-[13px_13px_4px_13px] border-0 bg-[var(--cw-navy)] px-[18px] font-bold text-white transition-[background,box-shadow] duration-200 hover:bg-[#0c3441] hover:shadow-[0_5px_14px_rgb(10_38_48_/_18%)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[rgb(47_199_161_/_42%)]"
        onClick={onRetry}
      >
        Thử lại
      </button>
    </div>
  );
}
