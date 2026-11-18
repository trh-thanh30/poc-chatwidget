import { boolean, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const widgets = pgTable('widgets', {
  id: text('id').primaryKey(),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const widgetAllowedOrigins = pgTable(
  'widget_allowed_origins',
  {
    widgetId: text('widget_id')
      .notNull()
      .references(() => widgets.id, { onDelete: 'cascade' }),
    origin: text('origin').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.widgetId, table.origin] })],
);

export const widgetSessions = pgTable('widget_sessions', {
  id: uuid('id').primaryKey(),
  widgetId: text('widget_id')
    .notNull()
    .references(() => widgets.id, { onDelete: 'cascade' }),
  origin: text('origin').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
