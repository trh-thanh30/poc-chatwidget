# Full-stack Compose Handoff

`docker-compose.full.yml` đóng gói đường chạy POC có thể review độc lập với toolchain Node trên
host. Mock Channel là mặc định; không cần tài khoản hoặc credential Zalo.

## Services

| Service        | Default host URL/port                 | Vai trò                                       |
| -------------- | ------------------------------------- | --------------------------------------------- |
| `db`           | `127.0.0.1:25432`                     | PostgreSQL với named volume                   |
| `init`         | one-shot                              | Chạy Drizzle migrations và seed whitelist     |
| `api`          | `http://localhost:3000/api/v1/health` | NestJS API                                    |
| `widget`       | `http://localhost:8082/widget.js`     | Static IIFE asset với CORS                    |
| `demo-allowed` | `http://localhost:8080`               | Origin được seed, chat Mock phải hoạt động    |
| `demo-blocked` | `http://localhost:8081`               | Origin không được seed, bootstrap phải bị 403 |

`init` chỉ hoàn thành sau khi PostgreSQL healthy. API chỉ start sau `init`; hai demo chỉ start sau
API và Widget static server healthy. Database volume được giữ khi chạy `pnpm full:down`.

## Start and stop

Từ fresh clone:

```bash
cp .env.example .env
pnpm full:config
pnpm full:up
```

Hoặc trên host chỉ có Docker, không cần cài dependency workspace:

```bash
docker compose -f docker-compose.full.yml config
docker compose -f docker-compose.full.yml up -d --build --wait
```

Sau đó:

1. Mở `http://localhost:8080`, mở Widget và gửi message; phải thấy `Mock reply: ...`.
2. Mở `http://localhost:8081`; panel phải báo website chưa được cấp quyền.
3. Chạy `pnpm full:smoke` để kiểm tra bootstrap, Mock round-trip, blocked 403 và static asset.
4. Kiểm tra trạng thái bằng `pnpm full:ps` và log bằng `pnpm full:logs`.

Dừng container nhưng giữ database:

```bash
pnpm full:down
```

Lệnh Docker tương đương là `docker compose -f docker-compose.full.yml down`.

Các port có thể override bằng `FULL_API_PORT`, `FULL_WIDGET_PORT`, `FULL_ALLOWED_DEMO_PORT`,
`FULL_BLOCKED_DEMO_PORT` và `FULL_DB_PORT`. Vì origin gồm cả port, `init` tự seed đúng allowed demo
port đã override.

## Zalo opt-in

Đường chạy mặc định luôn dùng Mock. Sau khi đã có dedicated Bridge account và điền credential thật
trong `.env`, dùng Compose override:

```bash
docker compose \
  -f docker-compose.full.yml \
  -f docker-compose.zalo.yml \
  up -d --build --wait
```

Override fail-fast nếu thiếu credential. Không commit `.env`; không truyền cookie vào build args hay
frontend image. Xem [Zalo Personal Channel](zalo-personal-channel.md) để biết account risk và live
validation.

## Troubleshooting

- `init` failed: chạy `docker compose -f docker-compose.full.yml logs init db` và kiểm tra database
  credentials/volume.
- Widget không hiện: xác nhận `http://localhost:8082/widget.js` trả JavaScript và hard reload demo.
- Allowed demo bị từ chối sau khi đổi port: chạy lại `pnpm full:up` để one-shot seed nhận port mới.
- Blocked demo lại được phép: kiểm tra database có origin đó từ lần seed tùy chỉnh trước hay không.
- Port đã được dùng: override bộ `FULL_*_PORT`; không dừng process không thuộc stack.
- API/channel offline: Widget phải giữ host page hoạt động, hiển thị trạng thái retry hoặc giữ draft.

Full Compose là packaging POC, không phải production deployment: chưa có TLS, secret manager,
centralized logs, backup/restore, autoscaling hoặc high availability.
