# [POC-CHATWIDGET-004] - Frontend Widget Session Bootstrap

Status: blocked
Type: feature
Area: frontend
Blocked by: POC-CHATWIDGET-003

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Goal

Widget chỉ chuyển sang trạng thái sẵn sàng sau khi backend xác thực Widget ID, host origin và cấp
Widget session.

## Input

- `data-widget-id` và `data-api-url` từ embed script.
- Bootstrap/error contract do `POC-CHATWIDGET-003` cung cấp.
- Browser origin hiện tại; client không tự gửi origin giả để quyết định authorization.

## Technical Scope

- Tách bootstrap API client khỏi React presentation.
- Thêm lifecycle `initializing`, `ready`, `denied`, `not-found` và `unavailable`.
- Giữ session token trong memory của Widget runtime; không ghi local storage hoặc host globals.
- Hủy request khi Widget unmount và tránh state update sau unmount.
- Chỉ hiển thị trạng thái online/sẵn sàng sau bootstrap thành công.
- Cho phép retry lỗi network mà không reload hoặc throw vào host page.
- Giữ composer disabled cho đến task message flow.

## Deliverables

- Typed session bootstrap client và normalized frontend error.
- React hook/state owner cho Widget session.
- Loading, denied, not-found và retryable error UI trong Shadow Root.
- Widget tests với mocked HTTP responses.

## Acceptance Criteria

- [ ] Allowed host chuyển từ loading sang ready và giữ token trong memory.
- [ ] Disallowed origin hiển thị thông báo không được phép, không hiển thị trạng thái online.
- [ ] Unknown Widget có thông báo cấu hình riêng với lỗi network.
- [ ] API offline có retry control và không làm host page crash.
- [ ] Duplicate embed vẫn chỉ bootstrap một Widget instance.
- [ ] Request bị abort khi Widget unmount.
- [ ] Status/error được announce bằng semantic HTML hoặc live region phù hợp.
- [ ] Token không xuất hiện trong DOM, log, URL hoặc storage của host.

## Out of Scope

Message list, composer hoạt động, polling, TanStack Query, rate-limit UX và Zalo.

## Verification

```bash
pnpm --filter @chat-widget/widget check-types
pnpm test
pnpm --filter @chat-widget/widget build
```

Smoke test trên allowed và blocked demo origin, desktop và viewport 375 px.
