# [POC-CHATWIDGET-010] - Backend Zalo Personal Channel hai chiều

Status: ready-for-human
Type: feature
Area: backend
Blocked by: POC-CHATWIDGET-006

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Goal

Thêm Zalo Personal adapter sau `ChatChannel` mà không đổi public Message API hoặc Widget frontend.

## Package/Reuse Strategy

- Pin exact `zca-js` version sau khi xác nhận version với dedicated POC account.
- Reuse Nest config validation, channel contract, persistence và error mapping; không import SDK
  ngoài adapter.

## Technical Scope

- Singleton listener lifecycle/shutdown, visitor forwarding, quoted-reply mapping và event dedupe.
- Credentials chỉ từ secret/ignored env; Mock Channel vẫn là default test/development adapter.

## Acceptance Criteria

- [ ] Dedicated account kết nối; Widget message tới operator thread và quoted reply về đúng session.
- [x] Duplicate external event không tạo duplicate message.
- [x] Connection loss không crash API/host; credential không xuất hiện repo/frontend/log/response.
- [x] `CHAT_CHANNEL=mock|zalo-personal` không đổi frontend contract.

## Out of Scope

Zalo-specific frontend, production SLA, multi-account, Zalo OA, rich media và multi-replica listener.

## Verification

```bash
pnpm --filter @chat-widget/api check-types
pnpm test
pnpm --filter @chat-widget/api build
```

## Notes

HITL: sau task `006`, cần con người cung cấp/đăng nhập dedicated POC account, chọn operator thread
và chấp nhận rủi ro API không chính thức.

Ngày 2026-11-18, adapter code đã được triển khai với exact `zca-js@2.3.0`, validated opt-in config,
singleton listener lifecycle, persisted outbound mapping, quoted-reply routing, event dedupe và
stable `503 CHANNEL_UNAVAILABLE`. Mock vẫn là default. Suite live có cờ `RUN_ZALO_LIVE_TESTS=1`;
AC đầu tiên và trạng thái `ready-for-human` được giữ lại cho tới khi dedicated account/operator
thread thật chạy pass suite này. Automated quality gate pass với 75 tests; database và Zalo live
integration suites được skip mặc định. `pnpm audit --prod` không phát hiện known vulnerability.
