# Local Issues

Backlog được chia theo **capability pair**: backend và frontend là hai issue độc lập, có thể giao
cho owner khác nhau; khi cả hai hoàn thành thì capability end-to-end mới hoàn chỉnh.

## Delivery Map

| Capability          | Backend | Frontend           | Kết quả end-to-end                           |
| ------------------- | ------- | ------------------ | -------------------------------------------- |
| Embed foundation    | `002`   | `002`              | Script nhúng + isolated launcher/panel       |
| Session & whitelist | `003`   | `004`              | Allowed host nhận Widget session             |
| Mock chat           | `005`   | `006`              | Visitor gửi và nhận Mock reply               |
| Anti-spam           | `007`   | `008`              | Backend limit + cooldown UX                  |
| Zalo Personal       | `009`   | Không cần UI riêng | Cùng message contract, đổi channel adapter   |
| Handoff             | `010`   | `010`              | Full integration, packaging và documentation |

```text
002 -> 003
003 -> 004, 005
004 + 005 -> 006
005 -> 007, 009
006 + 007 -> 008
004 + 006 + 008 + 009 -> 010
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
