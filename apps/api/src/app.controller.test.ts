import { describe, expect, it } from 'vitest';

import { AppController } from './app.controller';

describe('AppController', () => {
  it('reports a healthy API skeleton', () => {
    expect(new AppController().health()).toEqual({
      service: 'chat-widget-api',
      status: 'ok',
    });
  });
});
