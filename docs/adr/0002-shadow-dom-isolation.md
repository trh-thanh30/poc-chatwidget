# ADR-0002 — Shadow DOM cho CSS/JS isolation

## Status

Accepted — 2026-11-17

## Context

Widget chạy trên website không kiểm soát được CSS reset, selector global, framework hoặc
JavaScript globals. Acceptance criteria yêu cầu CSS hai phía không ảnh hưởng lẫn nhau.

## Decision

- Script tạo một host element duy nhất và gọi `attachShadow({ mode: "open" })`.
- React tree được mount bên trong Shadow Root.
- CSS build được import dạng chuỗi và append vào `<style>` trong Shadow Root.
- Không inject stylesheet vào `document.head`.
- Host ID ổn định được dùng để ngăn duplicate mounting.
- Giữ Shadow Root ở mode `open` để test/debug POC và hỗ trợ automated verification.

## Consequences

- Selector của host page không đi vào component tree và CSS Widget không thoát ra ngoài.
- Portal, tooltip hoặc modal tương lai phải render trong Shadow Root.
- Font/theme global của host không tự động kế thừa; Widget phải khai báo token và typography.
- Host element vẫn là một node của document; integration test cần kiểm tra các host-level rule
  bất thường nếu POC được harden cho production.
