import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';

import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { DatabaseService } from '../../../database/database.service';
import { widgetSessions, widgets } from '../../../database/schema';
import { DrizzleMessageRepository } from '../repository/drizzle-message.repository';

config({ path: resolve(process.cwd(), '.env'), quiet: true });

const databaseTestEnabled = process.env.RUN_DATABASE_TESTS === '1';

describe.runIf(databaseTestEnabled)('DrizzleMessageRepository integration', () => {
  let database: DatabaseService;
  let repository: DrizzleMessageRepository;
  const widgetId = `message-repository-test-${randomUUID()}`;
  const sessionA = randomUUID();
  const sessionB = randomUUID();

  beforeAll(async () => {
    database = new DatabaseService(new ConfigService({ DATABASE_URL: process.env.DATABASE_URL }));
    repository = new DrizzleMessageRepository(database);

    await database.db.insert(widgets).values({ id: widgetId });
    await database.db.insert(widgetSessions).values([
      {
        id: sessionA,
        widgetId,
        origin: 'http://localhost:5173',
        expiresAt: new Date(Date.now() + 60_000),
      },
      {
        id: sessionB,
        widgetId,
        origin: 'http://localhost:5173',
        expiresAt: new Date(Date.now() + 60_000),
      },
    ]);
  });

  afterAll(async () => {
    await database.db.delete(widgets).where(eq(widgets.id, widgetId));
    await database.onModuleDestroy();
  });

  it('persists messages with idempotency and session isolation', async () => {
    const idempotencyKey = randomUUID();
    const visitor = {
      id: randomUUID(),
      sessionId: sessionA,
      content: 'Persisted visitor message',
      idempotencyKey,
      createdAt: new Date(),
    };

    const created = await repository.createVisitorMessage(visitor);
    const duplicate = await repository.createVisitorMessage({
      ...visitor,
      id: randomUUID(),
      content: 'Ignored duplicate payload',
    });
    await repository.createOperatorMessage({
      id: randomUUID(),
      sessionId: sessionA,
      content: 'Persisted operator reply',
      channelMessageId: `mock:reply:${visitor.id}`,
      createdAt: new Date(visitor.createdAt.getTime() + 1),
    });

    expect(created.created).toBe(true);
    expect(duplicate).toEqual({ message: created.message, created: false });
    expect(await repository.listMessages(sessionA)).toMatchObject([
      { content: 'Persisted visitor message', direction: 'visitor' },
      { content: 'Persisted operator reply', direction: 'operator' },
    ]);
    expect(await repository.listMessages(sessionB)).toEqual([]);
  });
});
