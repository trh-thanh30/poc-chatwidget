import type { WidgetSessionState } from '../types/widget-session.types';

type SessionStateProps = {
  state: WidgetSessionState;
  configurationIssue?: 'api-url' | 'widget-id';
  onRetry(): void;
};

const stateSurface =
  'grid max-w-[280px] justify-items-center gap-[7px] rounded-2xl border p-5 text-center';
const title = 'm-0 text-[17px] font-bold tracking-[-0.015em] text-[#1f2937]';
const description = 'm-0 text-[13px] leading-[1.55] text-[#6b7280]';

function StatusMark({ kind }: { kind: 'error' | 'loading' | 'ready' }) {
  const color = kind === 'error' ? 'bg-[#fee2e2] text-[#b42318]' : 'bg-[#fee2e2] text-[#e21b14]';

  return (
    <span
      className={`mb-[5px] grid size-[52px] place-items-center rounded-xl ${color}`}
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
      <div className={`${stateSurface} border-[#fecaca] bg-[#fff5f5]`} role="alert">
        <StatusMark kind="error" />
        <strong className={`${title} !text-[#7f1d1d]`}>Thiếu Widget ID</strong>
        <span className={`${description} !text-[#991b1b]`}>
          Hãy thêm thuộc tính data-widget-id vào script nhúng.
        </span>
      </div>
    );
  }

  if (configurationIssue === 'api-url') {
    return (
      <div className={`${stateSurface} border-[#fecaca] bg-[#fff5f5]`} role="alert">
        <StatusMark kind="error" />
        <strong className={`${title} !text-[#7f1d1d]`}>Thiếu địa chỉ Chat API</strong>
        <span className={`${description} !text-[#991b1b]`}>
          Hãy kiểm tra thuộc tính data-api-url trong script nhúng.
        </span>
      </div>
    );
  }

  if (state.status === 'initializing') {
    return (
      <div
        className={`${stateSurface} border-[#e5e7eb] bg-[#f9fafb]`}
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
      <div className={`${stateSurface} border-[#fecaca] bg-[#fff5f5]`}>
        <StatusMark kind="ready" />
        <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#e21b14]">
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
      <div className={`${stateSurface} border-[#fecaca] bg-[#fff5f5]`} role="alert">
        <StatusMark kind="error" />
        <strong className={`${title} !text-[#7f1d1d]`}>Website chưa được cấp quyền</strong>
        <span className={`${description} !text-[#991b1b]`}>
          Domain hiện tại không nằm trong danh sách được phép sử dụng Widget này.
        </span>
      </div>
    );
  }

  if (state.status === 'not-found') {
    return (
      <div className={`${stateSurface} border-[#fecaca] bg-[#fff5f5]`} role="alert">
        <StatusMark kind="error" />
        <strong className={`${title} !text-[#7f1d1d]`}>Không tìm thấy Widget</strong>
        <span className={`${description} !text-[#991b1b]`}>
          Hãy kiểm tra lại Widget ID trong đoạn script nhúng.
        </span>
      </div>
    );
  }

  return (
    <div className={`${stateSurface} border-[#fecaca] bg-[#fff5f5]`} role="alert">
      <StatusMark kind="error" />
      <strong className={`${title} !text-[#7f1d1d]`}>Chưa thể kết nối Chat API</strong>
      <span className={`${description} !text-[#991b1b]`}>Kiểm tra kết nối mạng rồi thử lại.</span>
      <button
        type="button"
        className="mt-[7px] min-h-11 min-w-28 cursor-pointer rounded-xl border-0 bg-[#e21b14] px-[18px] font-bold text-white transition-[background,box-shadow] duration-200 hover:bg-[#c91711] hover:shadow-[0_5px_14px_rgb(226_27_20_/_18%)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#e21b14]/35"
        onClick={onRetry}
      >
        Thử lại
      </button>
    </div>
  );
}
