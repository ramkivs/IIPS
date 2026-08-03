import { createResearchSnapshotManifest, deepFreeze } from './ResearchSnapshotSchema.js';

export const EngineFamily = Object.freeze({
  bank: 'Bank',
  insurance: 'Insurance',
  capitalMarkets: 'Capital Markets',
  industrial: 'Industrial',
  microcap: 'Microcap',
  hospitality: 'Hospitality',
  general: 'General'
});

export class ResearchSnapshotAdapter {
  adapt({ engineFamily = EngineFamily.general, engineOutput, snapshotDate, engineVersion, platformVersion = 'IIPS_2.0' }) {
    if (!Object.values(EngineFamily).includes(engineFamily)) throw new Error(`Unsupported engine family: ${engineFamily}`);
    if (!engineOutput) throw new Error('engineOutput is required');

    const canonicalInput = deepFreeze({
      company: normalizeCompany(engineOutput),
      snapshotDate: snapshotDate ?? readFirst(engineOutput, ['snapshotDate', 'asOfDate', 'date']),
      engineVersion: engineVersion ?? readFirst(engineOutput, ['engineVersion', 'modelVersion', 'version']),
      platformVersion,
      businessQuality: normalizeScoreRead(engineOutput, ['businessQuality', 'quality', 'qualityScore', 'institutionalScore', 'compositeScore', 'scores.businessQuality']),
      financialStrength: normalizeScoreRead(engineOutput, ['financialStrength', 'financialQuality', 'financialScore', 'scores.financialStrength']),
      growth: normalizeScoreRead(engineOutput, ['growth', 'growthQuality', 'growthScore', 'scores.growth']),
      governance: normalizeScoreRead(engineOutput, ['governance', 'governanceQuality', 'governanceScore', 'scores.governance']),
      valuation: normalizeValuation(engineOutput),
      confidence: normalizeConfidence(engineOutput),
      explanation: normalizeExplanation(engineOutput),
      evidence: normalizeEvidence(engineOutput),
      source: normalizeSource(engineOutput, engineFamily)
    });

    // Validate against the canonical public contract without returning a mutable manifest.
    createResearchSnapshotManifest(canonicalInput);
    return canonicalInput;
  }
}

function normalizeCompany(output) {
  const company = output.company ?? {};
  return Object.freeze({
    companyId: readFirst(output, ['company.companyId', 'company.company_id', 'companyId', 'company_id', 'id']),
    ticker: readFirst(output, ['company.ticker', 'ticker', 'symbol']),
    companyName: readFirst(output, ['company.companyName', 'company.name', 'companyName', 'name']),
    exchange: readFirst(output, ['company.exchange', 'exchange']),
    isin: readFirst(output, ['company.isin', 'isin'])
  });
}

function normalizeScoreRead(output, paths) {
  const value = readFirst(output, paths);
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.freeze({
      score: readFirst(value, ['score', 'value', 'rating', 'points']),
      read: readFirst(value, ['read', 'label', 'classification']) ?? 'Unclassified',
      confidence: readFirst(value, ['confidence', 'confidenceScore'])
    });
  }
  return Object.freeze({ score: value, read: 'Unclassified', confidence: readFirst(output, ['confidence.overall', 'confidenceScore', 'evidenceConfidence']) });
}

function normalizeValuation(output) {
  const valuation = output.valuation ?? {};
  return Object.freeze({
    intrinsicValue: readFirst(output, ['valuation.intrinsicValue', 'valuation.fairValue', 'intrinsicValue', 'fairValue']),
    marketPrice: readFirst(output, ['valuation.marketPrice', 'marketPrice', 'price']),
    marginOfSafety: readFirst(output, ['valuation.marginOfSafety', 'valuation.mos', 'marginOfSafety', 'mos']),
    read: readFirst(output, ['valuation.read', 'valuation.label', 'valuation.classification']) ?? 'Unclassified',
    method: readFirst(output, ['valuation.method', 'valuationModel', 'method'])
  });
}

function normalizeConfidence(output) {
  const confidence = output.confidence ?? {};
  return Object.freeze({
    overall: readFirst(output, ['confidence.overall', 'confidence.score', 'confidenceScore', 'evidenceConfidence']),
    evidence: readFirst(output, ['confidence.evidence', 'evidenceConfidence']),
    valuation: readFirst(output, ['confidence.valuation', 'valuation.confidence']),
    freshness: readFirst(output, ['confidence.freshness', 'evidenceFreshness', 'freshness'])
  });
}

function normalizeExplanation(output) {
  const explanation = output.explanation ?? output.interpretation ?? {};
  return Object.freeze({
    summary: readFirst({ explanation }, ['explanation.summary', 'explanation.headline', 'explanation.text']) ?? '',
    drivers: normalizeArray(readFirst({ explanation }, ['explanation.drivers', 'explanation.positives'])),
    risks: normalizeArray(readFirst({ explanation }, ['explanation.risks', 'explanation.concerns'])),
    watchItems: normalizeArray(readFirst({ explanation }, ['explanation.watchItems', 'explanation.watchlist', 'explanation.followUps']))
  });
}

function normalizeEvidence(output) {
  return normalizeArray(output.evidence ?? output.evidenceItems).map((item, index) => Object.freeze({
    evidenceId: item.evidenceId ?? item.id ?? `evidence-${index + 1}`,
    source: item.source ?? item.provider ?? null,
    asOfDate: item.asOfDate ?? item.date ?? null,
    confidence: item.confidence ?? item.confidenceScore ?? null,
    freshness: item.freshness ?? null
  }));
}

function normalizeSource(output, engineFamily) {
  const source = output.source ?? {};
  return Object.freeze({
    providerVersions: normalizeArray(source.providerVersions ?? output.providerVersions ?? [`${engineFamily} Engine`]),
    dataVersion: source.dataVersion ?? output.dataVersion ?? 'DATA_UNSPECIFIED',
    sourceReleases: normalizeArray(source.sourceReleases ?? output.sourceReleases)
  });
}

function readFirst(object, paths) {
  for (const path of paths) {
    const value = readPath(object, path);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return null;
}

function readPath(object, path) {
  return path.split('.').reduce((current, part) => current?.[part], object);
}

function normalizeArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
