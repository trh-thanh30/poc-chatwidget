# [POC-CHATWIDGET-007] - Backend Rate Limiting theo Widget Session

Status: blocked
Type: feature
Area: backend
Blocked by: POC-CHATWIDGET-005

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Goal

Ngăn một Widget session gửi quá 5 tin nhắn trong 10 giây mà không ảnh hưởng session hoặc Widget
khác.

## Input

- Verified session identity từ signed token.
- Send-message use case từ `POC-CHATWIDGET-005`.
- Clock abstraction để test boundary deterministic.

## Technical Scope

- Thêm rate-limit policy/store cho send-message path.
- Dùng server-verified Widget ID + session ID làm key.
- Cho phép 5 request đầu trong window 10 giây và reject request tiếp theo.
- Trả `429`, error code ổn định và `Retry-After` chính xác.
- Không persist hoặc forward message bị reject.
- Ghi rõ giới hạn single-instance nếu dùng in-memory store cho POC.

## Deliverables

- Session rate-limit policy và store abstraction.
- Integration vào send-message use case.
- Fake-clock unit tests và HTTP integration tests.

## Acceptance Criteria

- [ ] Năm send requests đầu được chấp nhận; request thứ sáu trong window nhận `429`.
- [ ] Hết 10 giây, session gửi lại được.
- [ ] Session hoặc Widget khác không dùng chung counter.
- [ ] Client không đổi body/session ID để bypass key đã được backend xác thực.
- [ ] Rejected message không được persist hoặc forward tới channel.
- [ ] Response có `Retry-After` và không lộ internal key/store detail.

## Out of Scope

Frontend countdown, CAPTCHA, fingerprinting, IP reputation, DDoS/CDN protection và distributed
rate limiting.

## Verification

```bash
pnpm --filter @chat-widget/api check-types
pnpm test
pnpm --filter @chat-widget/api build
```
