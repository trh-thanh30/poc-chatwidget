import { Inject, Injectable } from '@nestjs/common';

import { ForbiddenError } from '../../../common/errors/forbidden.error';
import { UnauthorizedError } from '../../../common/errors/unauthorized.error';
import type { WidgetSessionRepository } from '../repository/widget-session.repository';
import { WidgetOriginService } from '../services/widget-origin.service';
import { WidgetSessionTokenService } from '../services/widget-session-token.service';
import { WIDGET_SESSION_REPOSITORY } from '../widget-session.constants';

type VerifyWidgetSessionInput = {
  token: string;
  origin: string | undefined;
};

@Injectable()
export class VerifyWidgetSessionUseCase {
  constructor(
    @Inject(WIDGET_SESSION_REPOSITORY)
    private readonly repository: WidgetSessionRepository,
    @Inject(WidgetOriginService)
    private readonly origins: WidgetOriginService,
    @Inject(WidgetSessionTokenService)
    private readonly tokens: WidgetSessionTokenService,
  ) {}

  async execute(input: VerifyWidgetSessionInput) {
    const claims = await this.tokens.verify(input.token);
    const origin = this.origins.normalizeRequired(input.origin);

    if (claims.origin !== origin) {
      throw new ForbiddenError(
        'SESSION_ORIGIN_MISMATCH',
        'Session token cannot be used from this origin.',
      );
    }

    const session = await this.repository.findSession(claims.sub);
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() <= Date.now() ||
      session.widgetId !== claims.wid ||
      session.origin !== claims.origin
    ) {
      throw new UnauthorizedError('SESSION_TOKEN_INVALID', 'Session token is invalid.');
    }

    if (
      !session.widget.enabled ||
      session.widget.id !== claims.wid ||
      !session.widget.allowedOrigins.includes(origin)
    ) {
      throw new ForbiddenError('WIDGET_ACCESS_REVOKED', 'Widget access is no longer allowed.');
    }

    return session;
  }
}
