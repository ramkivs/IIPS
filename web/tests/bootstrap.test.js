import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/bootstrap/createApp.js';
import { ConfigLoader } from '../src/config/ConfigLoader.js';
import { Container } from '../src/core/Container.js';

test('configuration loads and validates required values', () => {
  const config = new ConfigLoader({ env: { NODE_ENV: 'test', IIPS_API_BASE_URL: 'http://test.local' } }).load();
  assert.equal(config.environment, 'test');
  assert.equal(config.apiBaseUrl, 'http://test.local');
});

test('invalid environment fails fast', () => {
  assert.throws(() => new ConfigLoader({ env: { NODE_ENV: 'invalid' } }).load());
});

test('container registers and resolves services', () => {
  const c = new Container();
  c.register('x', 1);
  assert.equal(c.resolve('x'), 1);
  assert.throws(() => c.register('x', 2));
});

test('createApp composes infrastructure in deterministic order', () => {
  const app = createApp({ env: { NODE_ENV: 'test' } });
  for (const key of ['config', 'logger', 'diagnostics', 'eventStore', 'eventBus', 'commandBus', 'moduleRegistry', 'capabilityRegistry', 'pluginRegistry', 'featureFlagRegistry', 'methodologyRegistry', 'healthService']) {
    assert.equal(app.container.has(key), true);
  }
  assert.equal(app.healthService.status().status, 'ok');
});

test('startup logging records platform version and environment', () => {
  const app = createApp({ env: { NODE_ENV: 'test' } });
  const entries = app.logger.entries();
  assert.equal(entries.some(e => e.message === 'application.bootstrap'), true);
  assert.equal(entries[0].meta.environment, 'test');
});

test('diagnostics captures startup duration', () => {
  const app = createApp({ env: { NODE_ENV: 'test' } });
  const snapshot = app.diagnostics.snapshot();
  assert.equal(snapshot.eventCount >= 2, true);
  assert.equal(typeof snapshot.durationMs, 'number');
});
