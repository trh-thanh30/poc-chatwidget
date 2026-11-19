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
      <section className="widget-failure" role="alert" aria-label="Chat Widget gặp lỗi">
        <strong>Chat tạm thời chưa khả dụng</strong>
        <span>Website vẫn hoạt động bình thường. Bạn có thể thử khởi động lại Widget.</span>
        <button type="button" onClick={this.retry}>
          Thử lại Widget
        </button>
      </section>
    );
  }
}
