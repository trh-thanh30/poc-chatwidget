import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DatabaseService } from '../../../database/database.service';
import { widgetAllowedOrigins, widgetSessions, widgets } from '../../../database/schema';
import type {
  NewWidgetSession,
  WidgetConfiguration,
  WidgetSessionContext,
} from '../types/widget-session.types';
import type { WidgetSessionRepository } from './widget-session.repository';

@Injectable()
export class DrizzleWidgetSessionRepository implements WidgetSessionRepository {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async findWidget(widgetId: string): Promise<WidgetConfiguration | null> {
    const [widget] = await this.database.db
      .select()
      .from(widgets)
      .where(eq(widgets.id, widgetId))
      .limit(1);
    if (!widget) return null;

    const origins = await this.database.db
      .select({ origin: widgetAllowedOrigins.origin })
      .from(widgetAllowedOrigins)
      .where(eq(widgetAllowedOrigins.widgetId, widgetId));

    return {
      id: widget.id,
      enabled: widget.enabled,
      allowedOrigins: origins.map(({ origin }) => origin),
    };
  }

  async createSession(session: NewWidgetSession): Promise<void> {
    await this.database.db.insert(widgetSessions).values(session);
  }

  async findSession(sessionId: string): Promise<WidgetSessionContext | null> {
    const [session] = await this.database.db
      .select()
      .from(widgetSessions)
      .where(eq(widgetSessions.id, sessionId))
      .limit(1);
    if (!session) return null;

    const widget = await this.findWidget(session.widgetId);
    if (!widget) return null;

    return {
      id: session.id,
      widgetId: session.widgetId,
      origin: session.origin,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
      widget,
    };
  }
}
