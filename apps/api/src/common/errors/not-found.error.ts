import { HttpStatus } from '@nestjs/common';

import { ApiError } from './api-error';

export class NotFoundError extends ApiError {
  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(HttpStatus.NOT_FOUND, code, message, details);
  }
}
