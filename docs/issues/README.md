# Local Issues

Backlog được chia theo **capability pair**: backend và frontend là hai issue độc lập, có thể giao
cho owner khác nhau; khi cả hai hoàn thành thì capability end-to-end mới hoàn chỉnh.

## Delivery Map

| Capability          | Infrastructure/BE | Frontend           | Kết quả end-to-end                           |
| ------------------- | ----------------- | ------------------ | -------------------------------------------- |
| Foundation          | `002`, `003`      | `002`              | Isolated embed + local PostgreSQL/tooling    |
| Session & whitelist | `004`             | `005`              | Allowed host nhận JWT Widget session         |
| Mock chat           | `006`             | `007`              | Visitor gửi và nhận Mock reply               |
| Anti-spam           | `008`             | `009`              | Backend limit + cooldown UX                  |
| Zalo Personal       | `010`             | Không cần UI riêng | Cùng message contract, đổi channel adapter   |
| Handoff             | `011`             | `011`              | Full integration, packaging và documentation |

```text
002 -> 003 -> 004
004 -> 005, 006
005 + 006 -> 007
006 -> 008, 010
007 + 008 -> 009
005 + 007 + 009 + 010 -> 011
```

Tên file:

```text
POC-CHATWIDGET-NNN-short-slug.md
```

Template:

```md
# [POC-CHATWIDGET-NNN] - Title

Status: needs-triage | needs-info | ready | ready-for-human | blocked | completed | wontfix
Type: feature | bug | refactor | infra | docs | test
Area: backend | frontend | integration | tooling | docs
Blocked by: None | POC-CHATWIDGET-NNN

## Parent

## Technical Scope

## Goal

## Input

## Deliverables

## Acceptance Criteria

- [ ] Verifiable behavior

## Out of Scope

## Verification

## Notes
```

Issue hoàn thành chỉ được chuyển sang `completed` khi acceptance criteria thực tế đạt và các
quality command liên quan pass.

Frontend issue phải ghi rõ API contract đầu vào và UI states. Backend issue phải ghi rõ security
boundary, persistence/transport contract và error behavior. Không đưa implementation FE vào BE
issue hoặc ngược lại chỉ để tránh tạo issue mới.
