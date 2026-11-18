import { HttpStatus } from '@nestjs/common';

import { ApiError } from './api-error';

export class RateLimitError extends ApiError {
  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(HttpStatus.TOO_MANY_REQUESTS, code, message, details);
  }
}
