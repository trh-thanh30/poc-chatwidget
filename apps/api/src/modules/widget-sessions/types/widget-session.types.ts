export type WidgetConfiguration = {
  id: string;
  enabled: boolean;
  allowedOrigins: string[];
};

export type NewWidgetSession = {
  id: string;
  widgetId: string;
  origin: string;
  expiresAt: Date;
};

export type WidgetSessionContext = NewWidgetSession & {
  revokedAt: Date | null;
  widget: WidgetConfiguration;
};

export type WidgetSessionTokenClaims = {
  sub: string;
  wid: string;
  origin: string;
  jti: string;
};
