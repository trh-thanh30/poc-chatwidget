# Hướng dẫn Agent

Thư mục này cung cấp workflow và skill repo-native để các coding agent làm việc nhất quán.

## Nguồn cần đọc

1. `AGENTS.md` — quy tắc và quality gate.
2. `CONTEXT.md` — thuật ngữ, trạng thái hiện tại và scope guardrails.
3. `docs/adr/` — quyết định kiến trúc đã chấp nhận.
4. `docs/issues/` — task và acceptance criteria.
5. `docs/architecture/` — boundary hiện tại của runtime.

## Workflow mặc định

| Nhu cầu                  | Workflow                                        |
| ------------------------ | ----------------------------------------------- |
| Yêu cầu lớn hoặc chưa rõ | `workflows/01-grill-with-docs.md`               |
| Tạo PRD                  | `workflows/02-to-prd.md`                        |
| Chia vertical slices     | `workflows/03-to-issues.md`                     |
| Logic rủi ro/test-first  | `workflows/04-tdd.md`                           |
| Bug hoặc regression      | `workflows/05-diagnose.md`                      |
| Review kiến trúc         | `workflows/06-improve-codebase-architecture.md` |
| Phân loại task           | `workflows/07-triage.md`                        |
| Bàn giao giữa agent      | `workflows/08-handoff.md`                       |

Không phải task nào cũng cần đi đủ tám bước. Task nhỏ có thể triển khai trực tiếp sau khi đọc
đủ context và acceptance criteria.

## Skill library

Bộ Matt Pocock skills được vendor trong `skills/mattpocock/`. Đây là bản self-contained lấy từ
repo base đang dùng trong `Documents`, giúp agent không phụ thuộc global skill installation.

UI/UX Pro Max được vendor đầy đủ trong `skills/ui-ux-pro-max/`. Với UI task, đọc README của bộ
skill và bản platform phù hợp trước khi code. Codex dùng:

```text
skills/ui-ux-pro-max/platform-skills/codex/skills/ui-ux-pro-max/SKILL.md
```

## Cập nhật tài liệu

- Thuật ngữ hoặc rule bền vững: cập nhật `CONTEXT.md`.
- Quyết định boundary/dependency/deployment: tạo ADR.
- Yêu cầu sản phẩm: cập nhật PRD.
- Công việc triển khai: tạo hoặc cập nhật issue.
- Không ghi trạng thái tương lai như thể đã triển khai xong.
