# [POC-CHATWIDGET-005] - Backend Message API và Mock Channel

Status: blocked
Type: feature
Area: backend
Blocked by: POC-CHATWIDGET-003

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Goal

Cung cấp message API hoàn chỉnh cho một Widget session và Mock Channel deterministic để phát
triển, demo, kiểm thử mà không cần tài khoản Zalo.

## Input

- Verified Widget session contract từ `POC-CHATWIDGET-003`.
- Text message và client-generated idempotency key.
- PostgreSQL/Drizzle persistence.

## Technical Scope

- Thêm message schema/migration và repository.
- Định nghĩa `ChatChannel` framework-neutral boundary.
- Implement Mock Channel tạo operator reply deterministic.
- Tạo list/send message API được bảo vệ bằng signed Widget session.
- Cô lập query/write theo session ID và Widget ID.
- Validate empty/oversized content và xử lý idempotency key.
- Render contract chỉ chứa plain text, không trả trusted HTML.

## Deliverables

- Message persistence và migration.
- `ChatChannel` contract cùng Mock implementation.
- List/send endpoints và stable DTO/error contract.
- Use-case, repository và HTTP integration tests.

## Acceptance Criteria

- [ ] Session hợp lệ gửi text và nhận persisted visitor message.
- [ ] Mock Channel tạo operator reply có thể list lại mà không gọi dịch vụ ngoài.
- [ ] Session A không đọc hoặc ghi message của session B.
- [ ] Empty/whitespace/oversized content bị từ chối.
- [ ] Cùng idempotency key không tạo message trùng.
- [ ] HTML/script được lưu và trả về như plain text, không đánh dấu trusted content.
- [ ] Invalid, expired hoặc cross-origin session không gọi channel.

## Out of Scope

Chat UI, rate limiting, Zalo, upload, rich text, typing indicator, read receipt, WebSocket và
long-term history.

## Verification

```bash
pnpm --filter @chat-widget/api check-types
pnpm test
pnpm --filter @chat-widget/api build
```

Integration test phải chứng minh session isolation, idempotency và deterministic reply.
