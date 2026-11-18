import { describe, expect, it } from 'vitest';

import { ForbiddenError } from '../../../common/errors/forbidden.error';
import { WidgetOriginService } from '../services/widget-origin.service';

describe('WidgetOriginService', () => {
  const service = new WidgetOriginService();

  it.each([
    ['HTTP://Example.COM:80', 'http://example.com'],
    ['https://Example.COM:443', 'https://example.com'],
    ['https://Example.COM:8443', 'https://example.com:8443'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(service.normalizeRequired(input)).toBe(expected);
  });

  it.each(['ftp://example.com', 'https://example.com/path', 'https://user@example.com'])(
    'rejects %s',
    (input) => {
      try {
        service.normalizeRequired(input);
        throw new Error('Expected invalid origin to be rejected.');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenError);
        expect((error as ForbiddenError).getResponse()).toEqual({
          error: { code: 'ORIGIN_INVALID', message: 'A valid Origin header is required.' },
        });
      }
    },
  );
});
