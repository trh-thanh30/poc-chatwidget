import { describe, expect, it } from 'vitest';

import { HealthController } from '../health.controller';

describe('HealthController', () => {
  it('reports a healthy API skeleton', () => {
    expect(new HealthController().health()).toEqual({
      service: 'chat-widget-api',
      status: 'ok',
    });
  });
});
