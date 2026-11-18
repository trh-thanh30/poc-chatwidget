# [POC-CHATWIDGET-004] - Backend Chat Session và Domain Whitelist

Status: completed
Type: feature
Area: backend
Blocked by: POC-CHATWIDGET-003

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Goal

Chỉ cấp Widget session khi Widget ID tồn tại, đang bật và request đến từ exact allowed origin;
dùng NestJS JWT thay vì tự xây token format.

## Input

- Widget ID từ validated DTO và HTTP `Origin` header.
- PostgreSQL từ local infrastructure.
- `DATABASE_URL`, `WIDGET_SESSION_JWT_SECRET` và TTL từ validated config.
- Development Widget `demo-widget` với `http://localhost:5173`.

## Package/Reuse Strategy

- `@nestjs/config` + Zod để load/validate environment và fail fast.
- `@nestjs/jwt` cho HS256 signing/verification; không tự viết HMAC/JWT codec.
- `class-validator` + `class-transformer` và global `ValidationPipe` cho DTO.
- Drizzle ORM/Kit + `pg` cho schema, migration, repository.
- Supertest + Nest testing cho HTTP integration tests.

## Technical Scope

- Drizzle schema/migration cho Widget, allowed origin và Widget session.
- Idempotent development seed cho `demo-widget`.
- Normalize HTTP(S) origin theo scheme, hostname, default/explicit port; exact-match whitelist.
- `POST /api/v1/widget-sessions` tạo DB session và JWT có expiry.
- JWT claims: `sub` session ID, `wid` Widget ID, `origin`, `jti`, `iss`, `aud`, `iat`, `exp`.
- Reusable Widget Session Guard đọc Bearer token, verify JWT và re-check DB session/widget/origin.
- Stable error envelope; `401` cho token invalid/expired, `403` cho disabled/disallowed/mismatch.
- CORS hỗ trợ browser transport nhưng không thay backend authorization.

## Deliverables

- Config module, DTO validation và exception mapping.
- Drizzle schema, migration, seed và repositories.
- Session endpoint, JWT service và reusable guard/context.
- Unit tests, HTTP integration tests và database migration verification.
- Updated API/environment documentation.

## Acceptance Criteria

- [x] Allowed origin tạo session và nhận JWT + expiry.
- [x] Unknown Widget trả `404`; disabled Widget hoặc disallowed origin trả `403`.
- [x] JWT signature, issuer, audience và expiry đều được verify.
- [x] Token bị sửa hoặc hết hạn trả `401` mà không lộ verification detail.
- [x] Token origin A không dùng được từ origin B, kể cả B cũng được whitelist.
- [x] Widget bị disable, session bị revoke/expired hoặc origin bị xóa thì JWT cũ không còn hợp lệ.
- [x] Scheme, hostname casing và default/explicit port được normalize/test.
- [x] Client sửa body/header/token không bypass backend enforcement.
- [x] Migration và seed chạy được trên PostgreSQL sạch; seed chạy lại không tạo duplicate.

## Out of Scope

Widget UI, wildcard domain, dashboard, DNS verification, messages, rate limiting và Zalo.

## Verification

```bash
pnpm infra:dev:up
pnpm db:migrate
pnpm db:seed
pnpm --filter @chat-widget/api check-types
pnpm test
pnpm --filter @chat-widget/api build
```

## Notes

Ngày 2026-11-18, migration đã apply trên PostgreSQL local; seed chạy hai lần vẫn chỉ có một record
allowed origin cho `demo-widget`. HTTP tests cover origin/JWT/session revocation boundaries và smoke
test bằng API build thật đã tạo rồi verify session qua PostgreSQL thành công.
