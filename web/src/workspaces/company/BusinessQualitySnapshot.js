import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-BQ-001',
  workspace: 'Company Workspace',
  epic: 'Business Quality',
  featureId: 'BQ.1',
  featureName: 'Business Quality Snapshot',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'Is this a high-quality business?',
  purpose: 'Orient the investor to what constitutes business quality for this company before detailed measurement, scoring, or quantitative analysis.'
});

const DEFAULT_BUSINESS_QUALITY_INPUT = Object.freeze({
  company: Object.freeze({ displayName: 'Apex Consumer Products' }),
  overallQualityProfile: Object.freeze({
    summary: 'Apex appears to be a repeat-purchase consumer business with recognizable categories, distribution dependence, medium regulatory exposure, and quality questions that require deeper evidence before conviction can increase.',
    orientation: 'Initial quality review only — not a scorecard.'
  }),
  qualityPillars: Object.freeze([
    Object.freeze({ pillar: 'Business Model', question: 'Does the company sell products or services customers repeatedly need?', currentRead: 'Repeat-purchase categories suggest potential durability, but category depth and customer stickiness require validation.' }),
    Object.freeze({ pillar: 'Competitive Position', question: 'Can the company defend its position?', currentRead: 'Brand, distribution, and product availability may matter, but competitive strength is not yet measured.' }),
    Object.freeze({ pillar: 'Profitability Profile', question: 'Can the business convert revenue into durable profits?', currentRead: 'Profitability is intentionally not scored here; later features should review margins, returns, and cash conversion.' }),
    Object.freeze({ pillar: 'Capital Allocation', question: 'Does management reinvest and allocate capital sensibly?', currentRead: 'Requires evidence on reinvestment, capacity, acquisitions, dividends, and working capital discipline.' }),
    Object.freeze({ pillar: 'Governance', question: 'Can management be trusted to act in shareholders interests?', currentRead: 'Requires review of incentives, ownership, related-party transactions, disclosures, and capital allocation record.' }),
    Object.freeze({ pillar: 'Resilience', question: 'Can the business withstand stress?', currentRead: 'Repeat purchase categories may help resilience, but supply chain, pricing power, and balance sheet resilience need review.' })
  ]),
  businessModel: Object.freeze({
    orientation: 'Recurring consumer purchase categories with broad distribution needs.',
    qualitySignals: Object.freeze(['repeat purchase behavior', 'portfolio breadth', 'channel availability']),
    openQuestions: Object.freeze(['customer retention evidence', 'brand strength evidence', 'channel dependence'])
  }),
  competitivePosition: Object.freeze({
    orientation: 'Potentially driven by brand recognition, shelf availability, product fit, and distribution execution.',
    qualitySignals: Object.freeze(['brand familiarity', 'distribution reach', 'category presence']),
    openQuestions: Object.freeze(['market share trend', 'competitor intensity', 'private label pressure'])
  }),
  profitabilityProfile: Object.freeze({
    orientation: 'Profitability quality requires later quantitative review; this feature only identifies what must be checked.',
    qualitySignals: Object.freeze(['gross margin stability to review', 'operating leverage to review', 'cash conversion to review']),
    openQuestions: Object.freeze(['margin durability', 'ROCE consistency', 'free cash flow conversion'])
  }),
  capitalAllocation: Object.freeze({
    orientation: 'Capital allocation quality depends on reinvestment discipline and shareholder treatment.',
    qualitySignals: Object.freeze(['reinvestment opportunities', 'capacity discipline', 'working capital discipline']),
    openQuestions: Object.freeze(['acquisition history', 'dividend policy', 'capex returns'])
  }),
  governanceOverview: Object.freeze({
    orientation: 'Governance quality requires evidence on incentives, disclosures, ownership, and related-party behavior.',
    qualitySignals: Object.freeze(['clear ownership', 'board oversight to review', 'disclosure quality to review']),
    openQuestions: Object.freeze(['related-party transactions', 'management incentives', 'minority shareholder treatment'])
  }),
  resilienceIndicators: Object.freeze([
    Object.freeze({ indicator: 'Demand Resilience', currentRead: 'Potentially supported by everyday-use categories.', evidenceStatus: 'partial' }),
    Object.freeze({ indicator: 'Supply Chain Resilience', currentRead: 'Needs geography and supplier evidence.', evidenceStatus: 'missing' }),
    Object.freeze({ indicator: 'Pricing Resilience', currentRead: 'Needs history of price increases and volume retention.', evidenceStatus: 'missing' }),
    Object.freeze({ indicator: 'Balance Sheet Resilience', currentRead: 'Needs financial quality review.', evidenceStatus: 'missing' })
  ]),
  investorJudgment: Object.freeze({ status: 'Quality orientation reviewed', note: 'Business quality is not yet concluded. Use this snapshot to guide deeper Business Quality features.' })
});

export function createBusinessQualitySnapshot(input = DEFAULT_BUSINESS_QUALITY_INPUT) {
  const normalized = normalizeInput(input);
  const qualityFacts = createQualityFacts(normalized);
  const aiInterpretation = createAiInterpretation(normalized);
  const investorJudgment = createInvestorJudgment(normalized);
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Medium',
    coverage: 64,
    rationale: 'Business Quality Snapshot identifies the main quality pillars and open questions, but detailed evidence for profitability, governance, competitive durability, and resilience remains incomplete.',
    evidenceItems: ['business model orientation', 'quality pillars', 'competitive position orientation', 'capital allocation questions', 'governance questions', 'resilience indicators'],
    missingEvidence: [
      { label: 'market share evidence', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'ROCE and profitability history', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'free cash flow conversion history', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'governance and related-party review', priority: 'Medium', status: 'missing', sourceCount: 0 },
      { label: 'capital allocation track record', priority: 'Medium', status: 'missing', sourceCount: 0 }
    ]
  });
  const sections = Object.freeze({
    businessQualityHeader: createBusinessQualityHeader(normalized),
    overallQualityProfile: createOverallQualityProfile(normalized),
    qualityPillars: createQualityPillars(normalized),
    businessModel: createBusinessModel(normalized),
    competitivePosition: createCompetitivePosition(normalized),
    profitabilityProfile: createProfitabilityProfile(normalized),
    capitalAllocation: createCapitalAllocation(normalized),
    governanceOverview: createGovernanceOverview(normalized),
    resilienceIndicators: createResilienceIndicators(normalized),
    qualityFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    orientationNotScorecard: true,
    noQualityScore: true,
    noRanking: true,
    noValuation: true,
    noRecommendation: true,
    noExecution: true
  });
  const futureExtensions = Object.freeze(['quality scorecard', 'pillar-level evidence links', 'profitability trend integration', 'governance red-flag detection']);

  return deepFreeze({
    type: 'business-quality-snapshot',
    feature: FEATURE_META,
    businessLogic: false,
    selfContained: true,
    responsive: Object.freeze({ supportsCompact: true, supportsWide: true, minimumContentWidth: 320 }),
    evidenceConfidence,
    sections,
    featureView: createFeatureView({
      id: FEATURE_META.stableId,
      title: FEATURE_META.featureName,
      epic: FEATURE_META.epic,
      feature: FEATURE_META.featureId,
      version: FEATURE_META.version,
      investorQuestion: FEATURE_META.investorQuestion,
      facts: qualityFacts.items,
      aiInterpretation,
      investorJudgment,
      evidenceConfidence,
      guardrails,
      sections,
      metadata: { workspace: FEATURE_META.workspace, status: FEATURE_META.status, futureExtensions },
      extensions: { quality: { qualityPillars: normalized.qualityPillars } }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      orientationBeforeMeasurement: true,
      notScorecard: true,
      userCanUnderstand: Object.freeze(['overall quality profile', 'quality pillars', 'business model quality orientation', 'competitive position orientation', 'profitability profile questions', 'capital allocation questions', 'governance overview', 'resilience indicators']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultBusinessQualitySnapshotInput() {
  return clone(DEFAULT_BUSINESS_QUALITY_INPUT);
}

function createBusinessQualityHeader(input) { return Object.freeze({ component: 'BusinessQualityHeader', companyName: input.company.displayName, investorQuestion: FEATURE_META.investorQuestion }); }
function createOverallQualityProfile(input) { return Object.freeze({ component: 'OverallQualityProfile', ...input.overallQualityProfile, factsOnly: false }); }
function createQualityPillars(input) { return Object.freeze({ component: 'QualityPillars', items: input.qualityPillars, factsOnly: false }); }
function createBusinessModel(input) { return Object.freeze({ component: 'BusinessModelQualityOrientation', ...input.businessModel, factsOnly: false }); }
function createCompetitivePosition(input) { return Object.freeze({ component: 'CompetitivePositionOrientation', ...input.competitivePosition, factsOnly: false }); }
function createProfitabilityProfile(input) { return Object.freeze({ component: 'ProfitabilityProfileOrientation', ...input.profitabilityProfile, measurementDeferred: true }); }
function createCapitalAllocation(input) { return Object.freeze({ component: 'CapitalAllocationOrientation', ...input.capitalAllocation, measurementDeferred: true }); }
function createGovernanceOverview(input) { return Object.freeze({ component: 'GovernanceOverview', ...input.governanceOverview, measurementDeferred: true }); }
function createResilienceIndicators(input) { return Object.freeze({ component: 'ResilienceIndicators', items: input.resilienceIndicators, factsOnly: false }); }

function createQualityFacts(input) {
  return Object.freeze({
    component: 'QualityFacts',
    items: deepFreeze([
      { id: 'quality-orientation', kind: 'fact', source: 'business-quality-input', value: input.overallQualityProfile.orientation },
      { id: 'quality-pillars', kind: 'fact', source: 'business-quality-input', value: input.qualityPillars.map(pillar => pillar.pillar).join(', ') },
      { id: 'business-model-signals', kind: 'fact', source: 'business-quality-input', value: input.businessModel.qualitySignals.join(', ') },
      { id: 'resilience-indicators', kind: 'fact', source: 'business-quality-input', value: input.resilienceIndicators.map(item => `${item.indicator}: ${item.evidenceStatus}`).join(', ') }
    ]),
    factsOnly: true
  });
}

function createAiInterpretation(input) {
  return Object.freeze({
    component: 'BusinessQualityAIInterpretation',
    kind: 'generated_explanation',
    source: 'deterministic-product-summary',
    basedOn: Object.freeze(['overall-quality-profile', 'quality-pillars', 'business-model', 'competitive-position', 'profitability-profile', 'capital-allocation', 'governance-overview', 'resilience-indicators']),
    summary: `${input.company.displayName}'s initial quality profile is oriented around ${input.qualityPillars.map(pillar => pillar.pillar.toLowerCase()).join(', ')}. The snapshot is intentionally not a scorecard and should guide deeper Business Quality research.`,
    caution: 'Generated quality orientation only. It does not assign a quality score, rank the company, recommend action, value the company, or replace investor judgment.'
  });
}
function createInvestorJudgment(input) { return Object.freeze({ component: 'BusinessQualityInvestorJudgment', status: input.investorJudgment.status, note: input.investorJudgment.note, controlledBy: 'Investor', noAutomation: true }); }

function normalizeInput(input) {
  const company = input.company || {};
  requireText(company.displayName, 'company.displayName');
  return Object.freeze({
    company: Object.freeze({ displayName: company.displayName }),
    overallQualityProfile: normalizeObject(input.overallQualityProfile, ['summary', 'orientation']),
    qualityPillars: normalizeItems(input.qualityPillars, ['pillar', 'question', 'currentRead']),
    businessModel: normalizeSignalGroup(input.businessModel),
    competitivePosition: normalizeSignalGroup(input.competitivePosition),
    profitabilityProfile: normalizeSignalGroup(input.profitabilityProfile),
    capitalAllocation: normalizeSignalGroup(input.capitalAllocation),
    governanceOverview: normalizeSignalGroup(input.governanceOverview),
    resilienceIndicators: normalizeItems(input.resilienceIndicators, ['indicator', 'currentRead', 'evidenceStatus']),
    investorJudgment: Object.freeze({ status: valueOrUnknown(input.investorJudgment?.status), note: valueOrUnknown(input.investorJudgment?.note) })
  });
}
function normalizeSignalGroup(group) { const source = group || {}; requireText(source.orientation, 'orientation'); return Object.freeze({ ...source, qualitySignals: freezeList(source.qualitySignals), openQuestions: freezeList(source.openQuestions) }); }
function normalizeObject(item, requiredFields) { const source = item || {}; for (const field of requiredFields) requireText(source[field], field); return Object.freeze({ ...source }); }
function normalizeItems(items, requiredFields) { return deepFreeze(freezeList(items).map((item, index) => { for (const field of requiredFields) requireText(item?.[field], `items[${index}].${field}`); return Object.freeze({ ...item }); })); }
function freezeList(value) { return Object.freeze([...(Array.isArray(value) ? value : [])]); }
function valueOrUnknown(value) { return value === undefined || value === null || value === '' ? 'Unknown' : value; }
function requireText(value, label) { if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
