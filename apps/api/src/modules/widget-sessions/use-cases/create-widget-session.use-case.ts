import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import { ForbiddenError } from '../../../common/errors/forbidden.error';
import { NotFoundError } from '../../../common/errors/not-found.error';
import { WIDGET_SESSION_REPOSITORY } from '../widget-session.constants';
import type { WidgetSessionRepository } from '../repository/widget-session.repository';
import { WidgetOriginService } from '../services/widget-origin.service';
import { WidgetSessionTokenService } from '../services/widget-session-token.service';

type CreateWidgetSessionInput = {
  widgetId: string;
  origin: string | undefined;
};

@Injectable()
export class CreateWidgetSessionUseCase {
  constructor(
    @Inject(WIDGET_SESSION_REPOSITORY)
    private readonly repository: WidgetSessionRepository,
    @Inject(WidgetOriginService)
    private readonly origins: WidgetOriginService,
    @Inject(WidgetSessionTokenService)
    private readonly tokens: WidgetSessionTokenService,
  ) {}

  async execute(input: CreateWidgetSessionInput) {
    const origin = this.origins.normalizeRequired(input.origin);
    const widget = await this.repository.findWidget(input.widgetId);

    if (!widget) {
      throw new NotFoundError('WIDGET_NOT_FOUND', 'Widget was not found.');
    }
    if (!widget.enabled || !widget.allowedOrigins.includes(origin)) {
      throw new ForbiddenError('ORIGIN_NOT_ALLOWED', 'This origin cannot use the widget.');
    }

    const sessionId = randomUUID();
    const issued = await this.tokens.issue({ sessionId, widgetId: widget.id, origin });
    await this.repository.createSession({
      id: sessionId,
      widgetId: widget.id,
      origin,
      expiresAt: issued.expiresAt,
    });

    return { data: { token: issued.token, expiresAt: issued.expiresAt.toISOString() } };
  }
}
