# Security Policy

## POC status

Đây là proof of concept, chưa phải production-ready service.

## Secrets

- Không commit `.env`, JWT secret, database password, Zalo cookie, IMEI, user agent hoặc token.
- Dùng `.env.example` chỉ với placeholder.
- Không ghi secret vào test snapshot, log hoặc tài liệu.

## Embed boundary

- Widget ID là public identifier, không phải authorization secret.
- Domain/origin restriction phải enforce ở backend trên mọi request liên quan.
- Không tin origin hoặc session ID chỉ do request body cung cấp.
- Content từ visitor/operator phải render an toàn, mặc định dưới dạng text.

## Zalo Personal risk

Zalo Personal integration dùng API không chính thức và có thể khiến tài khoản bị hạn chế hoặc
khóa. Chỉ dùng tài khoản POC riêng; không dùng tài khoản cá nhân hoặc tài khoản vận hành chính.

## Container handoff

- Full Compose bind public POC endpoints vào loopback theo mặc định và không cung cấp TLS.
- Giá trị JWT/database mặc định chỉ dành cho local POC; phải rotate và đưa vào secret manager trước
  mọi môi trường chia sẻ.
- Docker build context loại `.env`, logs, coverage, dependency folders và generated artifacts.
- Mock Compose không nhận Zalo credential. Zalo override đọc credential lúc runtime và fail-fast nếu
  thiếu; không đưa credential vào image build args.
- Không expose PostgreSQL hoặc API POC trực tiếp ra Internet.

## Reporting

Không tạo public issue chứa credential hoặc dữ liệu nhạy cảm. Báo trực tiếp cho maintainer và
rotate secret bị lộ trước khi tiếp tục điều tra.
