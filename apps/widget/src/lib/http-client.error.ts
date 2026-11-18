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
