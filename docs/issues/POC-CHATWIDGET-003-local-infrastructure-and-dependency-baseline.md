# [POC-CHATWIDGET-003] - Local Infrastructure và Dependency Baseline

Status: ready
Type: infra
Area: tooling
Blocked by: POC-CHATWIDGET-002

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Goal

Cung cấp PostgreSQL development environment chạy bằng Docker Compose và cài sẵn dependency
baseline đã chốt để các task backend/frontend sau tập trung vào business behavior thay vì tự xây
lại infrastructure phổ biến.

## Reference Sources

- Reuse Compose conventions từ `booking-system-base` và `warranty-management-base` trong
  `Documents`: PostgreSQL 16 Alpine, named volume, `pg_isready`, env override và root scripts.
- Reuse package conventions nhưng không copy Prisma, Redis, MinIO hoặc service ngoài scope.

## Technical Scope

- Tạo development Compose chỉ cho PostgreSQL, pin `postgres:16-alpine`.
- Dùng named volume, configurable host port và healthcheck `pg_isready`.
- Thêm `.env.example` với development placeholders và `DATABASE_URL` chuẩn cho host process.
- Thêm root scripts cho `infra:dev:up/down/logs/ps/config`.
- Thêm Drizzle scripts/config wiring cho generate, migrate, seed và studio.
- Baseline backend dependencies: Drizzle/pg, Nest config/JWT/validation/throttler, Zod, Supertest.
- Baseline frontend dependencies: Axios và TanStack Query.
- Ghi rõ reset volume là destructive và không chạy tự động.

## Deliverables

- Development Docker Compose file.
- Environment example và local-infrastructure documentation.
- Root/API package scripts và Drizzle config entrypoint.
- Updated package manifests và pnpm lockfile.

## Acceptance Criteria

- [ ] `pnpm infra:dev:up` khởi động PostgreSQL và service chuyển sang healthy.
- [ ] PostgreSQL sử dụng named volume và giữ dữ liệu sau container restart.
- [ ] Port, database, username và password development override được bằng environment.
- [ ] `DATABASE_URL` từ `.env.example` kết nối được từ API chạy trên host.
- [ ] `pnpm infra:dev:config` render Compose config hợp lệ.
- [ ] Có lệnh logs, status và shutdown không xóa volume.
- [ ] Reset volume chỉ được document như thao tác explicit/destructive.
- [ ] Package versions tương thích NestJS 11, React 19 và Node.js 22.
- [ ] Không chứa secret thật hoặc production credential.

## Out of Scope

Database schema/migration nghiệp vụ, Redis, MinIO, API container, Widget container, reverse proxy,
TLS và production deployment.

## Verification

```bash
pnpm install --frozen-lockfile
pnpm infra:dev:config
pnpm infra:dev:up
pnpm infra:dev:ps
pnpm lint
pnpm check-types
pnpm test
pnpm build
```
