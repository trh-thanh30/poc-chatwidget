# [POC-CHATWIDGET-001] - Xây dựng Chat Widget nhúng vào Website

Status: accepted

## 1. Technical Scope

- Xây dựng Chat Widget có thể nhúng vào website bên ngoài bằng một đoạn script.
- Widget hiển thị dưới dạng nút chat nổi ở góc màn hình.
- Cho phép người dùng mở cửa sổ chat và gửi/nhận tin nhắn.
- Cấu hình danh sách domain được phép sử dụng Widget.
- Giới hạn tần suất gửi tin nhắn để chống spam cơ bản.
- Widget hoạt động độc lập, hạn chế xung đột CSS/JS với website được nhúng.

## 2. Goal (Business Value)

Cho phép doanh nghiệp tích hợp tính năng chat vào website của mình mà không cần xây dựng giao
diện chat riêng.

Mục tiêu POC: chỉ cần thêm một đoạn script vào website là có thể sử dụng Chat Widget, đồng thời
kiểm soát được domain sử dụng và hạn chế spam.

## 3. Input (Pre-conditions)

- Sử dụng thư viện chat với Zalo Personal.
- Có website HTML đơn giản để thử nghiệm nhúng Widget.
- Có cấu hình Widget ID và danh sách domain được phép.

## 4. Output (Deliverables)

- Script nhúng Widget:

```html
<script src="https://example.com/widget.js" data-widget-id="demo-widget" defer></script>
```

- Giao diện gồm launcher, message list và composer.
- API gửi/nhận tin nhắn.
- Whitelist domain theo Widget ID.
- Rate limiting cơ bản.
- Trang demo và hướng dẫn tích hợp.

## 5. Acceptance Criteria

- **Embed:** Script trên website hợp lệ hiển thị Widget và hoạt động.
- **Chat:** Visitor gửi tin và nhận phản hồi từ API hoặc Mock Channel.
- **Domain Restriction:** Backend từ chối request từ origin ngoài whitelist.
- **Anti-spam:** Quá 5 tin trong 10 giây từ cùng Widget session bị từ chối tạm thời.
- **UI:** Widget mở/đóng và sử dụng được trên desktop/mobile.
- **Isolation:** CSS hai phía không ảnh hưởng lẫn nhau.
- **Error Handling:** API lỗi/mất kết nối có thông báo phù hợp và không ảnh hưởng host page.

## 6. Out of Scope

- Dashboard quản trị Widget.
- Tùy chỉnh giao diện nâng cao.
- Upload file, hình ảnh hoặc voice.
- Chat đa kênh hoặc chuyển tiếp nhân viên.
- CAPTCHA và chống bot nâng cao.
- Lưu trữ lịch sử chat dài hạn.

## Delivery Slices

1. `POC-CHATWIDGET-002` — Monorepo và isolated embed.
2. `POC-CHATWIDGET-003` — Widget session và allowed origin.
3. `POC-CHATWIDGET-004` — Mock Channel chat round-trip.
4. `POC-CHATWIDGET-005` — Session rate limiting.
5. `POC-CHATWIDGET-006` — Zalo Personal Channel.
6. `POC-CHATWIDGET-007` — hardening, packaging và handoff docs.
