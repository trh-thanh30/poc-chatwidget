import { HttpStatus } from '@nestjs/common';

import { ApiError } from './api-error';

export class UnauthorizedError extends ApiError {
  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(HttpStatus.UNAUTHORIZED, code, message, details);
  }
}
