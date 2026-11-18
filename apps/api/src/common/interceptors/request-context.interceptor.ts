import { randomUUID } from 'node:crypto';

import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';

import type { RequestWithContext, ResponseWithContext } from '../types/request-context.types';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithContext>();
    const response = http.getResponse<ResponseWithContext>();
    const requestId = randomUUID();

    request.requestId = requestId;
    response.setHeader('x-request-id', requestId);

    return next.handle();
  }
}
