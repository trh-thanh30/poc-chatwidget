# [POC-CHATWIDGET-003] - Backend Chat Session và Domain Whitelist

Status: ready
Type: feature
Area: backend
Blocked by: POC-CHATWIDGET-002

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Goal

Cung cấp security boundary phía backend để chỉ origin được cấu hình cho một Widget ID mới có
thể nhận Widget session hợp lệ.

## Input

- Public Widget ID từ request body.
- HTTP `Origin` header do browser gửi.
- PostgreSQL connection và signing secret từ environment.
- Development configuration cho `demo-widget` và `http://localhost:5173`.

## Technical Scope

- Thêm Drizzle schema và migration cho Widget, allowed origin và Widget session.
- Seed `demo-widget` cùng allowed development origin.
- Chuẩn hóa origin theo scheme, hostname và port trước khi exact-match.
- Tạo API bootstrap session và signed session token có expiry.
- Bind token với session ID, Widget ID và normalized origin.
- Cung cấp server-side session verification có thể tái sử dụng bởi message API.
- Cấu hình CORS để browser gọi API nhưng không dùng CORS thay authorization.

## Deliverables

- PostgreSQL/Drizzle schema, migration và development seed.
- Session bootstrap endpoint và stable error envelope.
- Signed token service và session repository boundary.
- Environment example và hướng dẫn migrate/seed.
- Unit tests và HTTP integration tests.

## Acceptance Criteria

- [ ] Allowed origin tạo session thành công và nhận token có expiry.
- [ ] Unknown Widget trả `404` với error code ổn định.
- [ ] Disabled Widget hoặc disallowed origin trả `403`.
- [ ] Token của origin A không xác thực được từ origin B, kể cả khi B cũng được whitelist.
- [ ] Scheme, hostname, default/explicit port và hostname casing được normalize/test rõ ràng.
- [ ] Sửa request body hoặc client code không bypass được backend origin enforcement.
- [ ] Session hết hạn hoặc token bị sửa trả `401` mà không lộ signing detail.
- [ ] Migration chạy được trên PostgreSQL sạch.

## Out of Scope

Widget UI, wildcard domain, dashboard, DNS ownership verification, message API, rate limiting và
Zalo.

## Verification

```bash
pnpm --filter @chat-widget/api check-types
pnpm test
pnpm --filter @chat-widget/api build
```

Chạy integration test cho allowed, blocked, unknown, disabled và cross-origin token cases.
