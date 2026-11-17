# POC Chat Widget

Monorepo cho `POC-CHATWIDGET-002`: một Chat Widget React có thể nhúng vào website bên
ngoài bằng một thẻ script và được cô lập bằng Shadow DOM.

## Thành phần

- `apps/widget`: React + Vite library build, xuất `dist/widget.js`.
- `apps/demo`: website Vite giả lập host có CSS xung đột.
- `apps/api`: NestJS skeleton với health endpoint.
- `packages/typescript-config`: cấu hình TypeScript dùng chung.

## Tài liệu dự án

- [Agent workflow](AGENTS.md)
- [Project context và glossary](CONTEXT.md)
- [PRD chính](docs/prd/POC-CHATWIDGET-001.md)
- [Local implementation issues](docs/issues/README.md)
- [Architecture overview](docs/architecture/overview.md)
- [Frontend structure và conventions](docs/architecture/frontend-folder-structure.md)
- [Backend structure và conventions](docs/architecture/backend-folder-structure.md)
- [Architecture decisions](docs/adr/README.md)
- [Agent skill library](docs/agents/skills/README.md)
- [Embed integration](docs/integrations/embed-widget.md)
- [Acceptance testing](docs/testing/acceptance.md)
- [Security policy](SECURITY.md)

Turborepo điều phối các dev server dài hạn. Các quality command dùng pnpm recursive để vẫn
hoạt động trong source bundle chưa được `git init` hoặc môi trường không cung cấp Git metadata.

## Yêu cầu

- Node.js 22
- pnpm 10

## Cài đặt và chạy

```bash
pnpm install
pnpm dev
```

Các địa chỉ development:

- Demo host: <http://localhost:5173>
- Widget asset: <http://localhost:4173/widget.js>
- API health: <http://localhost:3000/api/v1/health>

Widget development task build trước một lần, sau đó chạy Vite build watch và preview server.
Nếu mở demo trước khi cổng `4173` sẵn sàng, reload trang một lần.

## Script nhúng

```html
<script
  src="http://localhost:4173/widget.js"
  data-widget-id="demo-widget"
  data-api-url="http://localhost:3000/api/v1"
  defer
></script>
```

Script chỉ mount một instance có id `poc-chatwidget-root`, kể cả khi được thêm nhiều lần.
React UI và stylesheet nằm trong Shadow Root nên CSS của website host không đi vào Widget và
CSS của Widget không thoát ra website host.

## Quality commands

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
```

## Phạm vi hiện tại

Task này chỉ cung cấp monorepo, API skeleton, launcher/panel responsive, embed script và CSS
isolation. Chat API, domain whitelist, rate limiting và Zalo Personal thuộc các task tiếp theo.
