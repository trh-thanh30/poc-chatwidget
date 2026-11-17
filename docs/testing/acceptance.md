# Acceptance Testing

## Automated quality gate

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
```

## POC-CHATWIDGET-002 manual smoke test

1. Chạy `pnpm dev`.
2. Mở `http://localhost:5173`.
3. Xác nhận host page hiển thị button/textarea cố tình bị style mạnh.
4. Xác nhận Widget launcher vẫn có navy/mint design riêng.
5. Mở panel, kiểm tra focus chuyển vào nút đóng.
6. Nhấn Escape, kiểm tra panel đóng và focus về launcher.
7. Thu viewport xuống dưới 520 px, kiểm tra launcher compact và panel không tràn màn hình.
8. Thêm embed script lần thứ hai, kiểm tra chỉ có một `#poc-chatwidget-root`.
9. Xóa `data-widget-id`, kiểm tra panel hiển thị lỗi cấu hình nhưng host page không lỗi.

## Isolation assertions

- Host CSS `button`, `textarea` và universal selector không đổi component bên trong Shadow Root.
- Widget styles không đổi host button/textarea.
- Không có stylesheet Widget được inject vào `document.head`.

## Future acceptance suites

Các task sau phải bổ sung test riêng cho allowed origin, session isolation, 5/10-second rate limit,
Mock Channel round-trip, Zalo mapping và network error handling.
