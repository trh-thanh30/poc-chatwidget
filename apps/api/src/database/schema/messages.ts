import { sql } from 'drizzle-orm';
import {
  check,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { widgetSessions } from './widgets';

export const messageDirection = pgEnum('message_direction', ['visitor', 'operator']);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => widgetSessions.id, { onDelete: 'cascade' }),
    direction: messageDirection('direction').notNull(),
    content: text('content').notNull(),
    idempotencyKey: uuid('idempotency_key'),
    channelMessageId: text('channel_message_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('messages_session_id_idempotency_key_unique').on(
      table.sessionId,
      table.idempotencyKey,
    ),
    uniqueIndex('messages_channel_message_id_unique').on(table.channelMessageId),
    index('messages_session_id_created_at_idx').on(table.sessionId, table.createdAt),
    check(
      'messages_content_length_check',
      sql`char_length(trim(${table.content})) between 1 and 2000`,
    ),
    check(
      'messages_direction_identity_check',
      sql`(${table.direction} = 'visitor' and ${table.idempotencyKey} is not null) or (${table.direction} = 'operator' and ${table.channelMessageId} is not null)`,
    ),
  ],
);
