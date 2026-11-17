# [POC-CHATWIDGET-002] - Khởi tạo Monorepo và Embed Chat Widget cô lập

Status: completed
Type: feature
Area: integration
Blocked by: None

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Technical Scope

- Khởi tạo pnpm workspace và Turborepo.
- Tạo `apps/widget`, `apps/api`, `apps/demo` và shared TypeScript config.
- Build Widget thành IIFE `widget.js`.
- Đọc `data-widget-id` và `data-api-url` từ embed script.
- Hiển thị launcher và panel mở/đóng.
- Mount React và CSS trong Shadow Root.
- Ngăn script mount trùng.
- Thiết lập lint, typecheck, test và build.

## Goal

Chứng minh Chat Widget có thể được nhúng bằng một script và hoạt động độc lập với host page.

## Deliverables

- [x] Monorepo chạy bằng pnpm.
- [x] NestJS health endpoint.
- [x] `apps/widget/dist/widget.js` khi build.
- [x] Demo host có CSS conflict.
- [x] Responsive launcher/panel.
- [x] README hướng dẫn chạy và nhúng.

## Acceptance Criteria

- [x] Workspace cài và chạy được.
- [x] Build tạo `widget.js` IIFE.
- [x] Embed script hiển thị Widget.
- [x] Widget đọc đúng data attributes.
- [x] Launcher mở/đóng được và hỗ trợ Escape/focus.
- [x] Shadow DOM ngăn CSS host đi vào component tree.
- [x] CSS Widget không thoát ra host page.
- [x] Script tải lặp chỉ mount một host.
- [x] Widget responsive và tôn trọng reduced motion.

## Out of Scope

- Chat API, persistence, whitelist, rate limiting và Zalo Personal.

## Verification

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
pnpm dev
```

Runtime endpoints:

- `http://localhost:5173`
- `http://localhost:4173/widget.js`
- `http://localhost:3000/api/v1/health`

## Notes

- Artifact build khoảng 232 KB, gzip khoảng 73 KB tại thời điểm hoàn thành.
- Composer bị disable có chủ đích cho đến chat vertical slice.
