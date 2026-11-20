import { Component, type ErrorInfo, type ReactNode } from 'react';

type WidgetErrorBoundaryProps = {
  children: ReactNode;
};

type WidgetErrorBoundaryState = {
  failed: boolean;
};

export class WidgetErrorBoundary extends Component<
  WidgetErrorBoundaryProps,
  WidgetErrorBoundaryState
> {
  state: WidgetErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): WidgetErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Keep integration failures isolated from the host page and avoid logging chat/session data.
  }

  private readonly retry = (): void => this.setState({ failed: false });

  render(): ReactNode {
    if (!this.state.failed) return this.props.children;

    return (
      <section
        className="fixed right-[max(20px,env(safe-area-inset-right,0px))] bottom-[max(20px,env(safe-area-inset-bottom,0px))] z-[2147483000] grid w-[min(310px,calc(100vw-24px))] gap-2.5 rounded-2xl border border-[#fecaca] bg-white p-[18px] font-sans text-[#1f2937] shadow-[0_18px_42px_rgb(70_16_13_/_20%)] max-[520px]:right-[max(12px,env(safe-area-inset-right,0px))] max-[520px]:bottom-[max(12px,env(safe-area-inset-bottom,0px))]"
        role="alert"
        aria-label="Chat Widget gặp lỗi"
      >
        <strong className="text-base">Chat tạm thời chưa khả dụng</strong>
        <span className="text-[13px] leading-5 text-[#6b7280]">
          Website vẫn hoạt động bình thường. Bạn có thể thử khởi động lại Widget.
        </span>
        <button
          className="min-h-11 cursor-pointer rounded-xl border-0 bg-[#e21b14] text-white transition-colors duration-200 hover:bg-[#c91711] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#e21b14]/35"
          type="button"
          onClick={this.retry}
        >
          Thử lại Widget
        </button>
      </section>
    );
  }
}
