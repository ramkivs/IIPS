import { RESEARCH_SNAPSHOT_SCHEMA_VERSION, deepFreeze } from './ResearchSnapshotSchema.js';

export const MATERIAL_CHANGE_ENGINE_VERSION = '1.0.0';

export const ResearchMaterialChangeType = Object.freeze({
  businessQuality: 'Business Quality',
  financialStrength: 'Financial Strength',
  valuation: 'Valuation',
  confidence: 'Evidence',
  governance: 'Governance',
  stable: 'Stable'
});

export function compareResearchSnapshots({ previous, current, thresholds = {} }) {
  if (!previous || !current) throw new Error('previous and current research snapshots are required');
  const previousManifest = previous.inputs?.researchManifest ?? previous.researchManifest ?? previous;
  const currentManifest = current.inputs?.researchManifest ?? current.researchManifest ?? current;
  const changes = [];

  const qualityDrop = thresholds.businessQualityDrop ?? 5;
  const confidenceDrop = thresholds.confidenceDrop ?? 10;
  const mosDrop = thresholds.marginOfSafetyDrop ?? 10;
  const governanceDrop = thresholds.governanceDrop ?? 5;

  addNumericDropChange({ changes, type: ResearchMaterialChangeType.businessQuality, label: 'Business Quality', previousValue: previousManifest.businessQuality.score, currentValue: currentManifest.businessQuality.score, threshold: qualityDrop, severity: 'Medium' });
  addNumericDropChange({ changes, type: ResearchMaterialChangeType.confidence, label: 'Evidence Confidence', previousValue: previousManifest.confidence.overall, currentValue: currentManifest.confidence.overall, threshold: confidenceDrop, severity: 'High' });
  addNumericDropChange({ changes, type: ResearchMaterialChangeType.valuation, label: 'MOS', previousValue: previousManifest.valuation.marginOfSafety, currentValue: currentManifest.valuation.marginOfSafety, threshold: mosDrop, severity: 'High' });
  addNumericDropChange({ changes, type: ResearchMaterialChangeType.governance, label: 'Governance', previousValue: previousManifest.governance.score, currentValue: currentManifest.governance.score, threshold: governanceDrop, severity: 'Medium' });

  if (previousManifest.valuation.read !== currentManifest.valuation.read) {
    changes.push(Object.freeze({ type: ResearchMaterialChangeType.valuation, severity: 'Medium', message: `Valuation changed from ${previousManifest.valuation.read} to ${currentManifest.valuation.read}`, delta: null }));
  }

  if (changes.length === 0) changes.push(Object.freeze({ type: ResearchMaterialChangeType.stable, severity: 'None', message: 'No material change detected', delta: 0 }));

  return deepFreeze({
    ticker: currentManifest.company.ticker,
    companyId: currentManifest.company.companyId,
    company: currentManifest.company.companyName,
    previous: toValidationSnapshot(previousManifest),
    current: toValidationSnapshot(currentManifest),
    changes,
    materialChange: changes.some(change => change.type !== ResearchMaterialChangeType.stable),
    reviewStatus: changes.some(change => change.severity === 'High') ? 'Needs Review' : 'Stable',
    source: 'Research Snapshot Platform',
    provenance: createMaterialChangeProvenance({ previous, current, previousManifest, currentManifest }),
    guardrail: 'Material changes indicate review needs only and do not recommend investment actions.'
  });
}

export function compareLatestResearchSnapshotPairs({ repository, companyIds, thresholds = {} }) {
  return deepFreeze(companyIds.flatMap(companyId => {
    const pair = repository.latestPair(companyId);
    return pair ? [compareResearchSnapshots({ ...pair, thresholds })] : [];
  }));
}


function createMaterialChangeProvenance({ previous, current, previousManifest, currentManifest }) {
  return Object.freeze({
    previousSnapshotId: previous.snapshot_id ?? previousManifest.snapshotId ?? null,
    currentSnapshotId: current.snapshot_id ?? currentManifest.snapshotId ?? null,
    producerEngineVersion: currentManifest.engineVersion,
    researchSnapshotContractVersion: currentManifest.schemaVersion ?? RESEARCH_SNAPSHOT_SCHEMA_VERSION,
    evidenceQuality: inferEvidenceQuality(currentManifest),
    comparisonTimestamp: new Date().toISOString(),
    comparisonEngineVersion: MATERIAL_CHANGE_ENGINE_VERSION
  });
}

function inferEvidenceQuality(manifest) {
  const evidence = manifest.evidence ?? [];
  if (evidence.length === 0) return 'Missing';
  const states = evidence.map(item => item.freshness).filter(Boolean);
  if (states.includes('Missing')) return 'Missing';
  if (states.includes('Incomplete') || states.includes('Stale')) return 'Incomplete';
  if (states.includes('Provisional')) return 'Provisional';
  if (states.includes('Verified')) return 'Verified';
  if (states.includes('Certified') || states.includes('High')) return 'Certified';
  if (Number(manifest.confidence?.overall ?? 0) < 70) return 'Provisional';
  return 'Verified';
}

function addNumericDropChange({ changes, type, label, previousValue, currentValue, threshold, severity }) {
  if (previousValue === null || currentValue === null || previousValue === undefined || currentValue === undefined) return;
  const delta = round(Number(currentValue) - Number(previousValue));
  if (delta <= -threshold) changes.push(Object.freeze({ type, severity, message: `${label} changed from ${previousValue} to ${currentValue}`, delta }));
}

function toValidationSnapshot(manifest) {
  return Object.freeze({
    ticker: manifest.company.ticker,
    date: manifest.snapshotDate,
    marginOfSafety: manifest.valuation.marginOfSafety,
    evidenceConfidence: manifest.confidence.overall,
    businessQuality: manifest.businessQuality.score,
    valuationRead: manifest.valuation.read,
    evidenceRead: manifest.confidence.freshness ?? 'Unclassified'
  });
}

function round(value) { return Math.round(value * 10) / 10; }
