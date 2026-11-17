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
        +-- GET /api/v1/health
```

Widget chưa kết nối với API; `data-api-url` hiện mới là bootstrap configuration được đọc từ embed
script.

## Dependency rules

- Apps có thể import packages qua workspace dependency.
- Packages không import apps.
- Demo consumer chỉ tải artifact `widget.js`, không import component/source của Widget.
- API không phụ thuộc browser code.
- Widget không đọc hoặc ghi global state của host page ngoài host element của chính nó.

## Planned boundaries

Các boundary sau đã nằm trong PRD nhưng chưa được triển khai:

- Widget/session/domain modules trong API.
- PostgreSQL + Drizzle persistence.
- `ChatChannel` interface với Mock và Zalo Personal implementations.
- Session-scoped rate limiting.

Khi các phần này được triển khai, cập nhật tài liệu từ “planned” sang kiến trúc hiện hành trong
cùng pull request/change set.
