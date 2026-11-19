# Zalo Personal Channel

Zalo Personal là adapter **opt-in** sau `ChatChannel`. `MockChatChannel` vẫn là mặc định và không
cần tài khoản hoặc credential Zalo.

> `zca-js` mô phỏng Zalo Web bằng API không chính thức. Chỉ sử dụng dedicated POC account. Tài
> khoản có thể bị giới hạn hoặc khóa; không dùng tài khoản cá nhân hay tài khoản vận hành chính.

## Runtime flow

```text
Widget POST /messages
  -> SendMessageUseCase
  -> ZaloPersonalChannel
  -> dedicated operator user/group thread

Operator quote đúng forwarded message và reply plain text
  -> singleton zca-js listener
  -> quoted outbound message ID xác định Widget session
  -> GET /messages persist reply một lần
  -> Widget polling nhận reply qua contract hiện tại
```

Operator phải dùng Zalo **Reply/Quote** trên đúng forwarded message. Reply không quote, reply từ
thread khác, rich media và message do chính dedicated account gửi sẽ bị bỏ qua.

## Configuration

Giữ đường chạy mặc định:

```dotenv
CHAT_CHANNEL=mock
```

Để opt-in adapter thật, đặt các giá trị sau trong `.env` hoặc secret store ngoài source:

```dotenv
CHAT_CHANNEL=zalo-personal
ZALO_PERSONAL_COOKIE_JSON=[...]
ZALO_PERSONAL_IMEI=...
ZALO_PERSONAL_USER_AGENT=...
ZALO_PERSONAL_OPERATOR_THREAD_ID=...
ZALO_PERSONAL_OPERATOR_THREAD_TYPE=user
```

`ZALO_PERSONAL_OPERATOR_THREAD_TYPE` nhận `user` hoặc `group`. Cookie phải là JSON array theo
credential format của `zca-js`. Không gửi các giá trị này cho Widget, không paste vào issue/log và
không commit `.env`.

API pin chính xác `zca-js@2.3.0`. Mỗi Zalo account chỉ được chạy một web listener; mở Zalo Web bằng
cùng account có thể làm listener của API bị dừng.

### Discover operator thread

Sau khi điền cookie, IMEI và User-Agent của dedicated Bridge account, đóng API và Zalo Web đang
dùng cùng account rồi chạy:

```bash
pnpm zalo:discover-thread
```

- Với direct chat (`user`): operator account gửi chính xác `discover-thread` cho Bridge account.
- Với group chat (`group`): một operator gửi chính xác `discover-thread` vào group có Bridge
  account.

Utility chỉ in `ZALO_PERSONAL_OPERATOR_THREAD_ID` và `ZALO_PERSONAL_OPERATOR_THREAD_TYPE`, không in
nội dung khác hay credential. Copy hai dòng kết quả vào `.env`, sau đó dừng utility trước khi chạy
API. `threadId` là ID nội bộ của direct/group conversation, không phải số điện thoại.

## Behavior khi unavailable

- Initial login failure không làm NestJS process crash.
- Send request trả HTTP `503` với code `CHANNEL_UNAVAILABLE`; raw SDK/credential error không đi ra
  response.
- Listener sử dụng retry-on-close của SDK; khi connection event trở lại, adapter cho phép send.
- Sửa credential ban đầu yêu cầu restart API.
- Mock Channel không import credential và vẫn chạy toàn bộ automated acceptance mặc định.

## Live validation có con người

Sau khi dedicated account đăng nhập và operator mở đúng thread, chạy:

```bash
RUN_ZALO_LIVE_TESTS=1 pnpm exec vitest run \
  apps/api/src/modules/channels/tests/zalo-personal.live.spec.ts
```

Test gửi một message hướng dẫn. Trong 90 giây, operator phải quote message đó và reply plain text.
Test mặc định luôn skip live suite, nên CI/local quality gate không tự gửi tin Zalo.

## POC limitations

- Outbound Zalo message ID được persist cùng visitor message để route quoted reply qua restart.
- Incoming listener event chờ Widget poll trong memory; multi-replica và durable event queue nằm
  ngoài scope hiện tại.
- Một account, một operator thread và text-only.
- `zca-js@2.3.0` kéo theo `crypto-js@4.2.0` đã deprecated; npm audit hiện không báo known
  vulnerability nhưng dependency này vẫn cần được review khi nâng version.
- Không có production SLA, automatic credential rotation hoặc account-ban protection.
