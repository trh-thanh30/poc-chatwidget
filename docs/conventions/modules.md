# Module Conventions

## General

- Dùng thuật ngữ từ `CONTEXT.md` trong tên module, type, test và issue.
- Ưu tiên module sâu có public interface rõ hơn nhiều helper nông.
- `index.ts` chỉ dùng để export; không đặt logic trong barrel file.
- Không tạo abstraction trước khi có boundary hoặc ít nhất hai implementations thực tế.
- Ưu tiên maintained package cho capability tiêu chuẩn trước khi tự xây codec, config loader,
  validation framework, query cache hoặc HTTP client.
- Reuse pattern từ base project chỉ sau khi loại bỏ dependency ngoài scope và đổi convention cho
  đúng React/Vite/NestJS/Drizzle của repo này.

## Widget

- Bootstrap/integration code tách khỏi React presentation.
- UI state local dùng React state; server state dùng TanStack Query.
- HTTP transport đi qua một Axios client thống nhất.
- Text từ visitor/operator render như text mặc định; không dùng raw HTML.
- Mọi interactive control cần accessible name và keyboard behavior.
- CSS dùng token prefix `--cw-` và nằm trong Shadow Root.

## API

- Module có persistence/behavior theo controller → use case → repository.
- Business flow hoàn chỉnh nằm trong use case; controller/guard chỉ xử lý transport context.
- Service chỉ giữ capability domain/kỹ thuật được nhiều use case dùng lại. Logic chỉ dùng trong một
  flow ở lại use case; không tạo service dạng catch-all.
- `dto/`, `repository/`, `use-cases/` và `tests/` được tạo ngay khi vai trò đó xuất hiện.
- Một controller/service/guard/type có thể nằm root module. Từ hai file cùng trách nhiệm trở lên,
  chuyển toàn bộ vào folder số nhiều tương ứng.
- Module file chính luôn ở root; không tạo folder rỗng hoặc barrel file không export gì.
- DTO transport không được dùng thay domain model một cách ngầm định.
- Error response phải ổn định và không lộ stack/credential.
- Mọi rule security quan trọng phải enforce server-side.

## Tests

- Mọi backend `*.test.ts`/`*.spec.ts` phải nằm trong folder `tests/`; backend ưu tiên tên
  `*.spec.ts`.
- Unit test behavior thuần tại use case/service.
- Integration test origin, session, persistence và rate limit.
- Embed test phải dùng artifact build và host page có CSS conflict.
- Một regression fix phải có test fail trước hoặc reproduction được ghi lại.
