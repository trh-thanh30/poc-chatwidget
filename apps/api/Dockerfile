# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable \
  && apk add --no-cache ca-certificates libc6-compat
WORKDIR /app

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
RUN pnpm install --frozen-lockfile

FROM dependencies AS builder
COPY apps/api apps/api
COPY packages/typescript-config packages/typescript-config
RUN pnpm --filter @chat-widget/api build \
  && pnpm --config.inject-workspace-packages=true --filter @chat-widget/api deploy --prod /prod/api

FROM dependencies AS migration
COPY apps/api apps/api
COPY packages/typescript-config packages/typescript-config
CMD ["sh", "-lc", "pnpm --filter @chat-widget/api db:migrate && pnpm --filter @chat-widget/api db:seed"]

FROM node:22-alpine AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

RUN apk add --no-cache ca-certificates libc6-compat \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /prod/api ./

USER nestjs
EXPOSE 3000
CMD ["node", "dist/main.js"]
