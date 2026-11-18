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
- [ ] Duplicate external event không tạo duplicate message.
- [ ] Connection loss không crash API/host; credential không xuất hiện repo/frontend/log/response.
- [ ] `CHAT_CHANNEL=mock|zalo-personal` không đổi frontend contract.

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
