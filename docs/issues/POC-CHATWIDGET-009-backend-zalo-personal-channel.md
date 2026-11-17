# [POC-CHATWIDGET-009] - Backend Zalo Personal Channel hai chiều

Status: blocked
Type: feature
Area: backend
Blocked by: POC-CHATWIDGET-005

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Goal

Thay Mock Channel bằng Zalo Personal adapter mà không thay đổi public message API hoặc Chat
Widget frontend.

## Input

- `ChatChannel` contract từ `POC-CHATWIDGET-005`.
- Dedicated POC account và operator thread do con người cung cấp.
- Credential/session từ secret storage hoặc local ignored environment.

## Technical Scope

- Pin exact `zca-js` version và chỉ import SDK trong adapter.
- Chạy một listener singleton với lifecycle/shutdown rõ ràng.
- Forward visitor message tới configured operator thread.
- Map quoted external reply về đúng Widget session.
- Deduplicate external events theo external message ID.
- Map connection/SDK errors thành application error ổn định.
- Giữ Mock Channel làm default automated-test và development fallback.

## Deliverables

- `ZaloPersonalChannel` adapter và configuration validation.
- Listener lifecycle, mapping và deduplication logic.
- Fake-adapter automated tests và manual smoke checklist.

## Acceptance Criteria

- [ ] Dedicated POC account kết nối thành công trong manual smoke test.
- [ ] Widget message xuất hiện ở configured Zalo thread.
- [ ] Quoted reply trở về đúng Widget session qua message API hiện có.
- [ ] External event lặp không tạo message trùng.
- [ ] Mất Zalo connection không làm API hoặc host page crash.
- [ ] Credential không xuất hiện trong repo, frontend, response hoặc logs.
- [ ] Chuyển `CHAT_CHANNEL=mock|zalo-personal` không đổi frontend contract.

## Out of Scope

Frontend riêng cho Zalo, production SLA, nhiều tài khoản, Zalo OA, file/sticker/voice và
multi-replica listener.

## Verification

```bash
pnpm --filter @chat-widget/api check-types
pnpm test
pnpm --filter @chat-widget/api build
```

## Notes

Đây là HITL task. Khi `POC-CHATWIDGET-005` hoàn thành, chuyển sang `ready-for-human`; cần con
người đăng nhập tài khoản POC và chấp nhận rủi ro API không chính thức.
