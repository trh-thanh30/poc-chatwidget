# [POC-CHATWIDGET-009] - Frontend Anti-spam và Rate-limit UX

Status: completed
Type: feature
Area: frontend
Blocked by: POC-CHATWIDGET-007, POC-CHATWIDGET-008

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Goal

Hiển thị cooldown rõ ràng khi backend trả `429`, giữ draft và tự khôi phục submit đúng thời điểm.

## Package/Reuse Strategy

- Normalize `429` trong Axios/TanStack Query error layer hiện có; dùng query/mutation state thay vì
  thêm global state library.

## Technical Scope

- Typed rate-limit error, server-driven countdown và composer cooldown.
- Không auto-retry send; cleanup timer khi unmount/session đổi; accessible announcement.

## Acceptance Criteria

- [x] `429` hiển thị thời gian chờ, giữ draft và không crash host page.
- [x] Submit disabled trong cooldown, tự enable khi hết hạn nhưng không tự gửi lại.
- [x] Timer cleanup đúng; status không chỉ dùng màu và không spam live region mỗi giây.

## Out of Scope

Backend policy, CAPTCHA, fingerprinting và distributed rate limiting.

## Verification

```bash
pnpm --filter @chat-widget/widget check-types
pnpm test
pnpm --filter @chat-widget/widget build
```

## Notes

Ngày 2026-11-18, Axios error layer nhận diện typed rate-limit error từ HTTP `429` và
`Retry-After`. Chat hook sở hữu deadline/countdown theo session client; composer giữ draft, khóa
submit trong cooldown và tự mở lại nhưng không auto-send. Live region chỉ chứa thông báo ổn định,
còn số giây trực quan nằm ngoài announcement để không spam screen reader. Full quality gate pass
với 63 tests; 1 database integration test opt-in được skip mặc định. IIFE build là 354,48 kB (gzip
112,60 kB).
