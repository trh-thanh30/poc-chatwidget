# [POC-CHATWIDGET-007] - Frontend Chat UI và Message Flow

Status: ready
Type: feature
Area: frontend
Blocked by: POC-CHATWIDGET-005, POC-CHATWIDGET-006

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Goal

Visitor gửi tin, xem history ngắn hạn và nhận Mock reply trong Widget mà không reload host page.

## Package/Reuse Strategy

- Axios instance từ session bootstrap gắn Bearer JWT.
- TanStack Query cho query keys, list query, send mutation và bounded polling.
- Chỉ thêm shadcn primitive/dependency khi component thực sự dùng; portal/CSS phải ở Shadow Root.

## Technical Scope

- QueryClient riêng trong Widget; message query, mutation và polling lifecycle.
- Active composer, validation, idempotency key, safe text rendering.
- Empty/loading/sending/sent/error states và controlled auto-scroll.

## Deliverables

- Chat API hooks, message list/item, composer, responsive/accessibility styles và tests.

## Acceptance Criteria

- [ ] Visitor gửi text, thấy sending/sent state và Mock reply qua polling.
- [ ] Empty/oversized draft bị chặn với accessible feedback.
- [ ] Double submit không tạo duplicate intent/message.
- [ ] HTML/script hiển thị nguyên văn và không thực thi.
- [ ] Network error giữ draft hoặc có retry rõ ràng.
- [ ] Query/polling dừng khi session chưa ready hoặc Widget unmount.
- [ ] Keyboard, focus, screen reader và viewport 375 px sử dụng được.

## Out of Scope

Rate-limit countdown, Zalo-specific UI, upload, rich text, typing/read receipt và WebSocket.

## Verification

```bash
pnpm --filter @chat-widget/widget check-types
pnpm test
pnpm --filter @chat-widget/widget build
```
