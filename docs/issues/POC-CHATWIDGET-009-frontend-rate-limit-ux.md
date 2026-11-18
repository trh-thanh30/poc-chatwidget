# [POC-CHATWIDGET-009] - Frontend Anti-spam và Rate-limit UX

Status: ready
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

- [ ] `429` hiển thị thời gian chờ, giữ draft và không crash host page.
- [ ] Submit disabled trong cooldown, tự enable khi hết hạn nhưng không tự gửi lại.
- [ ] Timer cleanup đúng; status không chỉ dùng màu và không spam live region mỗi giây.

## Out of Scope

Backend policy, CAPTCHA, fingerprinting và distributed rate limiting.

## Verification

```bash
pnpm --filter @chat-widget/widget check-types
pnpm test
pnpm --filter @chat-widget/widget build
```
