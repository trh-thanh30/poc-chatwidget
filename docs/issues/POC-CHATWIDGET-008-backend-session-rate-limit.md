# [POC-CHATWIDGET-008] - Backend Rate Limiting theo Widget Session

Status: completed
Type: feature
Area: backend
Blocked by: POC-CHATWIDGET-006

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Goal

Giới hạn một verified Widget session tối đa 5 send requests trong 10 giây.

## Package/Reuse Strategy

- Dùng `@nestjs/throttler` đã cài và customize tracker/guard theo server-verified Widget ID +
  session ID; không tự tạo HTTP throttling framework hoặc dùng client-provided/IP-only key.

## Technical Scope

- Session-aware throttler policy/store trên send-message endpoint.
- `429` stable error + `Retry-After`; rejected request không persist/forward.
- Fake-time tests và ghi rõ single-instance limitation của default memory storage.

## Acceptance Criteria

- [x] Năm request đầu pass; request thứ sáu trong 10 giây trả `429`.
- [x] Hết window gửi lại được; session/Widget khác không dùng chung counter.
- [x] Sửa body session ID không bypass verified tracker key.
- [x] Rejected message không persist/forward và response có `Retry-After`.

## Out of Scope

Frontend cooldown, CAPTCHA, fingerprinting, IP reputation, CDN/DDoS và distributed store.

## Verification

```bash
pnpm --filter @chat-widget/api check-types
pnpm test
pnpm --filter @chat-widget/api build
```

## Notes

Ngày 2026-11-18, `POST /api/v1/messages` dùng `@nestjs/throttler` với tracker lấy từ
`widgetId + sessionId` của verified session. Policy cho phép 5 request trong rolling window 10 giây;
request bị chặn trả `MESSAGE_RATE_LIMITED`, `Retry-After` và không đi vào send use case. Full quality
gate pass với 60 tests; 1 database integration test vẫn opt-in và được skip mặc định.
