import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const base = new URL('../../../validation-program/operational-cycle-2/', import.meta.url);
function readJson(name) { return JSON.parse(fs.readFileSync(new URL(name, base), 'utf8')); }
function exists(name) { return fs.existsSync(new URL(name, base)); }

test('Portfolio-scale snapshot run produces required Cycle #2 artifacts', () => {
  assert.equal(exists('portfolio-scale-snapshot-results.json'), true);
  assert.equal(exists('validation-workspace-review-queue-export.json'), true);
  assert.equal(exists('PORTFOLIO_SCALE_SNAPSHOT_RUN_REPORT.md'), true);
  assert.equal(exists('OPERATIONAL_VALIDATION_CYCLE_2_REPORT.md'), true);
});

test('Portfolio-scale snapshot telemetry reaches 100 percent comparison coverage', () => {
  const results = readJson('portfolio-scale-snapshot-results.json');
  const telemetry = results.telemetry;

  assert.equal(telemetry.status, 'PASS');
  assert.equal(telemetry.holdingsProcessed, 66);
  assert.equal(telemetry.holdingsTarget, 66);
  assert.equal(telemetry.snapshotGenerationSuccess, 132);
  assert.equal(telemetry.snapshotGenerationTarget, 132);
  assert.equal(telemetry.repositoryAppendSuccess, 132);
  assert.equal(telemetry.repositoryAppendTarget, 132);
  assert.equal(telemetry.comparisonsGenerated, 66);
  assert.equal(telemetry.comparisonsTarget, 66);
  assert.equal(telemetry.failedHoldings.length, 0);
  assert.equal(telemetry.retryCount, 0);
  assert.equal(telemetry.dataReadiness.status, 'Ready');
  assert.equal(telemetry.dataReadiness.coveragePercent, 100);
});

test('Operational Validation Cycle #2 creates review queue without investment recommendations', () => {
  const queue = readJson('validation-workspace-review-queue-export.json');

  assert.equal(queue.items.length, 66);
  assert.equal(queue.dataReadiness.coveragePercent, 100);
  assert.equal(queue.guardrail.includes('must not recommend buy, sell, hold'), true);
  assert.equal(queue.items.every(item => item.guardrail.includes('does not recommend')), true);
});
