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
        +-- React launcher + chat panel
        +-- server-driven rate-limit cooldown UX

NestJS API (apps/api)
        +-- Widget session + exact-origin whitelist
        +-- GET/POST /api/v1/messages
        +-- ChatChannel: Mock mặc định / Zalo Personal opt-in
        +-- 5 sends / 10 seconds per verified Widget session
```

Widget bootstrap session và gọi Message API qua `data-api-url`; demo host chỉ cung cấp embed script
và allowed origin để kiểm thử.

Full-stack handoff thêm one-shot migration/seed container, API image chạy non-root, Widget static
image và hai Demo static images. Allowed demo được seed theo exact origin; blocked demo dùng cùng
Widget ID nhưng origin khác để chứng minh backend enforcement.

## Dependency rules

- Apps có thể import packages qua workspace dependency.
- Packages không import apps.
- Demo consumer chỉ tải artifact `widget.js`, không import component/source của Widget.
- API không phụ thuộc browser code.
- Widget không đọc hoặc ghi global state của host page ngoài host element của chính nó.

## Live-validation boundary

Zalo Personal adapter đã có config, lifecycle, quoted-reply mapping và opt-in test harness. Việc xác
nhận account/thread thật vẫn cần dedicated POC account và thao tác reply của con người; automated
quality gate tiếp tục dùng Mock Channel.
