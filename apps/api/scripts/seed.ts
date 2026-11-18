import { resolve } from 'node:path';

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { widgetAllowedOrigins, widgets } from '../src/database/schema';

config({ path: resolve(__dirname, '../../../.env') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

const pool = new Pool({ connectionString: databaseUrl });
const database = drizzle(pool);

async function seed(): Promise<void> {
  try {
    await database.transaction(async (transaction) => {
      await transaction
        .insert(widgets)
        .values({ id: 'demo-widget', enabled: true })
        .onConflictDoUpdate({
          target: widgets.id,
          set: { enabled: true, updatedAt: new Date() },
        });

      await transaction
        .insert(widgetAllowedOrigins)
        .values({ widgetId: 'demo-widget', origin: 'http://localhost:5173' })
        .onConflictDoNothing();
    });

    console.log('Seeded demo-widget for http://localhost:5173.');
  } finally {
    await pool.end();
  }
}

void seed();
