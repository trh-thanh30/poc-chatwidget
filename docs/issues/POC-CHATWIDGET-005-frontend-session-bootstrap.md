# [POC-CHATWIDGET-005] - Frontend Widget Session Bootstrap

Status: completed
Type: feature
Area: frontend
Blocked by: POC-CHATWIDGET-012

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Goal

Widget chỉ chuyển sang trạng thái sẵn sàng sau khi backend xác thực Widget ID/origin và cấp JWT
Widget session.

## Package/Reuse Strategy

- Dùng configured Axios instance đã cài; không tự bọc `fetch` rải rác trong component.
- Dùng Tailwind CSS qua Vite plugin; compiled CSS vẫn được import dạng chuỗi vào Shadow Root.
- Chưa cần TanStack Query cho one-shot bootstrap; giữ client có thể tái sử dụng ở chat flow.

## Technical Scope

- Session API client tách khỏi React presentation.
- Lifecycle `initializing`, `ready`, `denied`, `not-found`, `unavailable`.
- JWT chỉ giữ trong memory của Widget runtime; không log, DOM, URL hoặc storage.
- Abort request khi unmount; retry network failure không reload/throw vào host page.
- Chỉ hiển thị online/ready sau bootstrap thành công; composer tiếp tục disabled.

## Deliverables

- Typed Axios client/session contract và normalized frontend errors.
- React session hook/state owner.
- Loading, denied, not-found, unavailable và retry UI trong Shadow Root.
- Component/bootstrap tests với mocked HTTP transport.

## Acceptance Criteria

- [x] Allowed host chuyển loading → ready và giữ JWT trong memory.
- [x] Blocked/unknown/network cases có UI khác nhau, accessible và không báo online sai.
- [x] API offline retry được mà không crash host page.
- [x] Duplicate embed chỉ bootstrap một Widget instance.
- [x] Request bị abort khi unmount và không update state sau unmount.
- [x] JWT không xuất hiện trong DOM, URL, storage hoặc logs.
- [x] Desktop và viewport 375 px sử dụng được.

## Out of Scope

Message list, active composer, polling, rate-limit UX và Zalo.

## Verification

```bash
pnpm --filter @chat-widget/widget check-types
pnpm test
pnpm --filter @chat-widget/widget build
```

## Notes

Ngày 2026-11-18, Widget session lifecycle, Axios interceptors và Shadow DOM bootstrap tests pass.
Tailwind utilities được compile vào `widget.js` rồi inject qua stylesheet inline trong Shadow Root.
Local smoke test xác nhận demo/asset endpoints, CORS preflight và session API thật hoạt động; token
không được render hoặc ghi vào browser storage/logging.
