import type {
  NewWidgetSession,
  WidgetConfiguration,
  WidgetSessionContext,
} from '../types/widget-session.types';

export interface WidgetSessionRepository {
  findWidget(widgetId: string): Promise<WidgetConfiguration | null>;
  createSession(session: NewWidgetSession): Promise<void>;
  findSession(sessionId: string): Promise<WidgetSessionContext | null>;
}
