# Acceptance Testing

## Automated quality gate

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
```

## Embed foundation manual smoke test

1. Chạy `pnpm dev`.
2. Mở `http://localhost:5173`.
3. Xác nhận host page hiển thị button/textarea cố tình bị style mạnh.
4. Xác nhận Widget launcher vẫn có navy/mint design riêng.
5. Mở panel, kiểm tra focus chuyển vào nút đóng.
6. Nhấn Escape, kiểm tra panel đóng và focus về launcher.
7. Thu viewport xuống dưới 520 px, kiểm tra launcher compact và panel không tràn màn hình.
8. Thêm embed script lần thứ hai, kiểm tra chỉ có một `#poc-chatwidget-root`.
9. Xóa `data-widget-id`, kiểm tra panel hiển thị lỗi cấu hình nhưng host page không lỗi.
10. Trên allowed origin, gửi một message và xác nhận thấy `Đang gửi`, `Đã gửi` rồi Mock reply.
11. Khi API gửi lỗi, xác nhận draft còn nguyên và có feedback để thử lại.
12. Ở viewport 375 px, xác nhận panel không overflow, textarea 16 px và target chính tối thiểu 44 px.

## Isolation assertions

- Host CSS `button`, `textarea` và universal selector không đổi component bên trong Shadow Root.
- Widget styles không đổi host button/textarea.
- Không có stylesheet Widget được inject vào `document.head`.

## Full-stack Compose acceptance

```bash
pnpm full:config
pnpm full:up
pnpm full:ps
pnpm full:smoke
```

1. Tất cả long-running service phải healthy và `init` phải exit code `0`.
2. `http://localhost:8082/widget.js` trả `200`, JavaScript content type và CORS header.
3. Allowed demo `http://localhost:8080` bootstrap session, gửi message và thấy Mock reply.
4. Blocked demo `http://localhost:8081` hiển thị domain chưa được cấp quyền; API bootstrap trả 403.
5. Tắt API tạm thời, hard reload allowed demo và xác nhận host page không crash, Widget có retry UX.
6. Với session hết hạn/401, xác nhận Widget bootstrap session mới thay vì giữ token cũ.
7. Chạy keyboard/mobile/isolation checklist phía trên trên cả allowed và blocked demo.

Dừng stack bằng `pnpm full:down`; command này giữ named database volume.

## Capability acceptance suites

Mỗi backend/frontend capability pair phải bổ sung test riêng cho allowed origin, session
bootstrap UI, session isolation, Mock Channel round-trip, 5/10-second rate limit, cooldown UX,
Zalo mapping và network error handling.

Drizzle repository integration test cần PostgreSQL local đã migrate và được bật tường minh:

```bash
RUN_DATABASE_TESTS=1 pnpm vitest run \
  apps/api/src/modules/messages/tests/drizzle-message.repository.spec.ts
```
