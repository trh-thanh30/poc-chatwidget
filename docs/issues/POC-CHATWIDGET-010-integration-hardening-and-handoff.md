# [POC-CHATWIDGET-010] - Integration, Hardening và Handoff

Status: blocked
Type: feature
Area: integration
Blocked by: POC-CHATWIDGET-004, POC-CHATWIDGET-006, POC-CHATWIDGET-008, POC-CHATWIDGET-009

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Goal

Đóng gói một POC chạy lại được từ fresh clone, có allowed/blocked host demos, error behavior nhất
quán và tài liệu bàn giao đủ để doanh nghiệp thử nhúng Widget.

## Input

- Session, message, rate-limit và channel capabilities đã hoàn thành.
- Built Widget artifact và demo host.
- Mock Channel là default path; Zalo là opt-in integration.

## Technical Scope

- Chuẩn hóa network/session/channel error và retry behavior end-to-end.
- Thêm Error Boundary, offline UX và session-expired recovery.
- Hoàn thiện desktop/mobile, keyboard, focus và reduced-motion behavior.
- Cung cấp PostgreSQL/API/Widget/demo local packaging bằng Docker Compose hoặc tương đương.
- Tạo allowed và blocked origin demo hosts chứng minh backend enforcement.
- Hoàn thiện integration, setup, troubleshooting, security và smoke-test docs.
- Review bundle size, secret scanning và dependency boundaries.

## Deliverables

- Reproducible local environment và production-style Widget build.
- Allowed/blocked demos và full acceptance suite.
- Updated README, embed guide, operational notes và handoff checklist.

## Acceptance Criteria

- [ ] Fresh clone chạy được theo README mà không cần sửa source.
- [ ] Allowed origin demo chat hoàn chỉnh với Mock Channel.
- [ ] Blocked origin demo bị backend từ chối dù client code bị sửa.
- [ ] API offline, session expired, rate limited và channel unavailable có UI phù hợp.
- [ ] Mobile, keyboard, screen reader và CSS isolation acceptance pass.
- [ ] Mock demo chạy không cần Zalo credential.
- [ ] Zalo opt-in path có manual instructions và không lộ secret.
- [ ] Lint, typecheck, tests và build đều pass.

## Out of Scope

Cloud deployment, full CI/CD, admin dashboard, analytics, centralized monitoring, production SLA
và high availability.

## Verification

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
```

Chạy full manual smoke checklist trong [`docs/testing/acceptance.md`](../testing/acceptance.md).
