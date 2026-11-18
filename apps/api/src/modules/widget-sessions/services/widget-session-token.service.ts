import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UnauthorizedError } from '../../../common/errors/unauthorized.error';
import { WIDGET_SESSION_OPTIONS } from '../widget-session.constants';
import type { WidgetSessionOptions } from '../types/widget-session-options.types';
import type { WidgetSessionTokenClaims } from '../types/widget-session.types';

type IssueWidgetSessionTokenInput = {
  sessionId: string;
  widgetId: string;
  origin: string;
};

@Injectable()
export class WidgetSessionTokenService {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(WIDGET_SESSION_OPTIONS) private readonly options: WidgetSessionOptions,
  ) {}

  async issue(input: IssueWidgetSessionTokenInput) {
    const expiresAt = new Date(Date.now() + this.options.ttlSeconds * 1000);
    const token = await this.jwtService.signAsync(
      { wid: input.widgetId, origin: input.origin },
      {
        subject: input.sessionId,
        jwtid: randomUUID(),
        issuer: this.options.issuer,
        audience: this.options.audience,
        expiresIn: this.options.ttlSeconds,
      },
    );

    return { token, expiresAt };
  }

  async verify(token: string): Promise<WidgetSessionTokenClaims> {
    try {
      const claims = await this.jwtService.verifyAsync<WidgetSessionTokenClaims>(token, {
        algorithms: ['HS256'],
        issuer: this.options.issuer,
        audience: this.options.audience,
      });
      if (!claims.sub || !claims.wid || !claims.origin || !claims.jti)
        throw new Error('Missing claims');
      return claims;
    } catch {
      throw new UnauthorizedError('SESSION_TOKEN_INVALID', 'Session token is invalid.');
    }
  }
}
