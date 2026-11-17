# Embed Widget Integration

## Development snippet

```html
<script
  src="http://localhost:4173/widget.js"
  data-widget-id="demo-widget"
  data-api-url="http://localhost:3000/api/v1"
  defer
></script>
```

## Attributes

| Attribute        | Required    | Description                                         |
| ---------------- | ----------- | --------------------------------------------------- |
| `src`            | yes         | URL tới artifact IIFE `widget.js`                   |
| `data-widget-id` | yes         | Public Widget ID; không phải secret                 |
| `data-api-url`   | planned     | Base URL cho Widget API ở task tiếp theo            |
| `defer`          | recommended | Chạy sau khi HTML parse, không block page rendering |

## Runtime behavior hiện tại

- Script tạo host `#poc-chatwidget-root` dưới `document.body`.
- Nếu host đã tồn tại, script dừng và dùng instance hiện tại.
- React UI và CSS nằm trong open Shadow Root.
- Thiếu Widget ID vẫn hiển thị launcher nhưng panel báo lỗi cấu hình.
- Widget chưa gọi API hoặc gửi tin trong task hiện tại.

## Host requirements

- Không cần React, CSS framework hoặc package manager trên host website.
- Host phải cho phép tải script URL qua Content Security Policy nếu CSP được bật.
- Production cần HTTPS cho cả host, script và API để tránh mixed content.

## Troubleshooting

- Không thấy Widget: kiểm tra Network tab và URL `widget.js`.
- Panel báo thiếu Widget ID: kiểm tra đúng kebab-case `data-widget-id`.
- Demo báo Widget chưa tải: đợi cổng `4173` sẵn sàng rồi reload.
- Script chạy hai lần: chỉ một host được giữ lại; kiểm tra DOM bằng host ID ở trên.
