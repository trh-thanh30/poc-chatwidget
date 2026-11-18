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

## Delivery Plan

Frontend và backend được quản lý bằng issue độc lập để scope, owner, acceptance criteria và review
rõ ràng. Hai issue trong cùng capability pair tạo thành một đường chạy end-to-end.

| ID                   | Area         | Deliverable                                 | Blocked by                 |
| -------------------- | ------------ | ------------------------------------------- | -------------------------- |
| `POC-CHATWIDGET-002` | foundation   | Monorepo và isolated embed                  | None                       |
| `POC-CHATWIDGET-003` | tooling      | Local infrastructure và dependency baseline | `002`                      |
| `POC-CHATWIDGET-004` | backend      | JWT Chat Session và Domain Whitelist        | `003`                      |
| `POC-CHATWIDGET-005` | frontend     | Widget Session Bootstrap                    | `004`                      |
| `POC-CHATWIDGET-006` | backend      | Message API và Mock Channel                 | `004`                      |
| `POC-CHATWIDGET-007` | frontend     | Chat UI và Message Flow                     | `005`, `006`               |
| `POC-CHATWIDGET-008` | backend      | Rate Limiting theo Widget Session           | `006`                      |
| `POC-CHATWIDGET-009` | frontend     | Anti-spam và Rate-limit UX                  | `007`, `008`               |
| `POC-CHATWIDGET-010` | backend/HITL | Zalo Personal Channel                       | `006`                      |
| `POC-CHATWIDGET-011` | integration  | Full-stack packaging, hardening và handoff  | `005`, `007`, `009`, `010` |
