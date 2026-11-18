# [POC-CHATWIDGET-003] - Local Infrastructure và Dependency Baseline

Status: blocked
Type: infra
Area: tooling
Blocked by: POC-CHATWIDGET-002

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Goal

Cung cấp PostgreSQL/Redis development environment chạy bằng Docker Compose và cài sẵn dependency
baseline đã chốt để các task backend/frontend sau tập trung vào business behavior thay vì tự xây
lại infrastructure phổ biến.

## Reference Sources

- Reuse Compose conventions từ `booking-system-base` và `warranty-management-base` trong
  `Documents`: PostgreSQL 16 Alpine, Redis 7 Alpine, named volumes, healthchecks, env override và
  root scripts.
- Reuse package conventions nhưng không copy Prisma, MinIO hoặc service ngoài scope.

## Technical Scope

- Tạo development Compose cho PostgreSQL và Redis, pin `postgres:16-alpine`/`redis:7-alpine`.
- Dùng named volumes, configurable host ports và service healthchecks.
- Bật Redis AOF/password để sẵn sàng cho future BullMQ, nhưng chưa thêm queue/worker packages.
- Thêm `.env.example` với development placeholders và `DATABASE_URL` chuẩn cho host process.
- Thêm root scripts cho `infra:dev:up/down/logs/ps/config`.
- Thêm Drizzle scripts/config wiring cho generate, migrate, seed và studio.
- Baseline backend dependencies: Drizzle/pg, Nest config/JWT/validation/throttler, Zod, Supertest.
- Baseline frontend dependencies: Axios và TanStack Query.
- Ghi rõ reset volume là destructive và không chạy tự động.

## Deliverables

- Development Docker Compose file cho PostgreSQL và Redis.
- Environment example và local-infrastructure documentation.
- Root/API package scripts và Drizzle config entrypoint.
- Updated package manifests và pnpm lockfile.

## Acceptance Criteria

- [ ] `pnpm infra:dev:up` khởi động PostgreSQL/Redis và cả hai service chuyển sang healthy.
- [ ] PostgreSQL/Redis sử dụng named volumes và giữ dữ liệu sau container restart.
- [x] Ports, database username/password và Redis password override được bằng environment.
- [ ] `DATABASE_URL` từ `.env.example` kết nối được từ API chạy trên host.
- [ ] `REDIS_URL` từ `.env.example` authenticate và ping được từ host.
- [x] `pnpm infra:dev:config` render Compose config hợp lệ.
- [x] Có lệnh logs, status và shutdown không xóa volume.
- [x] Reset volume chỉ được document như thao tác explicit/destructive.
- [x] Package versions tương thích NestJS 11, React 19 và Node.js 22.
- [x] Không chứa secret thật hoặc production credential.

## Out of Scope

Database schema/migration nghiệp vụ, BullMQ queue/worker, MinIO, API container, Widget container,
reverse proxy, TLS và production deployment.

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

## Notes

Ngày 2026-11-18, Compose config, environment overrides, scripts, Drizzle config loading, frozen
install và quality gate đều pass. Runtime health, PostgreSQL/Redis connections và volume
persistence chưa thể xác nhận vì Docker CLI có sẵn nhưng cả system daemon và Docker Desktop daemon
đều không chạy trong môi trường kiểm thử. Tiếp tục các AC runtime còn lại sau khi Docker daemon
được bật.
