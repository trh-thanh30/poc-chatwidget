import { describe, expect, it } from 'vitest';

import { validateEnvironment } from '../env.schema';

const baseline = {
  DATABASE_URL: 'postgresql://user:password@localhost:5432/poc',
  WIDGET_SESSION_JWT_SECRET: 'test-secret-that-is-at-least-32-bytes-long',
};

describe('environment schema', () => {
  it('requires Zalo credentials and operator thread when Zalo Personal is selected', () => {
    expect(() =>
      validateEnvironment({ ...baseline, CHAT_CHANNEL: 'zalo-personal' }),
    ).toThrow();
  });

  it('keeps Mock as default and accepts complete opt-in Zalo configuration', () => {
    expect(validateEnvironment(baseline).CHAT_CHANNEL).toBe('mock');
    expect(
      validateEnvironment({
        ...baseline,
        CHAT_CHANNEL: 'zalo-personal',
        ZALO_PERSONAL_COOKIE_JSON: '[]',
        ZALO_PERSONAL_IMEI: 'poc-imei',
        ZALO_PERSONAL_USER_AGENT: 'poc-user-agent',
        ZALO_PERSONAL_OPERATOR_THREAD_ID: 'operator-thread',
        ZALO_PERSONAL_OPERATOR_THREAD_TYPE: 'group',
      }),
    ).toMatchObject({
      CHAT_CHANNEL: 'zalo-personal',
      ZALO_PERSONAL_OPERATOR_THREAD_TYPE: 'group',
    });
  });
});
