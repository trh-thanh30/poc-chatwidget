import type { ArgumentsHost } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { ForbiddenError } from '../errors/forbidden.error';
import { ApiExceptionFilter } from '../filters/api-exception.filter';

function createHost() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;
  return { host, json, status };
}

describe('ApiExceptionFilter', () => {
  it('preserves stable client errors', () => {
    const { host, json, status } = createHost();

    new ApiExceptionFilter().catch(
      new ForbiddenError('ORIGIN_NOT_ALLOWED', 'Origin rejected.'),
      host,
    );

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({
      error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Origin rejected.' },
    });
  });

  it('does not expose unexpected error details', () => {
    const { host, json, status } = createHost();

    new ApiExceptionFilter().catch(new Error('database password leaked'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
    });
  });
});
