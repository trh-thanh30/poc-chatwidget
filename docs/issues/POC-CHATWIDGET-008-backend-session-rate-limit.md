# [POC-CHATWIDGET-008] - Backend Rate Limiting theo Widget Session

Status: ready
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

- [ ] Năm request đầu pass; request thứ sáu trong 10 giây trả `429`.
- [ ] Hết window gửi lại được; session/Widget khác không dùng chung counter.
- [ ] Sửa body session ID không bypass verified tracker key.
- [ ] Rejected message không persist/forward và response có `Retry-After`.

## Out of Scope

Frontend cooldown, CAPTCHA, fingerprinting, IP reputation, CDN/DDoS và distributed store.

## Verification

```bash
pnpm --filter @chat-widget/api check-types
pnpm test
pnpm --filter @chat-widget/api build
```
