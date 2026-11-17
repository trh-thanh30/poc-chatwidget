# [POC-CHATWIDGET-008] - Frontend Anti-spam và Rate-limit UX

Status: blocked
Type: feature
Area: frontend
Blocked by: POC-CHATWIDGET-006, POC-CHATWIDGET-007

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Goal

Khi backend giới hạn gửi tin, Widget giải thích rõ thời gian chờ, ngăn submit dư thừa và tự khôi
phục mà không làm mất draft hoặc ảnh hưởng host page.

## Input

- `429` error envelope và `Retry-After` từ `POC-CHATWIDGET-007`.
- Composer/send mutation từ `POC-CHATWIDGET-006`.

## Technical Scope

- Normalize rate-limit response tại Axios/query error boundary.
- Tạm khóa submit nhưng giữ textarea/draft có thể đọc/chỉnh sửa.
- Hiển thị countdown từ server-provided retry time.
- Tự bật lại submit khi window kết thúc, không tự gửi lại message.
- Hủy timer khi Widget unmount hoặc session thay đổi.
- Announce rate-limit state một lần hợp lý cho assistive technology.

## Deliverables

- Typed rate-limit frontend error.
- Composer cooldown state và countdown UI.
- Fake-timer component tests.

## Acceptance Criteria

- [ ] `429` hiển thị thời gian chờ rõ ràng và không crash Widget/host page.
- [ ] Draft hiện tại không bị mất khi request bị rate limit.
- [ ] Submit bị disable trong cooldown và tự enable khi hết thời gian.
- [ ] Widget không tự retry send mutation gây duplicate hoặc kéo dài limit.
- [ ] Timer được cleanup khi unmount/session đổi.
- [ ] Status không chỉ truyền đạt bằng màu và không spam live region mỗi giây.

## Out of Scope

Thay đổi backend policy, CAPTCHA, fingerprinting và distributed rate limiting.

## Verification

```bash
pnpm --filter @chat-widget/widget check-types
pnpm test
pnpm --filter @chat-widget/widget build
```
