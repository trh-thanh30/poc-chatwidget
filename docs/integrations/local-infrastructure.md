# Local Infrastructure

Development infrastructure uses Docker Compose for PostgreSQL and Redis. API, Widget and demo
continue to run on the host through pnpm until full-stack packaging is added. Redis is available
for a future BullMQ delivery worker, but no queue/worker is registered yet.

## Prerequisites

- Docker Engine/Desktop with Compose v2.
- Node.js 22 and pnpm 10.

## First-time setup

```bash
cp .env.example .env
pnpm install --frozen-lockfile
pnpm infra:dev:up
pnpm infra:dev:ps
pnpm db:migrate
pnpm db:seed
```

Default connection:

```text
postgresql://poc_chatwidget_user:poc_chatwidget_password@127.0.0.1:15432/poc_chatwidget
redis://:poc_chatwidget_redis_password@127.0.0.1:16379
```

Port `15432` avoids colliding with a PostgreSQL service already using `5432`. When overriding
`POSTGRES_*` or `DEV_DB_PORT`, update `DATABASE_URL` to match. When overriding
`REDIS_PASSWORD`/`DEV_REDIS_PORT`, update `REDIS_URL` as well.

## Commands

| Command                 | Behavior                                                        |
| ----------------------- | --------------------------------------------------------------- |
| `pnpm infra:dev:up`     | Start PostgreSQL/Redis and wait until both services are healthy |
| `pnpm infra:dev:down`   | Stop containers without deleting the named volume               |
| `pnpm infra:dev:logs`   | Follow PostgreSQL and Redis logs                                |
| `pnpm infra:dev:ps`     | Show container and health status                                |
| `pnpm infra:dev:config` | Render and validate the resolved Compose configuration          |
| `pnpm db:generate`      | Generate Drizzle migrations after application schema exists     |
| `pnpm db:migrate`       | Apply committed Drizzle migrations                              |
| `pnpm db:seed`          | Run the application seed entrypoint                             |
| `pnpm db:studio`        | Open Drizzle Studio                                             |

The committed Widget/session migration is owned by the backend session capability. The idempotent
seed creates `demo-widget` with exact allowed origin `http://localhost:5173`; run it again safely
after local database changes.

## Persistence behavior

Compose stores data in `poc-chatwidget-dev_poc_chatwidget_postgres_data` and
`poc-chatwidget-dev_poc_chatwidget_redis_data`. Redis uses AOF persistence so future queue data can
survive normal container recreation. Normal `down`/`up` keeps both volumes.

## Destructive reset

The following command permanently removes both local data volumes:

```bash
docker compose -f docker-compose.dev.yml down --volumes
```

Run it only when a clean local database is explicitly required. It is deliberately not exposed as
a package script.

## Troubleshooting

- Port already in use: change `DEV_DB_PORT` and the port inside `DATABASE_URL` in `.env`.
- Container is unhealthy: run `pnpm infra:dev:logs` and verify database/Redis credentials.
- Redis authentication fails: confirm `REDIS_PASSWORD` and the credential inside `REDIS_URL`
  match.
- Drizzle cannot find `DATABASE_URL`: confirm root `.env` exists; Drizzle reads that file directly.
- API cannot connect: the host API uses `127.0.0.1:<DEV_DB_PORT>`, not Compose service name `db`.
