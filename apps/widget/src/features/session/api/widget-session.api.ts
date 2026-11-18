import { createHttpClient, HttpClientError } from '../../../lib/http-client';
import type {
  CreateWidgetSessionResponse,
  WidgetSession,
  WidgetSessionFailure,
} from '../types/widget-session.types';

export interface WidgetSessionClient {
  createSession(widgetId: string, signal: AbortSignal): Promise<WidgetSession>;
}

export class WidgetSessionApiError extends Error {
  constructor(readonly kind: WidgetSessionFailure) {
    super(`Widget session bootstrap failed: ${kind}`);
    this.name = 'WidgetSessionApiError';
  }
}

export function createWidgetSessionClient(apiUrl: string): WidgetSessionClient {
  const http = createHttpClient({ baseUrl: apiUrl });

  return {
    async createSession(widgetId, signal) {
      try {
        const response = await http.post<CreateWidgetSessionResponse>(
          '/widget-sessions',
          { widgetId },
          { signal },
        );
        return response.data.data;
      } catch (error) {
        if (signal.aborted || (error instanceof HttpClientError && error.kind === 'canceled')) {
          throw error;
        }
        const status = error instanceof HttpClientError ? error.status : undefined;
        if (status === 403) throw new WidgetSessionApiError('denied');
        if (status === 404) throw new WidgetSessionApiError('not-found');
        throw new WidgetSessionApiError('unavailable');
      }
    },
  };
}
