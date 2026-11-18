import { type ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard, type ThrottlerLimitDetail } from '@nestjs/throttler';

import { RateLimitError } from '../../../common/errors/rate-limit.error';
import { UnauthorizedError } from '../../../common/errors/unauthorized.error';
import type { WidgetSessionRequest } from '../../widget-sessions/widget-session.guard';

export const MESSAGE_RATE_LIMIT = 5;
export const MESSAGE_RATE_LIMIT_WINDOW_MS = 10_000;

@Injectable()
export class MessageRateLimitGuard extends ThrottlerGuard {
  protected override async getTracker(request: WidgetSessionRequest): Promise<string> {
    const session = request.widgetSession;
    if (!session) {
      throw new UnauthorizedError('SESSION_TOKEN_INVALID', 'Session token is invalid.');
    }

    return `${session.widgetId}:${session.id}`;
  }

  protected override async throwThrottlingException(
    _context: ExecutionContext,
    detail: ThrottlerLimitDetail,
  ): Promise<void> {
    throw new RateLimitError(
      'MESSAGE_RATE_LIMITED',
      'Too many messages. Please retry later.',
      { retryAfterSeconds: detail.timeToBlockExpire },
    );
  }
}
