import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ResearchSnapshotGenerator,
  ResearchSnapshotRepository,
  compareResearchSnapshots,
  compareLatestResearchSnapshotPairs,
  RESEARCH_SNAPSHOT_SCHEMA_VERSION,
  ResearchMaterialChangeType,
  ResearchSnapshotAdapter,
  EngineFamily,
  MATERIAL_CHANGE_ENGINE_VERSION
} from '../src/research-snapshot-platform/index.js';

function snapshotInput({ snapshotDate = '2026-07-01', businessQuality = 84, confidence = 92, marginOfSafety = 38, valuationRead = 'Attractive', governance = 82 } = {}) {
  return {
    company: { companyId: 'CMP_BANKBARODA', ticker: 'BANKBARODA', companyName: 'Bank of Baroda', exchange: 'NSE' },
    snapshotDate,
    engineVersion: '1.0.0',
    platformVersion: 'IIPS_2.0',
    businessQuality: { score: businessQuality, read: 'Strong', confidence: 90 },
    financialStrength: { score: 81, read: 'Strong', confidence: 88 },
    growth: { score: 74, read: 'Moderate', confidence: 84 },
    governance: { score: governance, read: 'Acceptable', confidence: 86 },
    valuation: { intrinsicValue: 420, marketPrice: 261, marginOfSafety, read: valuationRead, method: 'Institutional Engine' },
    confidence: { overall: confidence, evidence: confidence, valuation: 88, freshness: 'High' },
    explanation: { summary: 'Banking franchise analysis snapshot.', drivers: ['Credit growth'], risks: ['Credit cycle'], watchItems: ['Asset quality'] },
    evidence: [{ evidenceId: 'EV_BANKBARODA_Q1', source: 'Quarterly result', asOfDate: snapshotDate, confidence, freshness: 'High' }],
    source: { providerVersions: ['IIPS_ENGINE@1.0.0'], dataVersion: 'DATA_2026_Q2', sourceReleases: ['Company Workspace v1.0'] }
  };
}

test('Research Snapshot Adapter normalizes engine-specific terminology into Research Snapshot v1.0 input', () => {
  const adapter = new ResearchSnapshotAdapter();
  const bankOutput = {
    company_id: 'CMP_BANKBARODA',
    symbol: 'BANKBARODA',
    name: 'Bank of Baroda',
    exchange: 'NSE',
    asOfDate: '2026-07-01',
    modelVersion: 'BANK_ENGINE_1.0',
    qualityScore: { value: 84, label: 'Strong', confidenceScore: 90 },
    financialScore: { value: 81, label: 'Strong', confidenceScore: 88 },
    growthScore: { value: 74, label: 'Moderate', confidenceScore: 84 },
    governanceScore: { value: 82, label: 'Acceptable', confidenceScore: 86 },
    valuation: { fairValue: 420, marketPrice: 261, mos: 38, classification: 'Attractive', method: 'Bank Engine' },
    confidenceScore: 92,
    evidenceConfidence: 91,
    explanation: { headline: 'Banking franchise snapshot.', positives: ['Credit growth'], concerns: ['Credit cycle'], followUps: ['Asset quality'] },
    evidenceItems: [{ id: 'EV_BANK_Q1', provider: 'Quarterly result', date: '2026-07-01', confidenceScore: 91, freshness: 'High' }],
    providerVersions: ['BANK_ENGINE@1.0']
  };

  const canonical = adapter.adapt({ engineFamily: EngineFamily.bank, engineOutput: bankOutput });

  assert.equal(canonical.company.companyId, 'CMP_BANKBARODA');
  assert.equal(canonical.company.ticker, 'BANKBARODA');
  assert.equal(canonical.engineVersion, 'BANK_ENGINE_1.0');
  assert.equal(canonical.businessQuality.score, 84);
  assert.equal(canonical.financialStrength.score, 81);
  assert.equal(canonical.valuation.intrinsicValue, 420);
  assert.equal(canonical.valuation.marginOfSafety, 38);
  assert.equal(canonical.confidence.overall, 92);
  assert.equal(canonical.explanation.drivers[0], 'Credit growth');
  assert.equal(Object.isFrozen(canonical), true);
});

test('Research Snapshot Adapter lets generator stay engine-agnostic', () => {
  const adapter = new ResearchSnapshotAdapter();
  const generator = new ResearchSnapshotGenerator();
  const canonical = adapter.adapt({
    engineFamily: EngineFamily.microcap,
    engineOutput: {
      companyId: 'CMP_MICRO_1',
      ticker: 'MICROCAP',
      companyName: 'Microcap Example',
      snapshotDate: '2026-07-01',
      engineVersion: 'MICRO_ENGINE_1.0',
      compositeScore: 76,
      financialStrength: { score: 70 },
      growth: { score: 82 },
      governance: { score: 68 },
      intrinsicValue: 140,
      marketPrice: 100,
      marginOfSafety: 29,
      confidence: { overall: 80, freshness: 'Medium' }
    }
  });
  const result = generator.create(canonical);

  assert.equal(result.researchManifest.company.ticker, 'MICROCAP');
  assert.equal(result.researchManifest.businessQuality.score, 76);
  assert.equal(result.snapshot.outputs.marginOfSafety, 29);
});

test('Research Snapshot Generator creates immutable canonical snapshots using existing snapshot engine', () => {
  const repository = new ResearchSnapshotRepository();
  const generator = new ResearchSnapshotGenerator({ snapshotStore: repository.snapshotStore });
  const result = generator.create(snapshotInput());

  assert.equal(result.researchManifest.schemaVersion, RESEARCH_SNAPSHOT_SCHEMA_VERSION);
  assert.equal(result.researchManifest.company.ticker, 'BANKBARODA');
  assert.equal(result.snapshot.subject.type, 'research-snapshot');
  assert.equal(result.snapshot.subject.id, 'CMP_BANKBARODA');
  assert.equal(result.snapshot.outputs.marginOfSafety, 38);
  assert.equal(repository.list().length, 1);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.researchManifest), true);
  assert.equal(Object.isFrozen(result.snapshot), true);
  assert.equal(result.researchManifest.guardrails.some(guardrail => guardrail.includes('do not recommend investment actions')), true);
});

test('Research Snapshot Repository is append-only and resolves latest pairs', () => {
  const repository = new ResearchSnapshotRepository();
  const generator = new ResearchSnapshotGenerator({ snapshotStore: repository.snapshotStore });
  const previous = generator.create(snapshotInput({ snapshotDate: '2026-04-01' })).snapshot;
  const current = generator.create(snapshotInput({ snapshotDate: '2026-07-01', marginOfSafety: 24 })).snapshot;
  const pair = repository.latestPair('CMP_BANKBARODA');

  assert.equal(pair.previous.snapshot_id, previous.snapshot_id);
  assert.equal(pair.current.snapshot_id, current.snapshot_id);
  assert.throws(() => repository.append(current));
  assert.equal(repository.pointInTime({ companyId: 'CMP_BANKBARODA', asOf: '2026-05-01T00:00:00.000Z' }).snapshot_id, previous.snapshot_id);
});

test('Material Change Engine compares research snapshots into Validation Workspace-compatible changes', () => {
  const repository = new ResearchSnapshotRepository();
  const generator = new ResearchSnapshotGenerator({ snapshotStore: repository.snapshotStore });
  const previous = generator.create(snapshotInput({ snapshotDate: '2026-04-01', marginOfSafety: 41, confidence: 93, businessQuality: 84 })).snapshot;
  const current = generator.create(snapshotInput({ snapshotDate: '2026-07-01', marginOfSafety: 28, confidence: 88, businessQuality: 84, valuationRead: 'Less Attractive' })).snapshot;
  const comparison = compareResearchSnapshots({ previous, current });

  assert.equal(comparison.ticker, 'BANKBARODA');
  assert.equal(comparison.materialChange, true);
  assert.equal(comparison.reviewStatus, 'Needs Review');
  assert.equal(comparison.changes.some(change => change.type === ResearchMaterialChangeType.valuation), true);
  assert.equal(comparison.changes.some(change => change.message.includes('MOS changed')), true);
  assert.equal(comparison.previous.marginOfSafety, 41);
  assert.equal(comparison.current.marginOfSafety, 28);
  assert.equal(comparison.provenance.previousSnapshotId, previous.snapshot_id);
  assert.equal(comparison.provenance.currentSnapshotId, current.snapshot_id);
  assert.equal(comparison.provenance.producerEngineVersion, '1.0.0');
  assert.equal(comparison.provenance.researchSnapshotContractVersion, RESEARCH_SNAPSHOT_SCHEMA_VERSION);
  assert.equal(comparison.provenance.evidenceQuality, 'Certified');
  assert.equal(comparison.provenance.comparisonEngineVersion, MATERIAL_CHANGE_ENGINE_VERSION);
  assert.equal(comparison.guardrail.includes('do not recommend investment actions'), true);
});

test('Material Change Engine supports batch comparison of latest research snapshot pairs', () => {
  const repository = new ResearchSnapshotRepository();
  const generator = new ResearchSnapshotGenerator({ snapshotStore: repository.snapshotStore });
  generator.create(snapshotInput({ snapshotDate: '2026-04-01', marginOfSafety: 41 }));
  generator.create(snapshotInput({ snapshotDate: '2026-07-01', marginOfSafety: 28 }));

  const comparisons = compareLatestResearchSnapshotPairs({ repository, companyIds: ['CMP_BANKBARODA', 'CMP_MISSING'] });

  assert.equal(comparisons.length, 1);
  assert.equal(comparisons[0].ticker, 'BANKBARODA');
  assert.equal(Object.isFrozen(comparisons), true);
});
