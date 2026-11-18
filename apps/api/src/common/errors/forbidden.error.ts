import { HttpStatus } from '@nestjs/common';

import { ApiError } from './api-error';

export class ForbiddenError extends ApiError {
  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(HttpStatus.FORBIDDEN, code, message, details);
  }
}
