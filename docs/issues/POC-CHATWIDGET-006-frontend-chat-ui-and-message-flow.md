# [POC-CHATWIDGET-006] - Frontend Chat UI và Message Flow

Status: blocked
Type: feature
Area: frontend
Blocked by: POC-CHATWIDGET-004, POC-CHATWIDGET-005

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Goal

Cho phép visitor gửi tin nhắn, xem message history ngắn hạn và nhận Mock Channel reply ngay trong
Widget mà không reload host page.

## Input

- Ready Widget session từ `POC-CHATWIDGET-004`.
- Message API/error contract từ `POC-CHATWIDGET-005`.
- UI rules cho Shadow DOM, accessibility và mobile.

## Technical Scope

- Thêm một configured Axios client cho Widget API.
- Thêm TanStack Query client nằm hoàn toàn trong Widget runtime.
- Implement message query, send mutation, query keys và bounded polling.
- Bật composer, client validation và idempotency key cho mỗi submit intent.
- Render visitor/operator message dưới dạng text an toàn.
- Thêm empty, loading, sending, sent, retryable-error và polling state.
- Auto-scroll có kiểm soát, không cướp vị trí khi visitor đang đọc message cũ.
- Dùng shadcn/ui primitive tối thiểu nếu thực sự cần và giữ portal/CSS trong Shadow Root.

## Deliverables

- Axios transport và TanStack Query setup.
- Message list, message item, composer và feature hooks.
- Responsive/accessibility styles trong Shadow Root.
- Component tests và Widget round-trip test với mock API.

## Acceptance Criteria

- [ ] Visitor gửi text và thấy message state rõ ràng trong panel.
- [ ] Mock reply xuất hiện qua polling mà không reload host page.
- [ ] Empty/oversized draft bị chặn với message accessible.
- [ ] Double-click/Enter lặp không tạo hai submit intent cùng idempotency key.
- [ ] Text chứa HTML/script hiển thị nguyên văn và không thực thi.
- [ ] Network send failure giữ draft hoặc cung cấp retry rõ ràng.
- [ ] Query/polling dừng khi Widget session không ready hoặc component unmount.
- [ ] Keyboard, focus, screen reader và viewport 375 px sử dụng được.

## Out of Scope

Rate-limit countdown, Zalo-specific UI, upload, rich text, typing indicator, read receipt và
WebSocket.

## Verification

```bash
pnpm --filter @chat-widget/widget check-types
pnpm test
pnpm --filter @chat-widget/widget build
```

Manual round-trip test trên demo host phải dùng built `widget.js`, không import source Widget.
