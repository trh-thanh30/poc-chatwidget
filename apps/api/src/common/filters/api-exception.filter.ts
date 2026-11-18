import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import type { ApiErrorBody } from '../errors/api-error';

type HttpResponse = {
  status(code: number): { json(body: ApiErrorBody): unknown };
};

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (!value || typeof value !== 'object' || !('error' in value)) return false;
  const error = value.error;
  return (
    !!error &&
    typeof error === 'object' &&
    'code' in error &&
    typeof error.code === 'string' &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<HttpResponse>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionBody = exception instanceof HttpException ? exception.getResponse() : null;

    if (isApiErrorBody(exceptionBody)) {
      response.status(status).json(exceptionBody);
      return;
    }

    response.status(status).json({
      error: {
        code: status >= 500 ? 'INTERNAL_ERROR' : 'HTTP_ERROR',
        message:
          status >= 500 ? 'An unexpected error occurred.' : 'The request could not be completed.',
      },
    });
  }
}
