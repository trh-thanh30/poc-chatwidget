# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/demo/package.json apps/demo/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
RUN pnpm install --frozen-lockfile

COPY apps/demo apps/demo
COPY packages/typescript-config packages/typescript-config

ARG DEMO_WIDGET_SCRIPT_URL=http://localhost:8082/widget.js
ARG DEMO_API_URL=http://localhost:3000/api/v1
ARG DEMO_ACCESS=allowed
ENV DEMO_WIDGET_SCRIPT_URL=$DEMO_WIDGET_SCRIPT_URL
ENV DEMO_API_URL=$DEMO_API_URL
ENV DEMO_ACCESS=$DEMO_ACCESS
RUN pnpm --filter @chat-widget/demo build

FROM nginx:1.27-alpine AS runner
COPY apps/demo/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/demo/dist /usr/share/nginx/html
EXPOSE 8080
