# Agent Workflow

Repo này dùng workflow agent nằm ngay trong source để Codex, Claude Code, Cursor và các
assistant khác cùng đọc một nguồn hướng dẫn.

## Trước khi thay đổi code

1. Đọc `CONTEXT.md` để dùng đúng thuật ngữ Chat Widget.
2. Đọc ADR liên quan trong `docs/adr/`.
3. Đọc tài liệu kiến trúc gần nhất trong `docs/architecture/`.
4. Kiểm tra issue trong `docs/issues/` và acceptance criteria của task.
5. Không triển khai yêu cầu thuộc task sau nếu issue hiện tại không cho phép.

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

## Quality gate

Trước khi hoàn thành thay đổi code, chạy:

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
```

Nếu thay đổi embed runtime, kiểm tra thêm trang demo và xác nhận script chỉ mount một instance.
