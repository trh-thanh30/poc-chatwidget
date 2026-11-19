# [POC-CHATWIDGET-011] - Full-stack Packaging, Hardening và Handoff

Status: ready-for-human
Type: feature
Area: integration
Blocked by: POC-CHATWIDGET-010 (live Zalo validation only)

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Goal

Đóng gói POC chạy lại được từ fresh clone với full-stack Compose, allowed/blocked demos, error UX
nhất quán và handoff documentation.

## Reference/Reuse Strategy

- Adapt multi-stage Dockerfile, healthcheck và service dependency patterns từ booking/warranty
  bases; chỉ giữ PostgreSQL, API, Widget asset và demo services cần cho POC.
- Mock Channel là default runnable path; Zalo là opt-in profile/config.

## Technical Scope

- Production-style Dockerfiles và full-stack Compose cho PostgreSQL, API, Widget/static asset,
  allowed demo host và blocked demo host.
- Healthchecks, `depends_on` conditions, environment boundaries và persistent DB volume.
- Error Boundary, offline/session-expired/channel-unavailable UX và desktop/mobile hardening.
- Integration/setup/troubleshooting/security docs, bundle review và secret/dependency audit.

## Acceptance Criteria

- [x] Fresh clone chạy theo README và full stack healthy mà không sửa source.
- [x] Allowed demo chat hoàn chỉnh với Mock Channel; blocked demo bị backend từ chối.
- [x] Client modification không bypass origin/session enforcement.
- [x] API offline, expired session, rate limit và channel unavailable có UI phù hợp.
- [ ] Mobile, keyboard, screen reader và CSS isolation acceptance pass.
- [x] Mock path không cần Zalo credential; Zalo opt-in không lộ secret.
- [x] Lint, typecheck, tests, build và Compose config checks đều pass.

## Out of Scope

Cloud deployment, full CI/CD, admin dashboard, analytics, centralized monitoring, production SLA
và high availability.

## Verification

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
pnpm infra:dev:config
docker compose -f docker-compose.full.yml config
```

## Notes

Ngày 2026-11-18, full Compose images đã build và chạy healthy trên alternate smoke ports để không
xung đột development services. One-shot `init` exit `0`; API runner chạy non-root UID 1001.
Automated `full:smoke` xác nhận allowed bootstrap `201`, Mock send/list `201/200` có visitor và
operator reply, blocked bootstrap `403`, hai demo đúng mode và Widget asset `200` với JavaScript
content type/CORS. Production dependency audit không phát hiện known vulnerability.

Frontend hardening thêm Error Boundary, unauthorized session re-bootstrap callback và channel
unavailable feedback giữ draft. Quality gate pass với 78 tests; hai opt-in integration suites vẫn
skip mặc định. Status giữ `ready-for-human` cho manual mobile/keyboard/screen-reader/browser CSS
isolation và live Zalo account/thread validation từ task `010`; chưa đủ điều kiện `completed`.
