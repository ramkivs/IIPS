export const RESEARCH_SNAPSHOT_SCHEMA_VERSION = 'RESEARCH_SNAPSHOT_1.0';

export const ResearchSnapshotGuardrails = Object.freeze({
  decisionSupportOnly: 'Research snapshots preserve analysis state for comparison; they do not recommend investment actions.',
  immutable: 'Research snapshots are immutable once created.',
  evidenceLinked: 'Research snapshots must preserve evidence and confidence context.',
  noExecution: 'Research snapshots must not execute trades or mutate portfolios.'
});

export function createResearchSnapshotManifest({
  company,
  snapshotDate,
  engineVersion,
  platformVersion = 'IIPS_2.0',
  businessQuality,
  financialStrength,
  growth,
  governance,
  valuation,
  confidence,
  explanation,
  evidence = [],
  source = {}
}) {
  validateRequired('company.companyId', company?.companyId);
  validateRequired('company.ticker', company?.ticker);
  validateRequired('snapshotDate', snapshotDate);
  validateRequired('engineVersion', engineVersion);
  validateRequired('businessQuality.score', businessQuality?.score);
  validateRequired('valuation.marginOfSafety', valuation?.marginOfSafety);
  validateRequired('confidence.overall', confidence?.overall);

  return deepFreeze({
    schemaVersion: RESEARCH_SNAPSHOT_SCHEMA_VERSION,
    snapshotDate,
    engineVersion,
    platformVersion,
    company: {
      companyId: company.companyId,
      ticker: company.ticker,
      companyName: company.companyName ?? company.ticker,
      exchange: company.exchange ?? null,
      isin: company.isin ?? null
    },
    businessQuality: normalizeScoreRead(businessQuality),
    financialStrength: normalizeScoreRead(financialStrength),
    growth: normalizeScoreRead(growth),
    governance: normalizeScoreRead(governance),
    valuation: {
      intrinsicValue: numberOrNull(valuation.intrinsicValue),
      marketPrice: numberOrNull(valuation.marketPrice),
      marginOfSafety: Number(valuation.marginOfSafety),
      read: valuation.read ?? 'Unclassified',
      method: valuation.method ?? null
    },
    confidence: {
      overall: Number(confidence.overall),
      evidence: numberOrNull(confidence.evidence),
      valuation: numberOrNull(confidence.valuation),
      freshness: confidence.freshness ?? null
    },
    explanation: {
      summary: explanation?.summary ?? '',
      drivers: Object.freeze([...(explanation?.drivers ?? [])]),
      risks: Object.freeze([...(explanation?.risks ?? [])]),
      watchItems: Object.freeze([...(explanation?.watchItems ?? [])])
    },
    evidence: evidence.map(item => Object.freeze({
      evidenceId: item.evidenceId ?? null,
      source: item.source ?? null,
      asOfDate: item.asOfDate ?? null,
      confidence: numberOrNull(item.confidence),
      freshness: item.freshness ?? null
    })),
    source: {
      providerVersions: Object.freeze([...(source.providerVersions ?? [])]),
      dataVersion: source.dataVersion ?? RESEARCH_SNAPSHOT_SCHEMA_VERSION,
      sourceReleases: Object.freeze([...(source.sourceReleases ?? [])])
    },
    guardrails: Object.freeze(Object.values(ResearchSnapshotGuardrails))
  });
}

function normalizeScoreRead(value = {}) {
  return Object.freeze({
    score: numberOrNull(value.score),
    read: value.read ?? 'Unclassified',
    confidence: numberOrNull(value.confidence)
  });
}

function validateRequired(name, value) {
  if (value === undefined || value === null || value === '') throw new Error(`${name} is required`);
}

function numberOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) throw new Error(`Expected numeric value, received ${value}`);
  return numeric;
}

export function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
