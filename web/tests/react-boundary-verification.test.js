import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const reactRoot = new URL('../src/react-app/', import.meta.url).pathname;

function listFiles(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

test('React presentation layer does not import backend/domain implementation modules', () => {
  const files = listFiles(reactRoot).filter(file => /\.(ts|tsx)$/.test(file));
  const forbiddenImports = [
    '../institutional-engine',
    '../research-snapshot-platform',
    '../workspaces/company',
    '../workspaces/validation',
    '../scoring-framework',
    '../valuation-framework',
    '../portfolio-framework',
    '../../institutional-engine',
    '../../research-snapshot-platform',
    '../../workspaces/company',
    '../../workspaces/validation',
    '../../scoring-framework',
    '../../valuation-framework',
    '../../portfolio-framework'
  ];

  const violations = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const forbidden of forbiddenImports) {
      if (text.includes(forbidden)) violations.push({ file, forbidden });
    }
  }

  assert.deepEqual(violations, []);
});

test('React components do not call fetch directly; transport is isolated to provider adapters', () => {
  const files = listFiles(reactRoot).filter(file => /\.(ts|tsx)$/.test(file));
  const violations = [];
  for (const file of files) {
    const relative = file.replace(reactRoot, '');
    const text = readFileSync(file, 'utf8');
    if (text.includes('fetch(') && !relative.startsWith('services/')) violations.push(relative);
  }

  assert.deepEqual(violations, []);
});

test('React presentation components do not import fixtures, API providers, or transport services directly', () => {
  const componentRoot = new URL('../src/react-app/components/', import.meta.url).pathname;
  const files = listFiles(componentRoot).filter(file => /\.(ts|tsx)$/.test(file));
  const forbidden = ['../fixtures', '../../fixtures', '../services', '../../services', 'fetch('];
  const violations = [];

  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const marker of forbidden) {
      if (text.includes(marker)) violations.push({ file: file.replace(reactRoot, ''), marker });
    }
  }

  assert.deepEqual(violations, []);
});

test('React source does not include recommendation action literals outside guardrail tests', () => {
  const files = listFiles(reactRoot).filter(file => /\.(ts|tsx)$/.test(file) && !file.endsWith('.test.tsx') && !file.endsWith('.test.ts'));
  const forbidden = ['Buy', 'Sell', 'Hold', 'Trim', 'Exit'];
  const violations = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const word of forbidden) {
      if (new RegExp(`\\b${word}\\b`).test(text)) violations.push({ file: file.replace(reactRoot, ''), word });
    }
  }

  assert.deepEqual(violations, []);
});
