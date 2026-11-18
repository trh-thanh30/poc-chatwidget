import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { ApiExceptionFilter } from './filters/api-exception.filter';
import { HttpLoggerInterceptor } from './interceptors/http-logger.interceptor';
import { RequestContextInterceptor } from './interceptors/request-context.interceptor';

@Global()
@Module({
  providers: [
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: RequestContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: HttpLoggerInterceptor },
  ],
})
export class CommonModule {}
