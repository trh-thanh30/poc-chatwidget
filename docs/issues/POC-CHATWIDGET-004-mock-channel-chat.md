# [POC-CHATWIDGET-004] - Gửi và nhận tin nhắn qua Mock Channel

Status: blocked
Type: feature
Blocked by: POC-CHATWIDGET-003

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Technical Scope

- Thêm message persistence và `ChatChannel` interface.
- Implement Mock Channel deterministic.
- Tạo API list/send messages có session isolation.
- Thêm Axios client, TanStack Query mutation/query và polling.
- Bật composer và render visitor/operator messages an toàn.

## Acceptance Criteria

- [ ] Visitor gửi text và thấy message trong panel.
- [ ] Mock Channel tạo reply và Widget nhận không cần reload.
- [ ] Session A không đọc/ghi message session B.
- [ ] Empty/oversized content bị từ chối.
- [ ] HTML/script content không được thực thi.
- [ ] Duplicate submit không tạo message trùng.

## Out of Scope

Zalo, upload, rich text, typing indicator, read receipts, Socket.IO và long-term history.

## Verification

Use-case tests, API integration tests và Widget round-trip tests.
