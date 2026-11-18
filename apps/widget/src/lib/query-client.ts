import { QueryClient } from '@tanstack/react-query';

export function createWidgetQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: {
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}
