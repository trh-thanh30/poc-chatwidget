import axios, { type AxiosInstance } from 'axios';

import type { HttpClientError } from './http-client.error';
import { installHttpClientInterceptors } from './http-client.interceptors';
export { HttpClientError } from './http-client.error';

export type CreateHttpClientOptions = {
  baseUrl: string;
  timeoutMs?: number;
  getAccessToken?: () => Promise<string | null | undefined> | string | null | undefined;
  getHeaders?: () =>
    Promise<Record<string, string | undefined>> | Record<string, string | undefined>;
  onUnauthorized?: (error: HttpClientError) => Promise<void> | void;
};

export function createHttpClient(options: CreateHttpClientOptions): AxiosInstance {
  const client = axios.create({
    baseURL: options.baseUrl.replace(/\/+$/, ''),
    headers: { Accept: 'application/json' },
    timeout: options.timeoutMs ?? 10_000,
    withCredentials: false,
  });

  installHttpClientInterceptors(client, options);
  return client;
}
