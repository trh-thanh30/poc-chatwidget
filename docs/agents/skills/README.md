# Agent Skill Library

Repo vendor bộ skills tại `mattpocock/` để agent có thể đọc trực tiếp từ source.

## Skills chính

| Skill                           | Đường dẫn                                           |
| ------------------------------- | --------------------------------------------------- |
| `grill-with-docs`               | `mattpocock/grill-with-docs/SKILL.md`               |
| `to-prd`                        | `mattpocock/to-prd/SKILL.md`                        |
| `to-issues`                     | `mattpocock/to-issues/SKILL.md`                     |
| `tdd`                           | `mattpocock/tdd/SKILL.md`                           |
| `diagnose`                      | `mattpocock/diagnose/SKILL.md`                      |
| `review`                        | `mattpocock/review/SKILL.md`                        |
| `improve-codebase-architecture` | `mattpocock/improve-codebase-architecture/SKILL.md` |
| `triage`                        | `mattpocock/triage/SKILL.md`                        |
| `handoff`                       | `mattpocock/handoff/SKILL.md`                       |

Các file trong `mattpocock/` được vendor nguyên bộ để giữ các template/reference tương đối.
Khi cập nhật từ upstream hoặc repo base, kiểm tra diff và license trước khi commit.

## UI/UX Pro Max

Bộ design intelligence được vendor đầy đủ tại `ui-ux-pro-max/`, gồm design data, search
scripts, Claude-style skills và platform bundles.

| Mục đích       | Đường dẫn                                                           |
| -------------- | ------------------------------------------------------------------- |
| Hướng dẫn tổng | `ui-ux-pro-max/README.md`                                           |
| Codex skill    | `ui-ux-pro-max/platform-skills/codex/skills/ui-ux-pro-max/SKILL.md` |
| UI styling     | `ui-ux-pro-max/claude-skills/ui-styling/SKILL.md`                   |
| Design system  | `ui-ux-pro-max/claude-skills/design-system/SKILL.md`                |
| Search engine  | `ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py`                 |

Search gợi ý cho Chat Widget:

```bash
python3 docs/agents/skills/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py \
  "embedded customer support chat widget" --domain ux -n 5

python3 docs/agents/skills/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py \
  "compact responsive chat panel" --stack react -n 5
```

Giữ nguyên `LICENSE`, `skill.json` và upstream README khi cập nhật bộ skill.
