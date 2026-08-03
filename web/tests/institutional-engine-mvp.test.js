import test from 'node:test';
import assert from 'node:assert/strict';
import { InstitutionalEngine, InstitutionalEngineFamily, INSTITUTIONAL_ENGINE_VERSION } from '../src/institutional-engine/index.js';
import { ResearchSnapshotAdapter, ResearchSnapshotGenerator, EngineFamily } from '../src/research-snapshot-platform/index.js';

function bankBarodaInput() {
  return {
    company: { companyId: 'CMP_BANKBARODA', ticker: 'BANKBARODA', companyName: 'Bank of Baroda', exchange: 'NSE' },
    engineFamily: InstitutionalEngineFamily.bank,
    snapshotDate: '2026-07-25',
    dataVersion: 'REAL_INPUT_READY_SCHEMA_1.0',
    metrics: {
      revenueGrowth: 14.2,
      ebitdaMargin: 24.5,
      patGrowth: 12.4,
      roce: 18.2,
      roe: 16.8,
      debtToEquity: 0.72,
      interestCoverage: 8.4,
      cfoMargin: 16.1,
      fcfMargin: 9.2,
      assetTurnover: 1.12,
      promoterHolding: 63.4,
      pledgePercent: 0,
      auditQualityScore: 82,
      intrinsicValue: 420,
      marketPrice: 261.24
    },
    evidence: [
      { evidenceId: 'EV_BANKBARODA_FINANCIALS', source: 'Company financial metrics input', asOfDate: '2026-07-25', confidence: 88, freshness: 'Verified' },
      { evidenceId: 'EV_BANKBARODA_MARKET', source: 'Market price input', asOfDate: '2026-07-25', confidence: 86, freshness: 'Verified' }
    ],
    sourceReleases: ['ISE MVP test input']
  };
}

test('Institutional Engine MVP produces one deterministic schema-valid output', () => {
  const engine = new InstitutionalEngine();
  const first = engine.score(bankBarodaInput());
  const second = engine.score(bankBarodaInput());

  assert.equal(first.ticker, 'BANKBARODA');
  assert.equal(first.engineFamily, InstitutionalEngineFamily.bank);
  assert.equal(first.engineVersion, INSTITUTIONAL_ENGINE_VERSION);
  assert.equal(typeof first.businessQuality.score, 'number');
  assert.equal(typeof first.financialStrength.score, 'number');
  assert.equal(typeof first.growth.score, 'number');
  assert.equal(typeof first.governance.score, 'number');
  assert.equal(first.valuation.intrinsicValue, 420);
  assert.equal(first.valuation.marketPrice, 261.24);
  assert.equal(first.valuation.marginOfSafety, 37.8);
  assert.equal(typeof first.confidence.overall, 'number');
  assert.equal(first.evidence.length, 2);
  assert.equal(first.guardrails.some(guardrail => guardrail.includes('must not recommend')), true);
  assert.deepEqual(first, second);
  assert.equal(Object.isFrozen(first), true);
});

test('Institutional Engine MVP output is consumed by REP adapter and snapshot generator without modification', () => {
  const engineOutput = new InstitutionalEngine().score(bankBarodaInput());
  const canonical = new ResearchSnapshotAdapter().adapt({ engineFamily: EngineFamily.bank, engineOutput });
  const result = new ResearchSnapshotGenerator().create(canonical);

  assert.equal(canonical.company.ticker, 'BANKBARODA');
  assert.equal(canonical.engineVersion, INSTITUTIONAL_ENGINE_VERSION);
  assert.equal(canonical.businessQuality.score, engineOutput.businessQuality.score);
  assert.equal(canonical.valuation.marginOfSafety, engineOutput.valuation.marginOfSafety);
  assert.equal(result.researchManifest.company.ticker, 'BANKBARODA');
  assert.equal(result.snapshot.outputs.marginOfSafety, engineOutput.valuation.marginOfSafety);
});

test('Institutional Engine MVP rejects incomplete inputs instead of fabricating output', () => {
  const engine = new InstitutionalEngine();
  const input = bankBarodaInput();
  delete input.metrics.roce;

  assert.throws(() => engine.score(input), /metrics.roce is required/);
});
