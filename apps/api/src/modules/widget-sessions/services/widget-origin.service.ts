import { Injectable } from '@nestjs/common';

import { ForbiddenError } from '../../../common/errors/forbidden.error';

const HTTP_PROTOCOLS = new Set(['http:', 'https:']);

@Injectable()
export class WidgetOriginService {
  normalizeRequired(value: string | undefined): string {
    if (!value) {
      throw new ForbiddenError('ORIGIN_REQUIRED', 'A valid Origin header is required.');
    }

    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new ForbiddenError('ORIGIN_INVALID', 'A valid Origin header is required.');
    }

    if (
      !HTTP_PROTOCOLS.has(url.protocol) ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    ) {
      throw new ForbiddenError('ORIGIN_INVALID', 'A valid Origin header is required.');
    }

    return url.origin;
  }
}
