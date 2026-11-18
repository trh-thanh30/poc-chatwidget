import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  createWidgetSessionClient,
  WidgetSessionApiError,
  type WidgetSessionClient,
} from '../api/widget-session.api';
import type { WidgetSessionState } from '../types/widget-session.types';

type UseWidgetSessionInput = {
  apiUrl?: string;
  widgetId?: string;
  client?: WidgetSessionClient;
};

export function useWidgetSession({
  apiUrl,
  widgetId,
  client: clientOverride,
}: UseWidgetSessionInput) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<WidgetSessionState>({ status: 'initializing' });
  const normalizedApiUrl = apiUrl?.trim();
  const normalizedWidgetId = widgetId?.trim();
  const client = useMemo(
    () => clientOverride ?? (normalizedApiUrl ? createWidgetSessionClient(normalizedApiUrl) : null),
    [clientOverride, normalizedApiUrl],
  );

  useEffect(() => {
    if (!normalizedWidgetId) {
      setState({ status: 'not-found' });
      return;
    }
    if (!client) {
      setState({ status: 'unavailable' });
      return;
    }

    const controller = new AbortController();
    setState({ status: 'initializing' });

    void client
      .createSession(normalizedWidgetId, controller.signal)
      .then((session) => {
        if (!controller.signal.aborted) setState({ status: 'ready', session });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const status = error instanceof WidgetSessionApiError ? error.kind : 'unavailable';
        setState({ status });
      });

    return () => controller.abort();
  }, [attempt, client, normalizedWidgetId]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return { state, retry };
}
