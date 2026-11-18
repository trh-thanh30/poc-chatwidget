# [POC-CHATWIDGET-011] - Full-stack Packaging, Hardening và Handoff

Status: blocked
Type: feature
Area: integration
Blocked by: POC-CHATWIDGET-005, POC-CHATWIDGET-007, POC-CHATWIDGET-009, POC-CHATWIDGET-010

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

- [ ] Fresh clone chạy theo README và full stack healthy mà không sửa source.
- [ ] Allowed demo chat hoàn chỉnh với Mock Channel; blocked demo bị backend từ chối.
- [ ] Client modification không bypass origin/session enforcement.
- [ ] API offline, expired session, rate limit và channel unavailable có UI phù hợp.
- [ ] Mobile, keyboard, screen reader và CSS isolation acceptance pass.
- [ ] Mock path không cần Zalo credential; Zalo opt-in không lộ secret.
- [ ] Lint, typecheck, tests, build và Compose config checks đều pass.

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
