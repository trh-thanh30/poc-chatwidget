# [POC-CHATWIDGET-006] - Tích hợp Zalo Personal Channel hai chiều

Status: ready-for-human
Type: feature
Blocked by: POC-CHATWIDGET-004

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Technical Scope

- Implement Zalo adapter sau `ChatChannel` bằng exact pinned `zca-js` version.
- Chạy một listener singleton với credential từ secret.
- Forward visitor message tới configured operator thread.
- Map quoted external message về đúng Widget session và deduplicate event.
- Giữ Mock Channel cho automated tests/fallback development.

## Acceptance Criteria

- [ ] Dedicated POC account kết nối thành công.
- [ ] Widget message xuất hiện ở configured Zalo thread.
- [ ] Quoted reply trở về đúng Widget session.
- [ ] External event lặp không tạo message trùng.
- [ ] Mất Zalo connection không làm API/host page crash.
- [ ] Credential không xuất hiện trong repo, frontend hoặc logs.

## Out of Scope

Production SLA, nhiều tài khoản, Zalo OA, file/sticker/voice và multi-replica listener.

## Verification

Fake adapter automated tests và manual smoke test với tài khoản Zalo POC riêng.

## Notes

Task cần con người cung cấp/đăng nhập tài khoản POC và chấp nhận rủi ro API không chính thức.
