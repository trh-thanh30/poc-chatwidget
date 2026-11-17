# Project Context

## Product

POC Chat Widget cho phép doanh nghiệp nhúng giao diện chat vào website bằng một thẻ script.
Widget phải hoạt động độc lập với host page, chỉ chạy trên origin được phép và hạn chế spam.
Channel mục tiêu của POC là Zalo Personal; Mock Channel được dùng để phát triển và kiểm thử
deterministic.

## Shared Language

- **Widget**: toàn bộ embed client được tải từ `widget.js` và mount vào host page.
- **Widget ID**: public identifier trong `data-widget-id`; dùng để tìm cấu hình Widget, không
  phải secret.
- **Host page**: website bên ngoài nhúng `widget.js`.
- **Allowed origin**: origin chính xác gồm scheme, hostname và port được phép dùng Widget ID.
- **Widget session**: phiên chat ẩn danh được backend cấp và ràng buộc với Widget ID + origin.
- **Launcher**: nút chat nổi dùng để mở/đóng panel.
- **Chat panel**: cửa sổ chứa message list và composer.
- **Shadow Root**: DOM boundary chứa React tree và CSS của Widget.
- **Channel**: adapter chuyển tin giữa Widget session và hệ thống bên ngoài.
- **Mock Channel**: channel deterministic dùng cho local development và automated tests.
- **Zalo Personal Channel**: adapter không chính thức dùng tài khoản Zalo Personal cho POC.
- **External message ID**: ID của tin nhắn do channel bên ngoài trả về, dùng cho mapping và
  idempotency.
- **Vertical slice**: task nhỏ nhưng hoàn chỉnh qua các layer cần thiết và kiểm chứng độc lập.

## Terms to Avoid

- Không gọi Widget ID là API key hoặc secret.
- Không gọi hostname đơn lẻ là origin; port và scheme là một phần của origin.
- Không gọi Zalo Personal Channel là Zalo Official Account.
- Không dùng “user” mơ hồ khi có thể nói rõ visitor, operator hoặc widget session.

## Current State

- `POC-CHATWIDGET-002` đã hoàn thành monorepo, NestJS skeleton, embed IIFE, launcher/panel,
  Shadow DOM isolation, responsive UI và demo host.
- Chat API, persistence, origin whitelist, rate limiting và Zalo integration chưa được triển khai.
- Composer trong Widget hiện bị disable có chủ đích.

## Architecture Principles

- Backend luôn là nơi enforce origin, session và rate limit; client checks chỉ phục vụ UX.
- Widget runtime không được phụ thuộc CSS hoặc JavaScript global của host page.
- CSS Widget phải được đưa vào Shadow Root, không đưa vào `document.head`.
- Script nhúng phải idempotent: tải hai lần vẫn chỉ mount một Widget.
- Giữ channel sau một interface để Mock và Zalo có thể hoán đổi.
- Ưu tiên REST + polling cho POC; chỉ thêm realtime transport khi acceptance criteria yêu cầu.
- Packages dùng chung phải framework-neutral và không import từ apps.
- Tests tập trung vào observable behavior và boundary, không mirror implementation details.

## Scope Guardrails

Ngoài phạm vi POC: dashboard quản trị, upload file/ảnh/voice, CAPTCHA nâng cao, multi-channel,
handoff nhân viên, long-term history, high availability và UI customization nâng cao.
