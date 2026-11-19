import { resolve } from 'node:path';

import { config } from 'dotenv';
import { ThreadType, Zalo, type Credentials } from 'zca-js';

config({ path: resolve(__dirname, '../../../.env') });

const DISCOVERY_MESSAGE = 'discover-thread';

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function parseCookie(value: string): Credentials['cookie'] {
  const cookie: unknown = JSON.parse(value);
  if (!Array.isArray(cookie)) {
    throw new Error('ZALO_PERSONAL_COOKIE_JSON must be a JSON array.');
  }
  return cookie as Credentials['cookie'];
}

async function discoverThread(): Promise<void> {
  const api = await new Zalo().login({
    cookie: parseCookie(requiredEnvironment('ZALO_PERSONAL_COOKIE_JSON')),
    imei: requiredEnvironment('ZALO_PERSONAL_IMEI'),
    userAgent: requiredEnvironment('ZALO_PERSONAL_USER_AGENT'),
  });

  const stop = (): void => api.listener.stop();
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);

  api.listener.on('message', (message) => {
    if (message.isSelf || message.data.content !== DISCOVERY_MESSAGE) return;

    const threadType = message.type === ThreadType.Group ? 'group' : 'user';
    console.log('\nThread discovered. Add these values to the root .env:\n');
    console.log(`ZALO_PERSONAL_OPERATOR_THREAD_ID=${message.threadId}`);
    console.log(`ZALO_PERSONAL_OPERATOR_THREAD_TYPE=${threadType}`);
    stop();
  });

  api.listener.start();
  console.log(`Waiting for an operator to send exactly "${DISCOVERY_MESSAGE}".`);
  console.log('Press Ctrl+C to stop. Do not run the API or Zalo Web listener at the same time.');
}

discoverThread().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown Zalo discovery error.';
  console.error(`Unable to start Zalo thread discovery: ${message}`);
  process.exitCode = 1;
});
