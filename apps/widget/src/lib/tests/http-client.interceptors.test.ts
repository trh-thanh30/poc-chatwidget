import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { describe, expect, it } from 'vitest';

import { createHttpClient, HttpClientError, isRateLimitHttpClientError } from '../http-client';

describe('Widget HTTP client interceptors', () => {
  it('reads the access token lazily from memory for each request', async () => {
    let accessToken = 'first-token';
    const client = createHttpClient({
      baseUrl: 'https://api.example.com/api/v1',
      getAccessToken: () => accessToken,
    });
    const seenAuthorization: string[] = [];
    const adapter = async (config: InternalAxiosRequestConfig) => {
      seenAuthorization.push(String(config.headers.get('Authorization')));
      return {
        config,
        data: { ok: true },
        headers: new AxiosHeaders(),
        status: 200,
        statusText: 'OK',
      } satisfies AxiosResponse;
    };

    await client.get('/one', { adapter });
    accessToken = 'second-token';
    await client.get('/two', { adapter });

    expect(seenAuthorization).toEqual(['Bearer first-token', 'Bearer second-token']);
  });

  it('normalizes API errors with code, retry delay and request ID', async () => {
    const client = createHttpClient({ baseUrl: 'https://api.example.com/api/v1' });
    const adapter = async (config: InternalAxiosRequestConfig) => {
      const response = {
        config,
        data: { error: { code: 'MESSAGE_RATE_LIMITED', message: 'Please wait.' } },
        headers: new AxiosHeaders({ 'retry-after': '7', 'x-request-id': 'request-123' }),
        status: 429,
        statusText: 'Too Many Requests',
      } satisfies AxiosResponse;
      throw new AxiosError(
        'Request failed',
        AxiosError.ERR_BAD_REQUEST,
        config,
        undefined,
        response,
      );
    };

    const normalizedError = await client.get('/messages', { adapter }).catch((error) => error);

    expect(normalizedError).toMatchObject({
      name: 'HttpClientError',
      code: 'MESSAGE_RATE_LIMITED',
      message: 'Please wait.',
      requestId: 'request-123',
      retryAfterSeconds: 7,
      status: 429,
    } satisfies Partial<HttpClientError>);
    expect(isRateLimitHttpClientError(normalizedError)).toBe(true);
  });

  it('normalizes transport failures without leaking Axios internals', async () => {
    const client = createHttpClient({ baseUrl: 'https://api.example.com/api/v1' });
    const adapter = async (config: InternalAxiosRequestConfig) => {
      throw new AxiosError('socket details', AxiosError.ERR_NETWORK, config);
    };

    await expect(client.get('/widget-sessions', { adapter })).rejects.toMatchObject({
      name: 'HttpClientError',
      kind: 'network',
      message: 'Không thể kết nối đến Chat API.',
    } satisfies Partial<HttpClientError>);
    expect(axios.isAxiosError(new HttpClientError({ kind: 'network' }))).toBe(false);
  });

  it('notifies the session owner when an authenticated request returns 401', async () => {
    let unauthorizedCalls = 0;
    const client = createHttpClient({
      baseUrl: 'https://api.example.com/api/v1',
      onUnauthorized: () => {
        unauthorizedCalls += 1;
      },
    });
    const adapter = async (config: InternalAxiosRequestConfig) => {
      const response = {
        config,
        data: { error: { code: 'SESSION_EXPIRED', message: 'Session expired.' } },
        headers: new AxiosHeaders(),
        status: 401,
        statusText: 'Unauthorized',
      } satisfies AxiosResponse;
      throw new AxiosError(
        'Request failed',
        AxiosError.ERR_BAD_REQUEST,
        config,
        undefined,
        response,
      );
    };

    await expect(client.get('/messages', { adapter })).rejects.toMatchObject({ status: 401 });
    expect(unauthorizedCalls).toBe(1);
  });
});
