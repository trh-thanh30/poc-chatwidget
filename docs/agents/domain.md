# Domain Docs

Repo dùng layout single-context.

Trước khi triển khai hoặc review:

1. Đọc `CONTEXT.md` ở root.
2. Đọc ADR liên quan trong `docs/adr/`.
3. Dùng đúng thuật ngữ trong glossary khi đặt tên issue, test và module.
4. Nếu đề xuất trái ADR, nêu rõ conflict thay vì silently override.

Không có `CONTEXT-MAP.md`; các apps là deployment/module boundaries trong cùng một Chat Widget
context, không phải bounded contexts độc lập.
