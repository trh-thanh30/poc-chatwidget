export type WidgetSession = {
  token: string;
  expiresAt: string;
};

export type WidgetSessionFailure = 'denied' | 'not-found' | 'unavailable';

export type WidgetSessionState =
  | { status: 'initializing' }
  | { status: 'ready'; session: WidgetSession }
  | { status: WidgetSessionFailure };

export type CreateWidgetSessionResponse = {
  data: WidgetSession;
};
