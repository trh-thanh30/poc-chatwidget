# POC Chat Widget

Embeddable customer-support Chat Widget cho website bên ngoài. Consumer chỉ cần thêm một thẻ
`script`; Widget tự mount React UI trong Shadow DOM, giao tiếp với NestJS API và giữ CSS/JavaScript
boundary tách biệt với host page.

POC tập trung vào bốn năng lực chính:

- Nhúng Widget bằng một artifact `widget.js` ổn định.
- Chỉ cấp Chat Session cho Widget ID và origin được phép.
- Gửi/nhận tin nhắn qua một channel abstraction, với Mock Channel cho development.
- Giới hạn tần suất gửi theo Widget session và hỗ trợ Zalo Personal như adapter tùy chọn.

## Architecture

```text
Customer website
  └─ <script src=".../widget.js" data-widget-id="...">
       └─ Widget IIFE
            └─ Shadow Root
                 └─ React chat UI
                      └─ HTTP API
                           └─ NestJS
                                ├─ Widget/session/domain policies
                                ├─ PostgreSQL via Drizzle ORM
                                └─ ChatChannel
                                     ├─ Mock Channel
                                     └─ Zalo Personal Channel
```

Các runtime boundary:

- `apps/widget` là embed client. React và React DOM được bundle vào IIFE; host không cần React.
- `apps/demo` là website consumer độc lập và chỉ tải built `widget.js` qua HTTP.
- `apps/api` sở hữu HTTP API, security enforcement, persistence và channel adapters.
- `packages/*` chỉ chứa cấu hình hoặc contract framework-neutral; không import ngược từ app.
- Origin whitelist, Widget session và rate limit luôn được enforce ở backend.

Chi tiết: [Architecture overview](docs/architecture/overview.md),
[Frontend guide](docs/architecture/frontend-folder-structure.md) và
[Backend guide](docs/architecture/backend-folder-structure.md).

## Technology Stack

| Layer             | Technology                        | Purpose                                                   |
| ----------------- | --------------------------------- | --------------------------------------------------------- |
| Workspace         | pnpm 10, Turborepo                | Dependency management và task orchestration               |
| Widget UI         | React 19, React DOM 19            | Isolated UI tree trong Shadow Root                        |
| Frontend build    | Vite 7, TypeScript 5.9            | IIFE artifact và demo dev server                          |
| Frontend data     | Axios, TanStack Query             | HTTP transport, server state và polling                   |
| UI primitives     | shadcn/ui khi cần                 | Source primitives tối thiểu, style inject vào Shadow Root |
| Backend           | NestJS 11, Config, JWT, Throttler | REST API, validated config, session token và anti-spam    |
| Persistence       | PostgreSQL, Drizzle ORM/Kit       | Typed schema, query và SQL migrations                     |
| Queue-ready infra | Redis 7                           | Local AOF service; BullMQ chỉ thêm khi có consumer        |
| Testing           | Vitest 4, jsdom, Supertest        | Unit, component và HTTP integration tests                 |
| Quality           | ESLint 9, Prettier 3              | Static analysis và formatting                             |

Axios và TanStack Query đã nằm trong Widget dependency baseline. shadcn/ui chỉ được thêm theo từng
primitive thực sự sử dụng để giữ bundle nhỏ và không phá Shadow DOM styling. Không đặt app runtime
dependency ở workspace root.

## Repository Structure

```text
.
├── apps/
│   ├── api/                    # NestJS API, persistence, policies, channels
│   ├── demo/                   # External host simulation and CSS collision checks
│   └── widget/                 # React IIFE, Shadow DOM bootstrap and chat UI
├── packages/
│   └── typescript-config/      # Shared strict TypeScript configurations
├── docs/
│   ├── adr/                    # Accepted architecture decisions
│   ├── agents/                 # Agent workflow, config and vendored skills
│   ├── architecture/           # Frontend/backend/runtime boundaries
│   ├── conventions/            # Module and coding conventions
│   ├── integrations/           # Embed and consumer-facing guides
│   ├── issues/                 # Local implementation backlog
│   ├── prd/                    # Product requirements
│   └── testing/                # Acceptance and smoke-test guidance
├── AGENTS.md                   # Repository workflow for coding agents
├── CONTEXT.md                  # Domain language and durable principles
├── SECURITY.md                 # Security and secret-handling policy
├── pnpm-workspace.yaml
└── turbo.json
```

### Application ownership

#### `apps/widget`

- Đọc `data-widget-id` và `data-api-url` từ embed script.
- Tạo một host element duy nhất và mount React trong open Shadow Root.
- Sở hữu session/chat UI state, frontend API client và error presentation.
- Không inject CSS vào `document.head` hoặc dùng global state của host page.

Build output:

```text
apps/widget/dist/widget.js
```

#### `apps/api`

- Cung cấp versioned REST API dưới `/api/v1`.
- Xác thực Widget ID, exact origin và JWT Widget session.
- Sở hữu Drizzle schema/migrations và PostgreSQL connection.
- Giữ Mock/Zalo implementations sau `ChatChannel` interface.
- Không trả credential, stack trace hoặc raw integration error cho Widget.

#### `apps/demo`

- Mô phỏng website của khách hàng với CSS global cố tình xung đột.
- Tải Widget artifact qua script giống integration thực tế.
- Không import component hoặc source từ `apps/widget`.

## Prerequisites

- Node.js `>=22 <23`
- pnpm `10.x`
- Docker Engine/Desktop với Compose plugin cho local PostgreSQL
- Python 3 nếu dùng UI/UX Pro Max search tools trong `docs/agents/skills/`

## Install

```bash
pnpm install
```

Workspace dùng `minimumReleaseAge` trong `pnpm-workspace.yaml`; package mới có thể chưa được phép
cài ngay sau khi vừa publish.

## Development

Prepare local PostgreSQL first:

```bash
cp .env.example .env
pnpm infra:dev:up
```

See [Local Infrastructure](docs/integrations/local-infrastructure.md) for environment overrides,
Drizzle commands, persistence behavior and the explicit destructive-reset procedure.

Chạy toàn bộ workspace:

```bash
pnpm dev
```

Development endpoints:

| Service      | URL                                   |
| ------------ | ------------------------------------- |
| Demo host    | <http://localhost:5173>               |
| Widget asset | <http://localhost:4173/widget.js>     |
| API health   | <http://localhost:3000/api/v1/health> |

Widget dev command build artifact trước, sau đó chạy Vite build watch và preview server. Nếu demo
được mở trước khi cổng `4173` sẵn sàng, reload host page sau khi Widget server khởi động.

Chạy riêng từng app:

```bash
pnpm --filter @chat-widget/widget dev
pnpm --filter @chat-widget/demo dev
pnpm --filter @chat-widget/api dev
```

## Embed Contract

```html
<script
  src="http://localhost:4173/widget.js"
  data-widget-id="demo-widget"
  data-api-url="http://localhost:3000/api/v1"
  defer
></script>
```

| Attribute        | Required    | Description                                              |
| ---------------- | ----------- | -------------------------------------------------------- |
| `src`            | yes         | URL của built IIFE artifact                              |
| `data-widget-id` | yes         | Public Widget identifier; không phải API key hoặc secret |
| `data-api-url`   | yes         | Base URL của Widget API                                  |
| `defer`          | recommended | Chạy sau khi document parse mà không block rendering     |

Script chỉ tạo một `#poc-chatwidget-root`, kể cả khi được load nhiều lần. React tree và stylesheet
nằm trong Shadow Root nên host CSS không đi vào Widget và Widget CSS không thoát ra host page.

Xem [Embed Widget Integration](docs/integrations/embed-widget.md) để biết host requirements và
troubleshooting.

## Workspace Commands

```bash
pnpm lint          # ESLint toàn bộ application source
pnpm check-types   # TypeScript check cho từng workspace package
pnpm test          # Vitest unit/component/integration suite
pnpm build         # Build API, demo và widget artifact
pnpm format        # Format authored source và documentation
```

Quality gate trước khi bàn giao thay đổi:

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
```

## Documentation Map

| Document                                                             | Purpose                                                              |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [Project context](CONTEXT.md)                                        | Domain language, current architecture principles và scope guardrails |
| [Product requirements](docs/prd/POC-CHATWIDGET-001.md)               | Business goal, deliverables và acceptance criteria                   |
| [Local issues](docs/issues/README.md)                                | Backend/frontend capability pairs và dependency graph                |
| [Architecture decisions](docs/adr/README.md)                         | Accepted technical decisions và consequences                         |
| [Frontend structure](docs/architecture/frontend-folder-structure.md) | Widget, React, Shadow DOM và frontend data rules                     |
| [Backend structure](docs/architecture/backend-folder-structure.md)   | NestJS, Drizzle, security và channel boundaries                      |
| [Acceptance testing](docs/testing/acceptance.md)                     | Automated gates và manual smoke checks                               |
| [Local infrastructure](docs/integrations/local-infrastructure.md)    | PostgreSQL Compose, environment và Drizzle commands                  |
| [Agent workflow](AGENTS.md)                                          | Required workflow cho coding agents                                  |
| [Security policy](SECURITY.md)                                       | Credential, session và vulnerability handling                        |

## Scope Boundaries

Không thuộc POC: admin dashboard, theme customization nâng cao, upload file/image/voice, CAPTCHA
nâng cao, operator handoff, multi-channel routing, analytics, long-term history, production SLA và
high availability.
