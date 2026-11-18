# Architecture Overview

Hướng dẫn triển khai chi tiết:

- [Frontend structure và conventions](frontend-folder-structure.md)
- [Backend structure và conventions](backend-folder-structure.md)

## Runtime hiện tại

```text
Host website (apps/demo)
        |
        | <script src=".../widget.js" data-widget-id="...">
        v
Widget IIFE (apps/widget)
        |
        +-- singleton host element
        +-- Shadow Root
        +-- React launcher + preview panel

NestJS API (apps/api)
        +-- Widget session + exact-origin whitelist
        +-- GET/POST /api/v1/messages + Mock Channel
        +-- 5 sends / 10 seconds per verified Widget session
```

Widget bootstrap session và gọi Message API qua `data-api-url`; demo host chỉ cung cấp embed script
và allowed origin để kiểm thử.

## Dependency rules

- Apps có thể import packages qua workspace dependency.
- Packages không import apps.
- Demo consumer chỉ tải artifact `widget.js`, không import component/source của Widget.
- API không phụ thuộc browser code.
- Widget không đọc hoặc ghi global state của host page ngoài host element của chính nó.

## Planned boundaries

Các boundary sau đã nằm trong PRD nhưng chưa được triển khai:

- Zalo Personal implementation cho `ChatChannel` (Mock Channel đang là adapter mặc định).

Khi các phần này được triển khai, cập nhật tài liệu từ “planned” sang kiến trúc hiện hành trong
cùng pull request/change set.
