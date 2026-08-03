import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const outputsPath = new URL('../../../validation-program/pilot-ise-outputs.json', import.meta.url);
const certificationPath = new URL('../../../validation-program/pilot-engine-outputs/pilot-engine-output-certification.json', import.meta.url);

test('Pilot Engine Outputs exist for all Phase 2A-B pilot companies', () => {
  const outputs = JSON.parse(fs.readFileSync(outputsPath, 'utf8'));
  const certification = JSON.parse(fs.readFileSync(certificationPath, 'utf8'));
  const tickers = new Set(outputs.map(item => item.ticker));

  assert.equal(certification.status, 'PASS');
  assert.equal(certification.pilotCompanies, 9);
  assert.equal(certification.engineOutputs, 17);
  assert.deepEqual([...tickers].sort(), ['BANKBARODA','CRAMC','ECOSMOBLTY','ELECON','EMAMILTD','RAJOOENG','RATEGAIN','SIGMA','SUZLON'].sort());
  assert.equal(outputs.filter(item => item.ticker === 'ECOSMOBLTY').length, 1);
  assert.equal(outputs.filter(item => item.ticker !== 'ECOSMOBLTY').every(item => ['previous','current'].includes(item.period)), true);
});

test('Pilot Engine Output certification verifies determinism, schema, REP compatibility, evidence, provenance, and guardrails', () => {
  const certification = JSON.parse(fs.readFileSync(certificationPath, 'utf8'));

  assert.equal(certification.certification.every(row => row.deterministic === 'Pass'), true);
  assert.equal(certification.certification.every(row => row.schemaValid === 'Pass'), true);
  assert.equal(certification.certification.every(row => row.repAdapterAccepted === 'Pass'), true);
  assert.equal(certification.certification.every(row => row.repositoryAppend === 'Pass'), true);
  assert.equal(certification.certification.every(row => row.evidenceMetadataComplete === 'Pass'), true);
  assert.equal(certification.certification.every(row => row.provenanceComplete === 'Pass'), true);
  assert.equal(certification.certification.every(row => row.guardrailsRespected === 'Pass'), true);
  assert.equal(certification.certification.every(row => row.directRepositoryWrite === 'No'), true);
  assert.equal(certification.certification.every(row => row.classification === 'Success'), true);
});
