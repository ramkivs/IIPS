export const INSTITUTIONAL_ENGINE_VERSION = 'ISE_MVP_1.0.0';

export const InstitutionalEngineFamily = Object.freeze({
  bank: 'Bank',
  insurance: 'Insurance',
  capitalMarkets: 'Capital Markets',
  industrial: 'Industrial',
  microcap: 'Microcap',
  hospitality: 'Hospitality',
  general: 'General'
});

export const EvidenceQualityState = Object.freeze({
  certified: 'Certified',
  verified: 'Verified',
  provisional: 'Provisional',
  incomplete: 'Incomplete',
  missing: 'Missing'
});

export class InstitutionalEngine {
  score(input) {
    validateInput(input);
    const metrics = input.metrics;
    const businessQuality = weightedAverage([
      normalizeHigher(metrics.revenueGrowth, 0, 25),
      normalizeHigher(metrics.ebitdaMargin, 5, 35),
      normalizeHigher(metrics.roce, 5, 30),
      normalizeHigher(metrics.cfoMargin, 0, 25)
    ]);
    const financialStrength = weightedAverage([
      normalizeHigher(metrics.roe, 5, 30),
      normalizeLower(metrics.debtToEquity, 0, 2),
      normalizeHigher(metrics.interestCoverage, 1, 20),
      normalizeHigher(metrics.fcfMargin, -5, 20)
    ]);
    const growth = weightedAverage([
      normalizeHigher(metrics.revenueGrowth, 0, 30),
      normalizeHigher(metrics.patGrowth, -5, 30),
      normalizeHigher(metrics.assetTurnover, 0.2, 3)
    ]);
    const governance = weightedAverage([
      normalizeHigher(metrics.promoterHolding, 20, 75),
      normalizeLower(metrics.pledgePercent ?? 0, 0, 50),
      normalizeHigher(metrics.auditQualityScore ?? 75, 0, 100)
    ]);
    const marginOfSafety = calculateMarginOfSafety(metrics.intrinsicValue, metrics.marketPrice);
    const valuationScore = normalizeHigher(marginOfSafety, -20, 50);
    const confidence = calculateConfidence(input.evidence);
    const finalScore = round(weightedAverage([businessQuality, financialStrength, growth, governance, valuationScore]));

    return deepFreeze({
      companyId: input.company.companyId,
      ticker: input.company.ticker,
      companyName: input.company.companyName,
      exchange: input.company.exchange ?? null,
      engineFamily: input.engineFamily ?? InstitutionalEngineFamily.general,
      engineVersion: INSTITUTIONAL_ENGINE_VERSION,
      snapshotDate: input.snapshotDate,
      businessQuality: scoreRead(businessQuality),
      financialStrength: scoreRead(financialStrength),
      growth: scoreRead(growth),
      governance: scoreRead(governance),
      valuation: {
        intrinsicValue: Number(metrics.intrinsicValue),
        marketPrice: Number(metrics.marketPrice),
        marginOfSafety,
        read: valuationRead(marginOfSafety),
        method: input.valuationMethod ?? 'Institutional Engine MVP'
      },
      confidence: {
        overall: confidence.overall,
        evidence: confidence.evidence,
        valuation: confidence.valuation,
        freshness: confidence.evidenceQuality
      },
      explanation: createExplanation({ finalScore, businessQuality, financialStrength, growth, governance, marginOfSafety, confidence }),
      evidence: input.evidence.map((item, index) => ({
        evidenceId: item.evidenceId ?? `EV_${input.company.ticker}_${index + 1}`,
        source: item.source,
        asOfDate: item.asOfDate,
        confidence: item.confidence,
        freshness: item.freshness ?? EvidenceQualityState.verified
      })),
      source: {
        providerVersions: [`${INSTITUTIONAL_ENGINE_VERSION}`],
        dataVersion: input.dataVersion ?? 'ISE_MVP_DATA_1.0',
        sourceReleases: input.sourceReleases ?? []
      },
      finalScore,
      guardrails: [
        'Institutional Engine emits analytical scores and evidence context only.',
        'Institutional Engine output must not recommend Buy, Sell, Hold, Add, Trim, or Exit.',
        'Investor decisions remain investor-owned.'
      ]
    });
  }
}

function validateInput(input) {
  const requiredCompany = ['companyId', 'ticker', 'companyName'];
  for (const field of requiredCompany) if (!input?.company?.[field]) throw new Error(`company.${field} is required`);
  if (!Object.values(InstitutionalEngineFamily).includes(input.engineFamily ?? InstitutionalEngineFamily.general)) throw new Error(`Unsupported engine family: ${input.engineFamily}`);
  if (!input.snapshotDate) throw new Error('snapshotDate is required');
  const requiredMetrics = ['revenueGrowth', 'ebitdaMargin', 'patGrowth', 'roce', 'roe', 'debtToEquity', 'interestCoverage', 'cfoMargin', 'fcfMargin', 'assetTurnover', 'promoterHolding', 'intrinsicValue', 'marketPrice'];
  for (const field of requiredMetrics) if (!Number.isFinite(Number(input.metrics?.[field]))) throw new Error(`metrics.${field} is required and must be numeric`);
  if (!Array.isArray(input.evidence) || input.evidence.length === 0) throw new Error('evidence is required');
}

function normalizeHigher(value, min, max) { return clamp(((Number(value) - min) / (max - min)) * 100); }
function normalizeLower(value, min, max) { return clamp(100 - (((Number(value) - min) / (max - min)) * 100)); }
function clamp(value) { return Math.max(0, Math.min(100, round(value))); }
function weightedAverage(values) { return round(values.reduce((sum, value) => sum + value, 0) / values.length); }
function round(value) { return Math.round(Number(value) * 100) / 100; }
function calculateMarginOfSafety(intrinsicValue, marketPrice) { return round(((Number(intrinsicValue) - Number(marketPrice)) / Number(intrinsicValue)) * 100); }

function scoreRead(score) {
  const rounded = round(score);
  return Object.freeze({ score: rounded, read: rounded >= 80 ? 'Strong' : rounded >= 60 ? 'Moderate' : 'Weak', confidence: null });
}

function valuationRead(marginOfSafety) {
  if (marginOfSafety >= 35) return 'Attractive';
  if (marginOfSafety >= 15) return 'Fair';
  return 'Less Attractive';
}

function calculateConfidence(evidence) {
  const average = round(evidence.reduce((sum, item) => sum + Number(item.confidence ?? 0), 0) / evidence.length);
  const freshnessStates = evidence.map(item => item.freshness ?? EvidenceQualityState.verified);
  const evidenceQuality = freshnessStates.includes(EvidenceQualityState.missing) ? EvidenceQualityState.missing
    : freshnessStates.includes(EvidenceQualityState.incomplete) ? EvidenceQualityState.incomplete
    : freshnessStates.includes(EvidenceQualityState.provisional) ? EvidenceQualityState.provisional
    : freshnessStates.includes(EvidenceQualityState.certified) ? EvidenceQualityState.certified
    : EvidenceQualityState.verified;
  return Object.freeze({ overall: average, evidence: average, valuation: average, evidenceQuality });
}

function createExplanation({ finalScore, businessQuality, financialStrength, growth, governance, marginOfSafety, confidence }) {
  return Object.freeze({
    summary: `Institutional Engine MVP produced a deterministic analytical output with final score ${finalScore}.`,
    drivers: [`Business quality ${businessQuality}`, `Financial strength ${financialStrength}`, `Margin of safety ${marginOfSafety}%`],
    risks: [`Governance score ${governance}`, `Evidence quality ${confidence.evidenceQuality}`],
    watchItems: [`Growth score ${growth}`, 'Review evidence freshness before investor judgment']
  });
}

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
