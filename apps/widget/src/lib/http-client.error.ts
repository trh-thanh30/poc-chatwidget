export type HttpClientErrorKind = 'canceled' | 'http' | 'network' | 'timeout' | 'unknown';

export type HttpClientErrorOptions = {
  kind: HttpClientErrorKind;
  message?: string;
  status?: number;
  code?: string;
  requestId?: string;
  retryAfterSeconds?: number;
  cause?: unknown;
};

export class HttpClientError extends Error {
  readonly kind: HttpClientErrorKind;
  readonly status?: number;
  readonly code?: string;
  readonly requestId?: string;
  readonly retryAfterSeconds?: number;

  constructor(options: HttpClientErrorOptions) {
    super(options.message ?? 'Chat API request failed.', { cause: options.cause });
    this.name = 'HttpClientError';
    this.kind = options.kind;
    this.status = options.status;
    this.code = options.code;
    this.requestId = options.requestId;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

export type RateLimitHttpClientError = HttpClientError & {
  status: 429;
  retryAfterSeconds: number;
};

export function isRateLimitHttpClientError(error: unknown): error is RateLimitHttpClientError {
  return (
    error instanceof HttpClientError &&
    error.status === 429 &&
    typeof error.retryAfterSeconds === 'number' &&
    Number.isFinite(error.retryAfterSeconds) &&
    error.retryAfterSeconds > 0
  );
}
