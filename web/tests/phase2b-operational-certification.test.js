import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const base = new URL('../../../validation-program/phase2b-operational-certification/', import.meta.url);

function readJson(name) { return JSON.parse(fs.readFileSync(new URL(name, base), 'utf8')); }
function exists(name) { return fs.existsSync(new URL(name, base)); }

test('Phase 2A-B Operational Engine Certification package exists and passes', () => {
  const results = readJson('phase2b-operational-certification-results.json');

  assert.equal(exists('PHASE2B_OPERATIONAL_ENGINE_CERTIFICATION_REPORT.md'), true);
  assert.equal(exists('PHASE2B_REAL_EVIDENCE_CERTIFICATION_REPORT.md'), true);
  assert.equal(exists('phase2b-real-evidence-results.json'), true);
  assert.equal(exists('PHASE2B_CERTIFICATION_LOG.md'), true);
  assert.equal(exists('EVIDENCE_COVERAGE_SUMMARY.md'), true);
  assert.equal(exists('validation-workspace-review-queue-export.json'), true);
  assert.equal(results.verdict, 'PASS');
  assert.equal(results.externallyValidatedProductionData, false);
  assert.equal(results.deterministicPilotOutputs, true);
});

test('Phase 2A-B certification targets meet promotion thresholds', () => {
  const results = readJson('phase2b-operational-certification-results.json');

  assert.equal(results.certificationTargets.engineOutputsProcessed, '17/17');
  assert.equal(results.certificationTargets.snapshotValidationSuccess, '9/9');
  assert.equal(results.certificationTargets.repositoryAppendSuccess, '17/17');
  assert.equal(results.certificationTargets.comparisonGenerationSuccess, '8/8');
  assert.equal(results.certificationTargets.currentOnlyScenarioSuccess, '1/1');
  assert.equal(results.certificationTargets.provenanceCompleteness, '9/9');
  assert.equal(results.certificationTargets.evidenceQualityCompleteness, '9/9');
  assert.equal(results.certificationTargets.validationWorkspaceRenderSuccess, '9/9');
  assert.equal(results.certificationTargets.guardrailViolations, 0);
  assert.equal(results.certificationTargets.adapterModificationsRequired, 0);
  assert.equal(results.certificationTargets.pipelineFailures, 0);
});

test('Phase 2A-B review queue export contains pilot material-change review items without recommendations', () => {
  const queue = readJson('validation-workspace-review-queue-export.json');

  assert.equal(queue.items.length, 8);
  assert.equal(queue.dataReadiness.coveragePercent, 89);
  assert.equal(queue.guardrail.includes('must not recommend buy, sell, hold'), true);
  assert.equal(queue.items.every(item => item.guardrail.includes('does not recommend')), true);
});
