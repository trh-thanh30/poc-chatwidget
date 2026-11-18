import type { ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { RequestContextInterceptor } from '../interceptors/request-context.interceptor';

describe('RequestContextInterceptor', () => {
  it('assigns a server-generated request ID and response header', async () => {
    const request: { requestId?: string } = {};
    const setHeader = vi.fn();
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({ setHeader }),
      }),
    } as unknown as ExecutionContext;

    await new Promise<void>((resolve) => {
      new RequestContextInterceptor()
        .intercept(context, { handle: () => of('ok') })
        .subscribe(() => resolve());
    });

    expect(request.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(setHeader).toHaveBeenCalledWith('x-request-id', request.requestId);
  });
});
