import { type CanActivate, type ExecutionContext, Inject, Injectable } from '@nestjs/common';

import { UnauthorizedError } from '../../common/errors/unauthorized.error';
import type { WidgetSessionContext } from './types/widget-session.types';
import { VerifyWidgetSessionUseCase } from './use-cases/verify-widget-session.use-case';

export type WidgetSessionRequest = {
  headers: {
    authorization?: string;
    origin?: string;
  };
  widgetSession?: WidgetSessionContext;
};

@Injectable()
export class WidgetSessionGuard implements CanActivate {
  constructor(
    @Inject(VerifyWidgetSessionUseCase)
    private readonly verifyWidgetSession: VerifyWidgetSessionUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<WidgetSessionRequest>();
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;

    if (!token) {
      throw new UnauthorizedError('SESSION_TOKEN_INVALID', 'Session token is invalid.');
    }

    request.widgetSession = await this.verifyWidgetSession.execute({
      token,
      origin: request.headers.origin,
    });
    return true;
  }
}
