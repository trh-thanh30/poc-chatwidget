# [POC-CHATWIDGET-007] - Frontend Chat UI và Message Flow

Status: completed
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

- [x] Visitor gửi text, thấy sending/sent state và Mock reply qua polling.
- [x] Empty/oversized draft bị chặn với accessible feedback.
- [x] Double submit không tạo duplicate intent/message.
- [x] HTML/script hiển thị nguyên văn và không thực thi.
- [x] Network error giữ draft hoặc có retry rõ ràng.
- [x] Query/polling dừng khi session chưa ready hoặc Widget unmount.
- [x] Keyboard, focus, screen reader và viewport 375 px sử dụng được.

## Out of Scope

Rate-limit countdown, Zalo-specific UI, upload, rich text, typing/read receipt và WebSocket.

## Verification

```bash
pnpm --filter @chat-widget/widget check-types
pnpm test
pnpm --filter @chat-widget/widget build
```

## Notes

Ngày 2026-11-18, Widget đã có QueryClient riêng, typed Chat API, bounded polling, active composer,
idempotent retry, safe message rendering và sending/sent/error states. Full quality gate pass với
56 tests. Built IIFE là 352,87 kB (gzip 112,16 kB). Chrome headless smoke trên allowed origin ở
viewport 375×812 xác nhận send/Mock reply thật, panel không overflow, textarea 16 px, close/send
targets 44×44 px và stylesheet chỉ nằm trong Shadow Root.
