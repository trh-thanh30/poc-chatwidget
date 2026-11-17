# [POC-CHATWIDGET-005] - Rate limiting chống spam theo Widget Session

Status: blocked
Type: feature
Blocked by: POC-CHATWIDGET-004

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Technical Scope

- Giới hạn 5 send-message requests trong 10 giây.
- Tracker key lấy từ signed Widget ID + Widget session ID.
- Trả `429` và `Retry-After`; Widget hiển thị trạng thái chờ.
- Không persist hoặc forward message bị rate limit.

## Acceptance Criteria

- [ ] Năm request đầu được chấp nhận, request thứ sáu nhận `429`.
- [ ] Sau cửa sổ 10 giây session gửi lại được.
- [ ] Session/Widget khác không dùng chung key.
- [ ] Client không đổi body session ID để bypass.
- [ ] UI xử lý rate limit không crash host page.

## Out of Scope

CAPTCHA, fingerprinting, IP reputation, DDoS/CDN protection và distributed rate limiting.

## Verification

Fake-time unit test và API integration test đúng cửa sổ 5/10 giây.
