# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json vitest.config.ts eslint.config.mjs ./
COPY apps/widget/package.json apps/widget/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
RUN pnpm install --frozen-lockfile

COPY apps/widget apps/widget
COPY packages/typescript-config packages/typescript-config
RUN pnpm --filter @chat-widget/widget build

FROM nginx:1.27-alpine AS runner
COPY apps/widget/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/widget/dist/widget.js /usr/share/nginx/html/widget.js
EXPOSE 8080
