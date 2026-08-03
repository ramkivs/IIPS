import { MaterialChangeType } from '../models/ValidationProfiles.js';

export function createValidationSnapshot({ ticker, date, marginOfSafety, evidenceConfidence, businessQuality, valuationRead = 'Stable', evidenceRead = 'Stable' }) {
  return Object.freeze({ ticker, date, marginOfSafety, evidenceConfidence, businessQuality, valuationRead, evidenceRead });
}

export function compareValidationSnapshots({ previous, current, thresholds = {} }) {
  if (!previous || !current) throw new Error('Snapshot comparison requires previous and current snapshots');
  const mosThreshold = thresholds.marginOfSafetyDrop ?? 10;
  const evidenceThreshold = thresholds.evidenceConfidenceDrop ?? 10;
  const qualityThreshold = thresholds.businessQualityDrop ?? 5;
  const changes = [];

  const mosDelta = round(current.marginOfSafety - previous.marginOfSafety);
  const evidenceDelta = round(current.evidenceConfidence - previous.evidenceConfidence);
  const qualityDelta = round(current.businessQuality - previous.businessQuality);

  if (mosDelta <= -mosThreshold) changes.push({ type: MaterialChangeType.valuation, severity: 'High', message: `MOS changed from ${previous.marginOfSafety}% to ${current.marginOfSafety}%`, delta: mosDelta });
  if (evidenceDelta <= -evidenceThreshold) changes.push({ type: MaterialChangeType.evidence, severity: 'High', message: `Evidence Confidence changed from ${previous.evidenceConfidence}% to ${current.evidenceConfidence}%`, delta: evidenceDelta });
  if (qualityDelta <= -qualityThreshold) changes.push({ type: MaterialChangeType.quality, severity: 'Medium', message: `Business Quality changed from ${previous.businessQuality} to ${current.businessQuality}`, delta: qualityDelta });
  if (current.valuationRead !== previous.valuationRead) changes.push({ type: MaterialChangeType.valuation, severity: 'Medium', message: `Valuation changed from ${previous.valuationRead} to ${current.valuationRead}`, delta: null });
  if (changes.length === 0) changes.push({ type: MaterialChangeType.stable, severity: 'None', message: 'No material change detected', delta: 0 });

  return deepFreeze({ ticker: current.ticker, previous, current, changes, materialChange: changes.some(change => change.type !== MaterialChangeType.stable), reviewStatus: changes.some(change => change.severity === 'High') ? 'Needs Review' : 'Stable' });
}

export function createDemoSnapshotComparisons() {
  const pairs = [
    [createValidationSnapshot({ ticker: 'KAYNES', date: '2026-07-16', marginOfSafety: 42, evidenceConfidence: 88, businessQuality: 86 }), createValidationSnapshot({ ticker: 'KAYNES', date: '2026-07-23', marginOfSafety: 28, evidenceConfidence: 87, businessQuality: 86 })],
    [createValidationSnapshot({ ticker: 'COALINDIA', date: '2026-07-16', marginOfSafety: 18, evidenceConfidence: 94, businessQuality: 78 }), createValidationSnapshot({ ticker: 'COALINDIA', date: '2026-07-23', marginOfSafety: 17, evidenceConfidence: 81, businessQuality: 78, evidenceRead: 'Two sources became stale' })],
    [createValidationSnapshot({ ticker: 'BLS', date: '2026-07-16', marginOfSafety: 22, evidenceConfidence: 91, businessQuality: 90, valuationRead: 'Stable' }), createValidationSnapshot({ ticker: 'BLS', date: '2026-07-23', marginOfSafety: 25, evidenceConfidence: 91, businessQuality: 90, valuationRead: 'Improved' })],
    [createValidationSnapshot({ ticker: 'TCS', date: '2026-07-16', marginOfSafety: 9, evidenceConfidence: 96, businessQuality: 94 }), createValidationSnapshot({ ticker: 'TCS', date: '2026-07-23', marginOfSafety: 9, evidenceConfidence: 96, businessQuality: 94 })]
  ];
  return deepFreeze(pairs.map(([previous, current]) => compareValidationSnapshots({ previous, current })));
}

function round(value) { return Math.round(value * 10) / 10; }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
