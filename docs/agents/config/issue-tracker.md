# Issue Tracker

Issue tracker mặc định là local Markdown trong `docs/issues/`.

## Quy ước

- Mỗi issue là một file: `docs/issues/<TASK-ID>-<slug>.md`.
- Task ID dùng prefix `POC-CHATWIDGET-`.
- Mỗi issue có `Status`, `Type`, `Area`, `Blocked by` và acceptance criteria dạng checklist.
- PRD nguồn nằm trong `docs/prd/`; issue liên kết về PRD hoặc parent task.
- Trao đổi quan trọng có thể append dưới `## Notes` thay vì thay đổi lịch sử acceptance criteria.
- Backend và frontend được theo dõi bằng issue độc lập. Một capability pair phải liên kết dependency
  và contract đầu vào/đầu ra rõ ràng.

## Khi skill yêu cầu publish issue

Tạo file mới trong `docs/issues/` theo template ở `docs/issues/README.md`. Không gọi GitHub,
Linear hoặc dịch vụ ngoài trừ khi cấu hình này được thay đổi rõ ràng.

## Khi skill yêu cầu fetch issue

Đọc file theo task ID hoặc đường dẫn người dùng cung cấp. Nếu chỉ có task ID, tìm trong
`docs/issues/`.
