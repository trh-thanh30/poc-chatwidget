import { Test } from '@nestjs/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('AppModule composition', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('resolves all production module dependencies', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://test:test@127.0.0.1:5432/test');
    vi.stubEnv('WIDGET_SESSION_JWT_SECRET', 'test-secret-that-is-at-least-32-bytes-long');
    const { AppModule } = await import('../app.module');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

    expect(moduleRef.get(AppModule)).toBeInstanceOf(AppModule);
    await moduleRef.close();
  });
});
