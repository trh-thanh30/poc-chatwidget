import { HttpStatus } from '@nestjs/common';

import { ApiError } from './api-error';

export class BadRequestError extends ApiError {
  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(HttpStatus.BAD_REQUEST, code, message, details);
  }
}
