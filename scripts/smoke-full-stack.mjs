import { randomUUID } from 'node:crypto';
import { env, stdout } from 'node:process';

const request = globalThis.fetch;
const apiPort = env.FULL_API_PORT ?? '3000';
const widgetPort = env.FULL_WIDGET_PORT ?? '8082';
const allowedPort = env.FULL_ALLOWED_DEMO_PORT ?? '8080';
const blockedPort = env.FULL_BLOCKED_DEMO_PORT ?? '8081';
const api = `http://127.0.0.1:${apiPort}/api/v1`;
const allowedOrigin = `http://localhost:${allowedPort}`;
const blockedOrigin = `http://localhost:${blockedPort}`;

async function createSession(origin) {
  return request(`${api}/widget-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({ widgetId: 'demo-widget' }),
  });
}

const allowedResponse = await createSession(allowedOrigin);
const allowedBody = await allowedResponse.json();
if (allowedResponse.status !== 201 || typeof allowedBody.data?.token !== 'string') {
  throw new Error(`Allowed bootstrap failed with ${allowedResponse.status}.`);
}

const authorization = `Bearer ${allowedBody.data.token}`;
const messageResponse = await request(`${api}/messages`, {
  method: 'POST',
  headers: {
    Authorization: authorization,
    'Content-Type': 'application/json',
    Origin: allowedOrigin,
  },
  body: JSON.stringify({ content: 'Full stack smoke', idempotencyKey: randomUUID() }),
});
if (messageResponse.status !== 201) {
  throw new Error(`Message send failed with ${messageResponse.status}.`);
}

const listResponse = await request(`${api}/messages`, {
  headers: { Authorization: authorization, Origin: allowedOrigin },
});
const listBody = await listResponse.json();
const directions = listBody.data?.messages?.map((message) => message.direction) ?? [];
if (
  listResponse.status !== 200 ||
  !directions.includes('visitor') ||
  !directions.includes('operator')
) {
  throw new Error('Mock Channel round-trip did not return visitor and operator messages.');
}

const blockedResponse = await createSession(blockedOrigin);
if (blockedResponse.status !== 403) {
  throw new Error(`Blocked origin returned ${blockedResponse.status} instead of 403.`);
}

const allowedHtml = await (await request(`http://127.0.0.1:${allowedPort}/`)).text();
const blockedHtml = await (await request(`http://127.0.0.1:${blockedPort}/`)).text();
const widgetResponse = await request(`http://127.0.0.1:${widgetPort}/widget.js`);

if (!allowedHtml.includes('data-demo-access="allowed"')) {
  throw new Error('Allowed demo image has the wrong runtime mode.');
}
if (!blockedHtml.includes('data-demo-access="blocked"')) {
  throw new Error('Blocked demo image has the wrong runtime mode.');
}
if (
  widgetResponse.status !== 200 ||
  !widgetResponse.headers.get('content-type')?.includes('javascript') ||
  widgetResponse.headers.get('access-control-allow-origin') !== '*'
) {
  throw new Error('Widget static asset response is invalid.');
}

stdout.write(
  [
    'Full-stack smoke passed:',
    `- allowed origin: ${allowedResponse.status}`,
    `- Mock message round-trip: ${messageResponse.status}/${listResponse.status}`,
    `- blocked origin: ${blockedResponse.status}`,
    `- Widget asset: ${widgetResponse.status}`,
  ].join('\n') + '\n',
);
