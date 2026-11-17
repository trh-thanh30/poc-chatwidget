# Triage Labels

## Canonical state mapping

| Role của skill    | Giá trị trong repo | Ý nghĩa                               |
| ----------------- | ------------------ | ------------------------------------- |
| `needs-triage`    | `needs-triage`     | Chưa được maintainer đánh giá         |
| `needs-info`      | `needs-info`       | Chờ người báo bổ sung thông tin       |
| `ready-for-agent` | `ready`            | Đủ rõ để agent triển khai độc lập     |
| `ready-for-human` | `ready-for-human`  | Cần thao tác/quyết định của con người |
| `wontfix`         | `wontfix`          | Không triển khai                      |

## Supporting states

- `blocked` — chờ dependency hoặc external state.
- `completed` — acceptance criteria đã đạt và quality gate pass.

## Work types

- `bug`
- `feature`
- `refactor`
- `infra`
- `docs`
- `test`

Issue dùng một `Status` và một `Type`; không trộn trạng thái với loại công việc.
