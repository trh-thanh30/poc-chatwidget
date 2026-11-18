import type {
  NewWidgetSession,
  WidgetConfiguration,
  WidgetSessionContext,
} from '../types/widget-session.types';
import type { WidgetSessionRepository } from '../repository/widget-session.repository';

export class InMemoryWidgetSessionRepository implements WidgetSessionRepository {
  readonly sessions = new Map<string, NewWidgetSession>();
  readonly revokedSessionIds = new Set<string>();
  readonly widgets = new Map<string, WidgetConfiguration>();

  constructor() {
    this.widgets.set('demo-widget', {
      id: 'demo-widget',
      enabled: true,
      allowedOrigins: ['http://localhost:5173', 'https://partner.example'],
    });
  }

  async findWidget(widgetId: string): Promise<WidgetConfiguration | null> {
    return this.widgets.get(widgetId) ?? null;
  }

  async createSession(session: NewWidgetSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async findSession(sessionId: string): Promise<WidgetSessionContext | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    const widget = this.widgets.get(session.widgetId);
    if (!widget) return null;
    return {
      ...session,
      revokedAt: this.revokedSessionIds.has(sessionId) ? new Date() : null,
      widget,
    };
  }
}
