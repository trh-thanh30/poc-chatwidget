# Backend Folder Structure

Tài liệu này định nghĩa cấu trúc và rule backend cho `apps/api` của POC Chat Widget. API chịu
trách nhiệm xác thực domain, quản lý phiên chat ngắn hạn, chống spam và giao tiếp với mock/Zalo
Personal thông qua một channel boundary.

Mục tiêu là giữ NestJS module theo business capability, dùng Drizzle ORM cho persistence và
không để controller, database hay thư viện Zalo phụ thuộc trực tiếp lẫn nhau.

## Technology Inventory

### Đã được cài đặt

| Area           | Package/Tool                          | Vai trò                                      |
| -------------- | ------------------------------------- | -------------------------------------------- |
| HTTP framework | NestJS 11, `@nestjs/platform-express` | REST API và application bootstrap            |
| Runtime        | Node.js 22, RxJS 7                    | Server runtime và NestJS reactive primitives |
| Metadata       | `reflect-metadata`                    | Decorator metadata của NestJS                |
| Language       | TypeScript 5.9                        | Strict type checking                         |
| Tests          | Vitest 4                              | Unit test ở workspace root                   |
| Build          | Nest CLI 11                           | Compile và chạy API                          |
| Persistence    | Drizzle ORM, Drizzle Kit              | Typed schema và SQL migration                |
| Database       | PostgreSQL driver (`pg`)              | PostgreSQL connection pool                   |
| Configuration  | `@nestjs/config`, Zod                 | Typed config và startup validation           |
| Session token  | `@nestjs/jwt`                         | HS256 JWT signing và verification            |
| DTO validation | class-validator/transformer           | Global request validation                    |
| Throttling     | `@nestjs/throttler`                   | Extensible HTTP rate-limit policy            |
| Local services | PostgreSQL 16, Redis 7 (Compose)      | Persistence và queue-ready infrastructure    |

### Đã chọn nhưng chưa cài đặt

| Package  | Task dự kiến          | Rule khi thêm                                        |
| -------- | --------------------- | ---------------------------------------------------- |
| `zca-js` | Zalo Personal channel | Pin exact version và bọc sau `ChatChannel` interface |

Không viết tài liệu hoặc code như thể các package trong bảng thứ hai đã tồn tại. Khi cài đặt,
cập nhật inventory và lockfile trong cùng change set.

Project đã chọn **Drizzle ORM**. Không thêm Prisma, `PrismaService` hoặc Prisma migration song
song vì sẽ tạo hai persistence convention cho cùng một POC.

## Current Folder Tree

```text
apps/api/
├── src/
│   ├── common/
│   │   ├── errors/
│   │   ├── filters/
│   │   ├── http/
│   │   ├── interceptors/
│   │   ├── tests/
│   │   ├── types/
│   │   └── common.module.ts
│   ├── config/
│   │   ├── configuration.ts
│   │   └── env.schema.ts
│   ├── database/
│   │   ├── migrations/
│   │   ├── schema/
│   │   │   ├── messages.ts
│   │   │   └── widgets.ts
│   │   ├── database.module.ts
│   │   └── database.service.ts
│   ├── modules/
│   │   ├── channels/
│   │   │   ├── chat-channel.ts
│   │   │   └── mock-chat.channel.ts
│   │   ├── health/
│   │   │   ├── tests/
│   │   │   ├── health.controller.ts
│   │   │   └── health.module.ts
│   │   ├── messages/
│   │   │   ├── dto/
│   │   │   ├── repository/
│   │   │   ├── tests/
│   │   │   ├── types/
│   │   │   ├── use-cases/
│   │   │   ├── messages.controller.ts
│   │   │   └── messages.module.ts
│   │   └── widget-sessions/
│   │       ├── dto/
│   │       ├── repository/
│   │       ├── services/
│   │       ├── tests/
│   │       ├── types/
│   │       ├── use-cases/
│   │       ├── widget-session.guard.ts
│   │       ├── widget-sessions.controller.ts
│   │       └── widget-sessions.module.ts
│   ├── tests/
│   ├── app.module.ts
│   └── main.ts
├── scripts/
│   └── seed.ts
├── drizzle.config.ts
├── nest-cli.json
├── package.json
├── tsconfig.build.json
└── tsconfig.json
```

API cung cấp health, Widget session và protected list/send Message API. Drizzle sở hữu
schema/migration cho Widget, allowed origin, short-lived session và message. Create/verify/send/list
use cases sở hữu business flow; `WidgetSessionGuard` chỉ lấy transport context rồi gọi verify use
case. `MockChatChannel` tạo reply deterministic sau `ChatChannel`; rate limiter và Zalo adapter
chưa được triển khai.

## Current File Roles

### `src/main.ts`

Composition root của NestJS process.

Được phép:

- Tạo Nest application.
- Cài global prefix, validation, CORS/origin guard và shutdown hooks.
- Đọc validated application config.
- Start listener và log thông tin không nhạy cảm.

Không được phép:

- Query database hoặc xử lý Widget business rule.
- Khởi tạo Zalo client trực tiếp.
- Hard-code whitelist hay credential.
- Log token, cookie hoặc raw Zalo session.

### `src/app.module.ts`

Root module chỉ compose infrastructure và feature modules. Khi feature xuất hiện, không thêm
provider của mọi feature trực tiếp vào đây.

### `src/modules/health/health.controller.ts`

Sở hữu health endpoint độc lập. Health module không import Widget session business logic.

## Target Structure Khi Backend Feature Xuất Hiện

Không tạo trước folder rỗng. Cấu trúc mục tiêu cho các task whitelist/chat/channel là:

```text
apps/api/src/
├── common/
│   ├── errors/
│   ├── filters/
│   ├── http/
│   ├── interceptors/
│   ├── tests/
│   └── types/
├── config/
│   ├── configuration.ts
│   └── env.schema.ts
├── database/
│   ├── database.module.ts
│   ├── database.provider.ts
│   ├── migrations/
│   └── schema/
│       ├── chat-sessions.ts
│       ├── messages.ts
│       └── widgets.ts
├── modules/
│   ├── health/
│   ├── widget-sessions/
│   ├── messages/
│   └── channels/
│       ├── chat-channel.ts
│       ├── mock-chat.channel.ts
│       └── zalo-personal.channel.ts
├── app.module.ts
└── main.ts
```

Folder chỉ được tạo khi có file thực sự dùng. `dto/`, `repository/`, `use-cases/` và `tests/` là
folder kiến trúc, được tạo ngay khi vai trò xuất hiện. Controller/service/guard/type đơn lẻ có thể
nằm ở root module; từ hai file cùng trách nhiệm trở lên phải chuyển toàn bộ vào folder số nhiều.

## Feature Module Shape

Một feature điển hình có thể phát triển theo cấu trúc:

```text
modules/messages/
├── messages.module.ts
├── messages.controller.ts
├── dto/
│   └── send-message.dto.ts
├── policies/
│   └── message-rate-limit.policy.ts
├── repository/
│   ├── message.repository.ts
│   └── drizzle-message.repository.ts
├── use-cases/
│   ├── send-message.use-case.ts
│   └── list-messages.use-case.ts
├── services/
│   └── message-content.service.ts
├── types/
│   └── messages.types.ts
└── tests/
    ├── send-message.use-case.spec.ts
    └── messages.http.spec.ts
```

### Layer rules

- Controller parse HTTP input, gọi use case và map output; không query Drizzle trực tiếp.
- DTO mô tả public transport contract; không tái sử dụng database row như request DTO.
- Use case điều phối domain policy, repository và channel.
- Use case sở hữu một business flow hoàn chỉnh và là test surface ưu tiên.
- Service chỉ giữ capability domain/kỹ thuật dùng lại bởi nhiều use case. Logic chỉ dùng trong một
  flow phải ở lại use case; service không phải catch-all business layer.
- Policy giữ rule như whitelist hoặc `5 messages / 10 seconds` để test độc lập.
- Repository interface thuộc module sử dụng; Drizzle implementation là infrastructure detail.
- Module export public token/provider tối thiểu, không export toàn bộ internals.
- Mọi `*.test.ts`/`*.spec.ts` backend nằm trong `tests/` và bị loại khỏi production build.

Không bắt buộc tạo class cho từng hàm. Tách layer dựa trên boundary cần thay thế/test, không dựa
trên ceremony.

## Module Ownership

| Module          | Trách nhiệm                                             |
| --------------- | ------------------------------------------------------- |
| `widgets`       | Widget ID, trạng thái và allowed origins                |
| `chat-sessions` | Tạo/xác thực phiên ngắn hạn gắn với Widget và origin    |
| `messages`      | Gửi/nhận message, trạng thái và anti-spam orchestration |
| `channels`      | Contract với mock hoặc Zalo Personal                    |
| `database`      | Connection, Drizzle schema và migration lifecycle       |

`widgets` không sở hữu Zalo SDK. `channels` không quyết định domain có được phép dùng Widget hay
không. `messages` không đọc trực tiếp request header của Express.

## Drizzle ORM Rules

- Schema chia theo business table trong `database/schema/` và export qua một index khi cần.
- Migration được tạo bởi Drizzle Kit, review và commit; không dùng auto-sync schema ở production.
- Database column dùng `snake_case`; TypeScript field dùng convention nhất quán của Drizzle.
- Primary key, timestamps, foreign key và index phải khai báo rõ.
- Mọi query phải đi qua repository/provider có owner; controller không import schema.
- Transaction boundary nằm ở use case cần atomicity, không ẩn trong helper tùy ý.
- Migration không chứa credential hoặc environment-specific hostname.
- POC không lưu lịch sử dài hạn; thêm retention/cleanup policy cho session và message tạm thời.

Schema khởi đầu dự kiến:

```text
widgets -> allowed_origins
widgets -> chat_sessions -> messages
```

Allowed origin có thể được normalize thành bảng riêng hoặc cấu hình JSON cho POC. Quyết định
phải được ghi ADR nếu ảnh hưởng query/index/deployment đáng kể.

## Domain Restriction and CORS

CORS không phải là whitelist security boundary duy nhất. Backend vẫn phải kiểm tra origin theo
Widget ID trên mỗi bootstrap/send/poll request.

Luồng đề xuất:

```text
request Origin header + widgetId
  -> normalize origin (scheme + hostname + explicit port)
  -> load active Widget config
  -> exact-match allowed origin
  -> issue/verify short-lived session bound to widgetId + origin
  -> continue use case or return 403
```

Rules:

- Không tin `Referer` khi `Origin` có sẵn.
- Không dùng substring hoặc `endsWith` thiếu dot-boundary để match domain.
- `https://example.com` không tự động cho phép `https://evil-example.com`.
- Port là một phần của origin; localhost development phải cấu hình rõ.
- Wildcard subdomain chỉ thêm khi có requirement và parser/test riêng.
- Client-side check chỉ cải thiện UX; backend check mới là enforcement.
- Response lỗi không tiết lộ toàn bộ whitelist.

## Rate Limiting

Acceptance rule: quá 5 tin nhắn trong rolling/fixed window 10 giây từ cùng một phiên thì request
tiếp theo bị từ chối tạm thời.

Key tối thiểu:

```text
widgetId + verified sessionId
```

IP có thể là tín hiệu bổ sung nhưng không thay session key vì NAT/proxy có thể gom nhiều người
dùng. Session ID phải do backend ký/phát hành; không tin giá trị client tự đặt.

Khi reject:

- Trả HTTP `429 Too Many Requests`.
- Trả `Retry-After` hoặc thời điểm được thử lại.
- Không forward message sang channel.
- Ghi structured event không chứa nội dung chat nhạy cảm.
- Test boundary ở message thứ 5, thứ 6, hết window và hai session độc lập.

Default in-memory store của `@nestjs/throttler` chỉ đủ cho single-instance POC: mỗi API process giữ
một counter riêng và counter mất khi process restart. Nếu chạy nhiều replica, chuyển store sang
Redis hoặc storage chia sẻ trước khi deploy.

## Chat Channel Boundary

Business use case phụ thuộc abstraction thay vì phụ thuộc trực tiếp `zca-js`:

```ts
export interface ChatChannel {
  send(input: SendChannelMessage): Promise<ChannelMessageResult>;
  receive(input: ReceiveChannelMessages): Promise<ChannelMessage[]>;
}
```

- `MockChatChannel` dùng cho demo/test và không cần credential.
- `ZaloPersonalChannel` là adapter duy nhất import Zalo library.
- Chọn adapter qua validated config/provider token.
- Không để type của SDK rò sang controller hoặc public API DTO.
- Map error của SDK thành application error ổn định.
- Không tạo login/session mới cho mỗi HTTP request; quản lý lifecycle ở provider singleton phù
  hợp và đóng resource khi shutdown.

Zalo Personal là integration có rủi ro thay đổi và account policy. Pin exact package version,
không commit credential/session, và giữ mock adapter làm fallback cho acceptance test.

## Configuration and Secrets

Config dự kiến gồm:

```text
PORT
DATABASE_URL
CHAT_CHANNEL=mock|zalo-personal
WIDGET_SESSION_JWT_SECRET
WIDGET_SESSION_JWT_TTL_SECONDS
ZALO_* (chỉ khi adapter thật được bật)
```

- Validate tất cả biến bắt buộc lúc bootstrap và fail fast với message an toàn.
- `.env.example` chỉ chứa placeholder.
- Không dùng `process.env` bên trong controller/use case; inject typed config.
- Widget ID là public identifier, không phải secret.
- Database URL, JWT signing secret và Zalo credential không được gửi về Widget.
- Log phải redact header/cookie/token nhạy cảm.

## Widget Session JWT

- Dùng `@nestjs/jwt`; không tự xây token codec hoặc HMAC envelope riêng.
- HS256 đủ cho POC vì cùng API process ký và verify; secret random tối thiểu 32 bytes.
- Claims tối thiểu: `sub` session ID, `wid`, normalized `origin`, `jti`, `iss`, `aud`, `iat`, `exp`.
- Verify algorithm, issuer, audience và expiry trước khi đọc claims.
- JWT payload không chứa credential hoặc nội dung chat vì JWT được encode, không encrypt.
- JWT hợp lệ vẫn phải re-check session, Widget enabled state và current whitelist trong database.
- Widget gửi token bằng `Authorization: Bearer`; không đặt token trong URL hoặc persistent storage.

## Error Handling

Public API nên dùng error envelope ổn định, ví dụ:

```json
{
  "error": {
    "code": "MESSAGE_RATE_LIMITED",
    "message": "Please wait before sending another message.",
    "retryAfterSeconds": 4
  }
}
```

Mapping chính:

| Condition               | HTTP status             |
| ----------------------- | ----------------------- |
| Invalid payload         | `400`                   |
| Missing/invalid session | `401`                   |
| Origin không được phép  | `403`                   |
| Widget không tồn tại    | `404`                   |
| Vượt giới hạn gửi       | `429`                   |
| Channel tạm lỗi         | `502` hoặc `503`        |
| Lỗi không dự kiến       | `500` với message chung |

Không trả stack trace, SQL error hoặc raw SDK response cho embed client.

## Testing Strategy

Repo hiện dùng **Vitest**, không dùng Jest. Test mới phải chạy qua `pnpm test` trừ khi một ADR
chấp nhận thay đổi test runner.

### Unit tests

- Origin normalization và exact whitelist matching.
- Rate-limit policy ở các boundary thời gian.
- Session binding/signature.
- Use case với fake repository và mock channel.
- SDK error mapping không cần gọi Zalo thật.

### Integration tests

- Nest endpoint với allowed/disallowed origin.
- Drizzle repository trên test database khi persistence được thêm.
- Message thứ 6 trong 10 giây trả `429` và không gọi channel.
- Session của Widget A không dùng được cho Widget B.
- Channel timeout trả error envelope ổn định.

Test không phụ thuộc account Zalo cá nhân trong default CI. Live integration test phải opt-in và
được bảo vệ bằng environment flag/secret store.

## Dependency Placement

| Dependency                                          | Nơi khai báo                       |
| --------------------------------------------------- | ---------------------------------- |
| NestJS, Drizzle, DB driver, Zalo adapter            | `apps/api/package.json`            |
| Shared TypeScript config                            | `packages/typescript-config`       |
| Framework-neutral API schema/type có nhiều consumer | Package riêng khi có consumer thật |
| Workspace lint/test/format tooling                  | Root `package.json`                |

Không đặt runtime dependency của API ở root chỉ để hoisting làm import hoạt động.

## Anti-patterns

- Query Drizzle trực tiếp trong controller.
- Tin whitelist check từ Widget client.
- Dùng CORS như cơ chế authorization duy nhất.
- Rate limit chỉ theo IP hoặc client-provided session ID.
- Import `zca-js` ở use case/controller.
- Log nội dung chat, Zalo cookie hoặc credential mặc định.
- Retry send-message mù quáng và tạo message trùng.
- Trộn Prisma và Drizzle trong cùng codebase.
- Tạo `common/` như nơi chứa mọi helper không có owner.
- Unit test gọi network/database thật không kiểm soát.

## Backend Change Checklist

- [ ] Đọc PRD, issue và ADR liên quan trước khi thêm module.
- [ ] Phân biệt package đã cài với package mới chỉ được lựa chọn.
- [ ] Giữ controller mỏng và business rule có test độc lập.
- [ ] Enforce Widget ID + origin ở backend.
- [ ] Không làm lộ credential hoặc raw integration error.
- [ ] Migration và schema change được review cùng code sử dụng.
- [ ] Test rate-limit boundary và multi-session behavior.
- [ ] Test mock channel trong default workflow.
- [ ] Chạy `pnpm lint`, `pnpm check-types`, `pnpm test`, `pnpm build`.
