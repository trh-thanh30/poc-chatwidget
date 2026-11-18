import axios, { type AxiosInstance } from 'axios';

import type { CreateHttpClientOptions } from './http-client';
import { HttpClientError, type HttpClientErrorKind } from './http-client.error';

type ApiErrorBody = {
  error?: {
    code?: unknown;
    message?: unknown;
  };
};

function readHeader(headers: unknown, name: string): string | undefined {
  if (!headers || typeof headers !== 'object') return undefined;
  if ('get' in headers && typeof headers.get === 'function') {
    const value = headers.get(name);
    return typeof value === 'string' ? value : undefined;
  }
  const value = (headers as Record<string, unknown>)[name];
  return typeof value === 'string' ? value : undefined;
}

function parseRetryAfter(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds);
  const retryAt = Date.parse(value);
  if (Number.isNaN(retryAt)) return undefined;
  return Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
}

function normalizeHttpError(error: unknown): HttpClientError {
  if (axios.isCancel(error)) {
    return new HttpClientError({
      kind: 'canceled',
      message: 'Chat API request was canceled.',
      cause: error,
    });
  }
  if (!axios.isAxiosError(error)) {
    return new HttpClientError({ kind: 'unknown', cause: error });
  }

  const timeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
  if (!error.response) {
    const kind: HttpClientErrorKind = timeout ? 'timeout' : 'network';
    return new HttpClientError({
      kind,
      message: timeout ? 'Chat API phản hồi quá chậm.' : 'Không thể kết nối đến Chat API.',
      cause: error,
    });
  }

  const body = error.response.data as ApiErrorBody | undefined;
  const code = typeof body?.error?.code === 'string' ? body.error.code : undefined;
  const message =
    typeof body?.error?.message === 'string'
      ? body.error.message
      : 'Chat API không thể hoàn thành yêu cầu.';

  return new HttpClientError({
    kind: 'http',
    status: error.response.status,
    code,
    message,
    requestId: readHeader(error.response.headers, 'x-request-id'),
    retryAfterSeconds: parseRetryAfter(readHeader(error.response.headers, 'retry-after')),
    cause: error,
  });
}

export function installHttpClientInterceptors(
  client: AxiosInstance,
  options: CreateHttpClientOptions,
): void {
  client.interceptors.request.use(async (config) => {
    const dynamicHeaders = await options.getHeaders?.();
    for (const [name, value] of Object.entries(dynamicHeaders ?? {})) {
      if (value) config.headers.set(name, value);
    }

    const token = await options.getAccessToken?.();
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      const normalized = normalizeHttpError(error);
      if (normalized.status === 401) await options.onUnauthorized?.(normalized);
      throw normalized;
    },
  );
}
