# Agent Workflow

Repo này dùng workflow agent nằm ngay trong source để Codex, Claude Code, Cursor và các
assistant khác cùng đọc một nguồn hướng dẫn.

## Trước khi thay đổi code

1. Đọc `CONTEXT.md` để dùng đúng thuật ngữ Chat Widget.
2. Đọc ADR liên quan trong `docs/adr/`.
3. Đọc tài liệu kiến trúc gần nhất trong `docs/architecture/`.
4. Kiểm tra issue trong `docs/issues/` và acceptance criteria của task.
5. Không triển khai yêu cầu thuộc task sau nếu issue hiện tại không cho phép.

## Reuse trước khi tự xây

- Với Docker Compose, Nest config/JWT/validation và monorepo scripts, rà các base project đang dùng
  trong `Documents` (`booking-system-base`, `warranty-management-base`) trước khi viết mới.
- Adapt pattern theo stack hiện tại; không copy Prisma/Redis/MinIO hoặc module ngoài scope vào repo
  dùng Drizzle/PostgreSQL này.
- Ưu tiên package maintained đã được chốt trong app manifest trước custom implementation, ví dụ
  `@nestjs/jwt`, `@nestjs/config`, `class-validator`, Axios và TanStack Query.
- Khi thêm package, kiểm tra Nest/React/Node peer compatibility, lockfile và license; dependency chỉ
  thuộc app sử dụng nó, không đặt ở root để dựa vào hoisting.

## Agent skills

### Issue tracker

Issue được lưu dưới dạng Markdown trong `docs/issues/`. Xem
`docs/agents/issue-tracker.md` và `docs/agents/config/issue-tracker.md`.

### Triage labels

Repo dùng trạng thái triage kết hợp với nhãn loại công việc. Xem
`docs/agents/triage-labels.md` và `docs/agents/config/triage-labels.md`.

### Domain docs

Repo dùng single-context: `CONTEXT.md` ở root và ADR trong `docs/adr/`. Xem
`docs/agents/domain.md`.

## Skill library

- Bộ skills được vendor tại `docs/agents/skills/mattpocock/`.
- UI task phải đọc `docs/agents/skills/ui-ux-pro-max/README.md` và bản Codex tại
  `docs/agents/skills/ui-ux-pro-max/platform-skills/codex/skills/ui-ux-pro-max/SKILL.md`.
- Workflow đã điều chỉnh cho repo nằm tại `docs/agents/workflows/`.
- Khi người dùng gọi tên skill, đọc `SKILL.md` tương ứng trước khi hành động.
- Với bug khó, dùng `diagnose`; với logic rủi ro, dùng `tdd`; với phân rã task, dùng
  `to-issues`; với thay đổi kiến trúc, dùng `improve-codebase-architecture`.

## Boundaries

- `apps/widget` là embed client, build thành IIFE và chạy trong Shadow DOM.
- `apps/demo` chỉ là host thử nghiệm, không chứa logic của Widget.
- `apps/api` sở hữu HTTP API và sau này sẽ sở hữu persistence/channel adapters.
- `packages/*` không được import ngược từ `apps/*`.
- Không đưa secret, Zalo credential hoặc session token thật vào source hay docs.
- Không làm mất CSS isolation bằng cách inject stylesheet của Widget vào `document.head`.

## Frontend và backend guides

- Đọc `docs/architecture/frontend-folder-structure.md` trước khi thay đổi `apps/widget` hoặc
  `apps/demo`.
- Đọc `docs/architecture/backend-folder-structure.md` trước khi thêm module vào `apps/api`.

## Backend module rules

- Business flow nằm trong `use-cases/`; controller/guard chỉ nhận transport context và gọi use case.
- Service chỉ giữ capability domain/kỹ thuật dùng lại bởi nhiều use case; không dùng service như nơi
  gom mọi business logic.
- Module có behavior/persistence tạo `dto/`, `repository/`, `use-cases/` và `tests/` ngay khi vai trò
  đó xuất hiện.
- Khi có từ hai file cùng trách nhiệm, chuyển toàn bộ vào folder số nhiều tương ứng như
  `controllers/`, `services/`, `guards/`, `types/` hoặc `interceptors/`.
- Mọi backend `*.test.ts` và `*.spec.ts` phải nằm trong folder `tests/`; không đưa test vào production
  build.
- `<module>.module.ts` chính luôn nằm ở root module và không tạo folder rỗng.

## Quality gate

Trước khi hoàn thành thay đổi code, chạy:

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
```

Nếu thay đổi embed runtime, kiểm tra thêm trang demo và xác nhận script chỉ mount một instance.
