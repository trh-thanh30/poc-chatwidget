# [POC-CHATWIDGET-006] - Backend Message API và Mock Channel

Status: completed
Type: feature
Area: backend
Blocked by: POC-CHATWIDGET-012

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Goal

Cung cấp list/send Message API và Mock Channel deterministic cho một verified Widget session mà
không cần tài khoản Zalo.

## Package/Reuse Strategy

- Reuse Widget Session Guard và validated DTO/error conventions từ task `004`.
- Reuse Drizzle repositories/migration tooling; dùng crypto UUID thay package ID mới.

## Technical Scope

- Message schema/migration/repository và `ChatChannel` boundary.
- Mock Channel tạo operator reply deterministic.
- Protected list/send endpoints, session isolation và plain-text contract.
- Validate empty/oversized content; client idempotency key ngăn duplicate.

## Deliverables

- Persistence/migration, Mock Channel, list/send endpoints.
- Stable DTO/error contract và use-case/repository/HTTP tests.

## Acceptance Criteria

- [x] Verified session gửi/lấy message và nhận Mock reply không gọi dịch vụ ngoài.
- [x] Session A không đọc/ghi session B.
- [x] Empty/whitespace/oversized content bị từ chối.
- [x] Cùng idempotency key không tạo duplicate.
- [x] HTML/script được trả như plain text, không trusted HTML.
- [x] Invalid/expired/cross-origin session không gọi channel.

## Out of Scope

Chat UI, rate limiting, Zalo, upload, rich text, typing/read receipt, WebSocket và long-term history.

## Verification

```bash
pnpm --filter @chat-widget/api check-types
pnpm test
pnpm --filter @chat-widget/api build
```

## Notes

Ngày 2026-11-18, Message schema/migration, Drizzle repository, protected list/send endpoints và
deterministic Mock Channel đã hoàn thành. Full quality gate pass với 48 tests; repository
integration test pass trên PostgreSQL local. Production-provider smoke test xác nhận
session → send `201` → list `200` trả visitor message và Mock operator reply; HTTP log không chứa
JWT hoặc message content.
