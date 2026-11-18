import {
  type CallHandler,
  type ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  type NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import type { RequestWithContext, ResponseWithContext } from '../types/request-context.types';

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithContext>();
    const response = http.getResponse<ResponseWithContext>();
    const startedAt = performance.now();

    return next.handle().pipe(
      tap(() => this.log(request, response.statusCode, startedAt)),
      catchError((error: unknown) => {
        const status = error instanceof HttpException ? error.getStatus() : 500;
        this.log(request, status, startedAt);
        throw error;
      }),
    );
  }

  private log(request: RequestWithContext, status: number, startedAt: number): void {
    const durationMs = Number((performance.now() - startedAt).toFixed(2));
    this.logger.log({
      durationMs,
      method: request.method ?? 'UNKNOWN',
      path: request.originalUrl ?? request.url ?? 'unknown',
      requestId: request.requestId ?? 'unknown',
      status,
    });
  }
}
