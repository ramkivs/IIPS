import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function read(path) {
  return readFileSync(new URL(`../../../validation-program/${path}`, import.meta.url), 'utf8');
}

function parseCsv(text) {
  const [headerLine, ...lines] = text.trim().split('\n');
  const headers = headerLine.split(',').map(header => header.trim());
  return lines.map(line => {
    const values = [];
    let current = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') quoted = !quoted;
      else if (char === ',' && !quoted) { values.push(current); current = ''; }
      else current += char;
    }
    values.push(current);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
  });
}

test('Validation Dataset v1.0 candidate exceeds minimum company coverage gate', () => {
  const rows = parseCsv(read('VALIDATION_DATASET_v1.0_CANDIDATE.csv'));
  const groups = new Set(rows.map(row => row['Validation Group']));

  assert.equal(rows.length >= 150, true);
  assert.equal(groups.has('Edge Cases'), true);
  assert.equal(rows.some(row => (row.Notes || '').toLowerCase().includes('turnaround')), true);
  assert.equal(rows.some(row => (row.Notes || '').toLowerCase().includes('high debt')), true);
  assert.equal(rows.some(row => (row.Notes || '').toLowerCase().includes('recent')), true);
});

test('Validation Scorecard schema defines required scoring areas', () => {
  const schema = read('VALIDATION_SCORECARD_SCHEMA_v1.0.md');

  for (const area of ['Overview', 'Business Quality', 'Valuation', 'Investment Decision', 'Evidence Quality', 'UX']) {
    assert.equal(schema.includes(area), true);
  }
  assert.equal(schema.includes('Required Metadata'), true);
});

test('Release gates define architecture, evidence, and dataset thresholds', () => {
  const gates = read('RELEASE_GATES_v1.0.md');

  assert.equal(gates.includes('| Architecture drift | 0 |'), true);
  assert.equal(gates.includes('| Guardrail violations | 0 |'), true);
  assert.equal(gates.includes('| Evidence freshness | ≥ 95% |'), true);
  assert.equal(gates.includes('| Validation dataset coverage | ≥ 150 companies |'), true);
  assert.equal(gates.includes('Release blocked'), true);
});

test('Validation Program v1.0 keeps operational validation out of Company Workspace architecture', () => {
  const program = read('VALIDATION_PROGRAM_v1.0.md');

  assert.equal(program.includes('Company Workspace architecture changes'), true);
  assert.equal(program.includes('FeatureView changes'), true);
  assert.equal(program.includes('Run Validation Workspace batch'), true);
});
