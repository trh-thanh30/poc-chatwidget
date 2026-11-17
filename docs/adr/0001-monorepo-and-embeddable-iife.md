# ADR-0001 — Monorepo boundaries và embeddable IIFE

## Status

Accepted — 2026-11-17

## Context

POC cần một Widget có thể nhúng bằng thẻ script, một API backend và một host page để kiểm tra.
Các thành phần dùng chung toolchain TypeScript nhưng có runtime/deployment khác nhau.

## Decision

- Dùng pnpm workspace và Turborepo cho development orchestration.
- `apps/widget` build React thành một IIFE tên file ổn định `widget.js`.
- React và ReactDOM được bundle vào artifact; host page không cần cài dependency.
- `apps/api` là NestJS service độc lập.
- `apps/demo` là consumer thử nghiệm, không được import source nội bộ của Widget.
- Shared config đặt trong `packages/*`; packages không import từ apps.

## Consequences

- Người dùng tích hợp bằng một script thông thường, không cần ESM loader.
- Bundle lớn hơn giải pháp dùng peer dependency nhưng không xung đột React version của host.
- Demo kiểm tra đúng artifact qua HTTP thay vì import source trực tiếp.
- API, Widget và demo có thể build/deploy độc lập.
