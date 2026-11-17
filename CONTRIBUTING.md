# Contributing

## Trước khi bắt đầu

- Đọc `AGENTS.md`, `CONTEXT.md` và ADR liên quan.
- Chọn hoặc tạo issue trong `docs/issues/`.
- Giữ thay đổi trong scope và out-of-scope của issue.

## Development

```bash
pnpm install
pnpm dev
```

## Trước khi bàn giao

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
```

Nếu sửa Widget runtime, chạy manual smoke test trong `docs/testing/acceptance.md`.

## Documentation rule

- Thay thuật ngữ/rule bền vững: cập nhật `CONTEXT.md`.
- Thay architecture boundary: tạo hoặc cập nhật ADR.
- Thay integration behavior: cập nhật `docs/integrations/`.
- Thay acceptance behavior: cập nhật issue và test trong cùng change set.
