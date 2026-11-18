# [POC-CHATWIDGET-012] - Backend Module Conventions và Common Infrastructure

Status: completed
Type: refactor
Area: backend
Blocked by: POC-CHATWIDGET-004

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Goal

Chuẩn hóa module backend theo controller → use case → repository, tách capability hỗ trợ khỏi
business flow và adapt common HTTP infrastructure từ các base project mà không kéo dependency
Prisma, Sentry, tenant hoặc user auth ngoài scope.

## Technical Scope

- Tách create/verify Widget session thành hai use case.
- Service chỉ sở hữu capability dùng lại: origin normalization và JWT mechanics.
- Chuẩn hóa `dto/`, `repository/`, `use-cases/`, `services/`, `types/` và `tests/`.
- Mọi backend `*.test.ts`/`*.spec.ts` nằm trong folder `tests/`.
- Adapt stable error classes/filter, request ID và privacy-safe HTTP logging.
- Chuyển health endpoint thành business-neutral Health module.
- Cập nhật agent/module/backend architecture rules.

## Acceptance Criteria

- [x] Controller/guard chỉ xử lý transport và gọi use case tương ứng.
- [x] Business decision của Widget session nằm trong create/verify use case.
- [x] Origin/JWT services không query database hoặc sở hữu toàn business flow.
- [x] Repository interface và Drizzle adapter nằm trong `repository/`.
- [x] Không còn backend test/spec nằm ngoài folder `tests/`.
- [x] Common module không phụ thuộc Prisma, Sentry, Winston, tenant hoặc user auth.
- [x] HTTP logger không ghi request body, message content, JWT hoặc credential.
- [x] Public session/health contract và database schema không thay đổi.
- [x] Full quality gate và PostgreSQL smoke test pass.

## Out of Scope

Redis throttler implementation, Message API, frontend session bootstrap, response envelope mới,
Winston/file rotation và Sentry integration.

## Verification

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
```

## Notes

Ngày 2026-11-18, full quality gate pass với 28 tests. Smoke test bằng API build thật xác nhận
health, request ID 36 ký tự và create/verify Widget session qua PostgreSQL đều hoạt động; HTTP log
chỉ chứa method, path, status, duration và request ID.
