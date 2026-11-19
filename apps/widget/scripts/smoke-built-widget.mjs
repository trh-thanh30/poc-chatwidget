import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stdout } from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';
import { URL } from 'node:url';

import { JSDOM, VirtualConsole } from 'jsdom';

const bundle = await readFile(new URL('../dist/widget.js', import.meta.url), 'utf8');
const virtualConsole = new VirtualConsole();
const runtimeErrors = [];

virtualConsole.on('jsdomError', (error) => runtimeErrors.push(error));

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  pretendToBeVisual: true,
  runScripts: 'dangerously',
  url: 'http://localhost:5173/',
  virtualConsole,
});

dom.window.addEventListener('error', (event) => {
  runtimeErrors.push(event.error ?? new Error(event.message));
});

const script = dom.window.document.createElement('script');
script.dataset.widgetId = 'smoke-widget';
script.textContent = bundle;
dom.window.document.body.append(script);

await delay(50);

const host = dom.window.document.getElementById('poc-chatwidget-root');
const launcher = host?.shadowRoot?.querySelector('button[aria-label="Mở cửa sổ chat"]');

try {
  assert.equal(runtimeErrors.length, 0, runtimeErrors[0]?.message ?? 'Widget runtime failed.');
  assert.ok(host?.shadowRoot, 'Built Widget did not create its Shadow Root.');
  assert.ok(launcher, 'Built Widget did not render its launcher.');
  stdout.write('Built Widget smoke check passed.\n');
} finally {
  dom.window.close();
}
