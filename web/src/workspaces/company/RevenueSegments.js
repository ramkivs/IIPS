import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createOverviewFeatureView } from './OverviewFeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-OV-006',
  workspace: 'Company Workspace',
  epic: 'Overview',
  featureId: '1.6',
  featureName: 'Revenue Segments',
  status: 'Released',
  version: '1.0',
  investorQuestion: "Where does this company's reported revenue come from?",
  purpose: 'Explain reported revenue composition, segment contribution, geographic split, historical segment growth, concentration, cyclical exposure, and segment trends using disclosed revenue data.'
});

const DEFAULT_REVENUE_SEGMENTS_INPUT = Object.freeze({
  company: Object.freeze({ displayName: 'Apex Consumer Products' }),
  reportingPeriod: Object.freeze({ label: 'FY2026 demo snapshot', currency: 'INR', scale: 'crore' }),
  reportedRevenueSegments: Object.freeze([
    Object.freeze({ segment: 'Packaged foods', revenue: 24960, contributionPercent: 52, disclosureSource: 'segment disclosure' }),
    Object.freeze({ segment: 'Beverages', revenue: 13440, contributionPercent: 28, disclosureSource: 'segment disclosure' }),
    Object.freeze({ segment: 'Household essentials', revenue: 9600, contributionPercent: 20, disclosureSource: 'segment disclosure' })
  ]),
  geographicRevenueSplit: Object.freeze([
    Object.freeze({ geography: 'India', revenue: 39360, contributionPercent: 82, disclosureSource: 'geographic disclosure' }),
    Object.freeze({ geography: 'International', revenue: 8640, contributionPercent: 18, disclosureSource: 'geographic disclosure' })
  ]),
  segmentGrowthHistory: Object.freeze([
    Object.freeze({ segment: 'Packaged foods', periods: Object.freeze([Object.freeze({ period: 'FY2024', growthPercent: 7 }), Object.freeze({ period: 'FY2025', growthPercent: 8 }), Object.freeze({ period: 'FY2026', growthPercent: 9 })]) }),
    Object.freeze({ segment: 'Beverages', periods: Object.freeze([Object.freeze({ period: 'FY2024', growthPercent: 10 }), Object.freeze({ period: 'FY2025', growthPercent: 12 }), Object.freeze({ period: 'FY2026', growthPercent: 11 })]) }),
    Object.freeze({ segment: 'Household essentials', periods: Object.freeze([Object.freeze({ period: 'FY2024', growthPercent: 5 }), Object.freeze({ period: 'FY2025', growthPercent: 6 }), Object.freeze({ period: 'FY2026', growthPercent: 6 })]) })
  ]),
  cyclicalExposure: Object.freeze([
    Object.freeze({ segment: 'Packaged foods', exposure: 'Low', rationale: 'Everyday consumption category with relatively stable demand.' }),
    Object.freeze({ segment: 'Beverages', exposure: 'Medium', rationale: 'More exposed to seasonality, channel mix, and discretionary occasions.' }),
    Object.freeze({ segment: 'Household essentials', exposure: 'Low', rationale: 'Routine replenishment category.' })
  ]),
  segmentTrends: Object.freeze([
    Object.freeze({ segment: 'Packaged foods', trend: 'Steady contribution with modest growth.' }),
    Object.freeze({ segment: 'Beverages', trend: 'Higher growth but smaller base than packaged foods.' }),
    Object.freeze({ segment: 'Household essentials', trend: 'Stable but slower-growing contribution.' })
  ]),
  investorJudgment: Object.freeze({ status: 'Revenue composition reviewed', note: 'Reported revenue mix is understandable; next research should verify disclosure source links and trend durability.' })
});

export function createRevenueSegments(input = DEFAULT_REVENUE_SEGMENTS_INPUT) {
  const normalized = normalizeInput(input);
  const segmentConcentration = createSegmentConcentration(normalized);
  const segmentFacts = createSegmentFacts(normalized, segmentConcentration);
  const aiInterpretation = createAiInterpretation(normalized, segmentConcentration);
  const investorJudgment = createInvestorJudgment(normalized);
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Medium',
    coverage: 78,
    rationale: 'Revenue Segments includes segment contribution, geographic revenue split, growth history, concentration, cyclicality, and trends, but still needs linked source filings and reconciliation to reported total revenue.',
    evidenceItems: ['reported revenue segments', 'segment contribution percentages', 'geographic revenue split', 'segment growth history', 'segment concentration', 'cyclical exposure', 'segment trends'],
    missingEvidence: ['annual report segment note', 'audited revenue reconciliation', 'geographic revenue disclosure source', 'historical segment restatement notes']
  });
  const sections = Object.freeze({
    revenueSegmentsHeader: createRevenueSegmentsHeader(normalized),
    reportedRevenueSegments: createReportedRevenueSegments(normalized),
    segmentContribution: createSegmentContribution(normalized),
    geographicRevenueSplit: createGeographicRevenueSplit(normalized),
    segmentGrowth: createSegmentGrowth(normalized),
    segmentConcentration,
    cyclicalExposure: createCyclicalExposure(normalized),
    segmentTrends: createSegmentTrends(normalized),
    segmentFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    reportedCompositionOnly: true,
    noProductPortfolioExplanation: true,
    noMarginAnalysis: true,
    noProfitabilityAnalysis: true,
    noValuation: true,
    noScoring: true,
    noRecommendation: true,
    noExecution: true
  });
  const futureExtensions = Object.freeze(['source filing links', 'reported total reconciliation', 'segment restatement tracking', 'segment trend charts']);

  return deepFreeze({
    type: 'revenue-segments',
    feature: FEATURE_META,
    businessLogic: false,
    selfContained: true,
    responsive: Object.freeze({ supportsCompact: true, supportsWide: true, minimumContentWidth: 320 }),
    evidenceConfidence,
    sections,
    overviewFeatureView: createOverviewFeatureView({
      type: 'revenue-segments',
      feature: FEATURE_META,
      facts: segmentFacts.items,
      aiInterpretation,
      investorJudgment,
      evidenceConfidence,
      guardrails,
      futureExtensions,
      sections
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      reportedCompositionOnly: true,
      doesNotDuplicateProductsServices: true,
      userCanUnderstand: Object.freeze(['reported revenue segments', 'segment contribution', 'geographic revenue split', 'historical segment growth', 'segment concentration', 'cyclical exposure', 'segment trends']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultRevenueSegmentsInput() {
  return clone(DEFAULT_REVENUE_SEGMENTS_INPUT);
}

function createRevenueSegmentsHeader(input) {
  return Object.freeze({ component: 'RevenueSegmentsHeader', companyName: input.company.displayName, investorQuestion: FEATURE_META.investorQuestion, reportingPeriod: input.reportingPeriod });
}
function createReportedRevenueSegments(input) { return Object.freeze({ component: 'ReportedRevenueSegments', items: input.reportedRevenueSegments, factsOnly: true }); }
function createSegmentContribution(input) { return Object.freeze({ component: 'SegmentContribution', items: input.reportedRevenueSegments.map(segment => Object.freeze({ segment: segment.segment, contributionPercent: segment.contributionPercent })), factsOnly: true }); }
function createGeographicRevenueSplit(input) { return Object.freeze({ component: 'GeographicRevenueSplit', items: input.geographicRevenueSplit, factsOnly: true }); }
function createSegmentGrowth(input) { return Object.freeze({ component: 'SegmentGrowth', items: input.segmentGrowthHistory, factsOnly: true }); }
function createCyclicalExposure(input) { return Object.freeze({ component: 'CyclicalExposure', items: input.cyclicalExposure, factsOnly: true }); }
function createSegmentTrends(input) { return Object.freeze({ component: 'SegmentTrends', items: input.segmentTrends, factsOnly: true }); }

function createSegmentConcentration(input) {
  const largest = [...input.reportedRevenueSegments].sort((a, b) => b.contributionPercent - a.contributionPercent)[0];
  const topTwo = [...input.reportedRevenueSegments].sort((a, b) => b.contributionPercent - a.contributionPercent).slice(0, 2);
  return Object.freeze({
    component: 'SegmentConcentration',
    largestSegment: largest.segment,
    largestContributionPercent: largest.contributionPercent,
    topTwoContributionPercent: topTwo.reduce((sum, item) => sum + item.contributionPercent, 0),
    concentrationLevel: largest.contributionPercent >= 60 ? 'High' : largest.contributionPercent >= 40 ? 'Medium' : 'Low',
    factsOnly: true
  });
}

function createSegmentFacts(input, concentration) {
  return Object.freeze({
    component: 'RevenueSegmentFacts',
    items: deepFreeze([
      { id: 'reporting-period', kind: 'fact', source: 'revenue-segments-input', value: input.reportingPeriod.label },
      { id: 'reported-segments', kind: 'fact', source: 'reported-segment-disclosure', value: input.reportedRevenueSegments.map(segment => `${segment.segment}: ${segment.contributionPercent}%`).join(', ') },
      { id: 'geographic-split', kind: 'fact', source: 'reported-geographic-disclosure', value: input.geographicRevenueSplit.map(region => `${region.geography}: ${region.contributionPercent}%`).join(', ') },
      { id: 'largest-segment', kind: 'fact', source: 'computed-from-reported-composition', value: `${concentration.largestSegment}: ${concentration.largestContributionPercent}%` },
      { id: 'concentration-level', kind: 'fact', source: 'computed-from-reported-composition', value: concentration.concentrationLevel }
    ]),
    factsOnly: true
  });
}

function createAiInterpretation(input, concentration) {
  return Object.freeze({
    component: 'RevenueSegmentsAIInterpretation',
    kind: 'generated_explanation',
    source: 'deterministic-product-summary',
    basedOn: Object.freeze(['reported-revenue-segments', 'geographic-revenue-split', 'segment-growth', 'segment-concentration', 'cyclical-exposure', 'segment-trends']),
    summary: `${input.company.displayName}'s reported revenue is led by ${concentration.largestSegment} at ${concentration.largestContributionPercent}% of revenue, with top-two segment contribution of ${concentration.topTwoContributionPercent}%. Geographic revenue is primarily from ${input.geographicRevenueSplit[0].geography} at ${input.geographicRevenueSplit[0].contributionPercent}%.`,
    caution: 'Generated revenue composition interpretation only. It does not explain product value propositions, margins, profitability, valuation, score, or recommendation.'
  });
}
function createInvestorJudgment(input) { return Object.freeze({ component: 'RevenueSegmentsInvestorJudgment', status: input.investorJudgment.status, note: input.investorJudgment.note, controlledBy: 'Investor', noAutomation: true }); }

function normalizeInput(input) {
  const company = input.company || {};
  requireText(company.displayName, 'company.displayName');
  return Object.freeze({
    company: Object.freeze({ displayName: company.displayName }),
    reportingPeriod: normalizeObject(input.reportingPeriod, ['label', 'currency', 'scale']),
    reportedRevenueSegments: normalizeItems(input.reportedRevenueSegments, ['segment', 'revenue', 'contributionPercent', 'disclosureSource']),
    geographicRevenueSplit: normalizeItems(input.geographicRevenueSplit, ['geography', 'revenue', 'contributionPercent', 'disclosureSource']),
    segmentGrowthHistory: normalizeItems(input.segmentGrowthHistory, ['segment'], item => Object.freeze({ ...item, periods: normalizeItems(item.periods, ['period', 'growthPercent']) })),
    cyclicalExposure: normalizeItems(input.cyclicalExposure, ['segment', 'exposure', 'rationale']),
    segmentTrends: normalizeItems(input.segmentTrends, ['segment', 'trend']),
    investorJudgment: Object.freeze({ status: valueOrUnknown(input.investorJudgment?.status), note: valueOrUnknown(input.investorJudgment?.note) })
  });
}

function normalizeObject(item, requiredFields) {
  const source = item || {};
  for (const field of requiredFields) if (source[field] === undefined || source[field] === null || source[field] === '') throw new Error(`${field} is required`);
  return Object.freeze({ ...source });
}
function normalizeItems(items, requiredFields, transform = item => Object.freeze({ ...item })) {
  return deepFreeze(freezeList(items).map((item, index) => {
    for (const field of requiredFields) if (item?.[field] === undefined || item?.[field] === null || item?.[field] === '') throw new Error(`items[${index}].${field} is required`);
    return transform(item);
  }));
}
function freezeList(value) { return Object.freeze([...(Array.isArray(value) ? value : [])]); }
function valueOrUnknown(value) { return value === undefined || value === null || value === '' ? 'Unknown' : value; }
function requireText(value, label) { if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
