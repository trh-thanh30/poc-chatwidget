# [POC-CHATWIDGET-007] - Hardening, packaging và tài liệu bàn giao

Status: blocked
Type: feature
Blocked by: POC-CHATWIDGET-003, POC-CHATWIDGET-004, POC-CHATWIDGET-005, POC-CHATWIDGET-006

## Parent

[`POC-CHATWIDGET-001`](../prd/POC-CHATWIDGET-001.md)

## Technical Scope

- Chuẩn hóa network/session/channel errors và retry behavior.
- Hoàn thiện desktop/mobile states, Error Boundary và offline UX.
- Tạo production packaging, Docker Compose và allowed/blocked demo hosts.
- Hoàn thiện integration, setup, troubleshooting và smoke-test docs.

## Acceptance Criteria

- [ ] Fresh clone chạy được theo README.
- [ ] Allowed/blocked origin demo đúng backend behavior.
- [ ] Mock demo chạy đầy đủ không cần Zalo.
- [ ] API offline/session expired/rate limited có UI phù hợp.
- [ ] Mobile và CSS isolation acceptance pass.
- [ ] Không chứa secret; lint/typecheck/test/build pass.

## Out of Scope

Cloud deployment, full CI/CD, admin dashboard, analytics, centralized monitoring và HA.

## Verification

Automated quality gate và full manual smoke checklist trong `docs/testing/acceptance.md`.
