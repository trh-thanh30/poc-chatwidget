# [POC-CHATWIDGET-003] - Khởi tạo Widget Session và kiểm soát Allowed Origin

Status: ready
Type: feature
Blocked by: POC-CHATWIDGET-002

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Technical Scope

- Thêm PostgreSQL + Drizzle và migration cho Widget, allowed origin, Widget session.
- Seed `demo-widget` và origin development.
- Tạo bootstrap session API và signed session token.
- Validate exact request origin ở backend và bind token với Widget ID + origin.
- Widget chỉ chuyển sang trạng thái hoạt động sau bootstrap thành công.

## Acceptance Criteria

- [ ] Allowed origin tạo session thành công.
- [ ] Unknown Widget trả `404`; disabled Widget hoặc disallowed origin bị từ chối.
- [ ] Token của origin A không dùng được từ origin B.
- [ ] Scheme/hostname/port được normalize và so sánh chính xác.
- [ ] Backend enforce rule; sửa client code không bypass được.
- [ ] Lỗi bootstrap không ảnh hưởng host page.

## Out of Scope

Wildcard domain, dashboard, DNS ownership verification, messages, rate limit và Zalo.

## Verification

Unit test origin normalization, API integration test allowed/blocked origins và Widget UI test.
