import { HttpException, type HttpStatus } from '@nestjs/common';

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

export class ApiError extends HttpException {
  constructor(
    status: HttpStatus,
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(
      { error: { code, message, ...(details ? { details } : {}) } } satisfies ApiErrorBody,
      status,
    );
  }
}
