import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-BQ-006',
  workspace: 'Company Workspace',
  epic: 'Business Quality',
  featureId: 'BQ.6',
  featureName: 'Financial Quality',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'Are profitability and cash generation consistently strong?',
  purpose: 'Assess the quality and consistency of profitability, cash generation, returns, earnings quality, margins, capital efficiency, and financial consistency without performing valuation.'
});

const DEFAULT_FINANCIAL_QUALITY_INPUT = Object.freeze({
  company: Object.freeze({ displayName: 'Apex Consumer Products' }),
  profitabilityProfile: Object.freeze({
    currentRead: 'Requires multi-year margin evidence',
    qualityIndicators: Object.freeze(['gross margin trend', 'operating margin trend', 'net margin trend']),
    evidenceExpectation: 'Multi-year operating margin, net margin, gross margin trends'
  }),
  cashGeneration: Object.freeze({
    currentRead: 'Requires operating cash flow and free cash flow conversion review',
    qualityIndicators: Object.freeze(['operating cash flow consistency', 'free cash flow conversion', 'cash earnings quality']),
    evidenceExpectation: 'Operating cash flow, free cash flow, cash conversion'
  }),
  returnOnCapital: Object.freeze({
    currentRead: 'Requires ROIC, ROCE, and incremental return history',
    qualityIndicators: Object.freeze(['ROIC trend', 'ROCE trend', 'incremental return on reinvestment']),
    evidenceExpectation: 'ROIC, ROCE, incremental returns'
  }),
  earningsQuality: Object.freeze({
    currentRead: 'Requires accruals, exceptional items, and cash earnings review',
    qualityIndicators: Object.freeze(['low recurring exceptional items', 'cash-backed earnings', 'reasonable accruals']),
    evidenceExpectation: 'Accruals, cash earnings, exceptional items'
  }),
  marginStability: Object.freeze({
    currentRead: 'Requires margin behavior across inflation, competition, and cycle changes',
    qualityIndicators: Object.freeze(['gross margin stability', 'operating margin resilience', 'downturn margin behavior']),
    evidenceExpectation: 'Margin history across business cycles'
  }),
  capitalEfficiency: Object.freeze({
    currentRead: 'Requires asset turnover, reinvestment efficiency, and working capital trend review',
    qualityIndicators: Object.freeze(['asset turnover', 'inventory efficiency', 'working capital discipline']),
    evidenceExpectation: 'Asset turnover, reinvestment efficiency, working capital trends'
  }),
  financialConsistency: Object.freeze({
    currentRead: 'Requires 5-10 year financial history and cyclicality review',
    qualityIndicators: Object.freeze(['revenue consistency', 'profit consistency', 'cash flow consistency', 'downturn resilience']),
    evidenceExpectation: '5–10 year financial history, cyclicality, resilience through downturns'
  }),
  investorJudgment: Object.freeze({ status: 'Financial quality reviewed', note: 'Financial quality is not concluded. Evidence must establish consistency and cash-backed performance before quality confidence can increase.' })
});

export function createFinancialQuality(input = DEFAULT_FINANCIAL_QUALITY_INPUT) {
  const normalized = normalizeInput(input);
  const evidenceExpectations = createEvidenceExpectations(normalized);
  const qualityFacts = createFinancialQualityFacts(normalized);
  const aiInterpretation = createAiInterpretation(normalized);
  const investorJudgment = createInvestorJudgment(normalized);
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Low',
    coverage: 46,
    rationale: 'Financial Quality identifies the required dimensions, but source-linked multi-year margins, cash flow, returns, accruals, and consistency evidence are not yet connected.',
    evidenceItems: ['profitability profile', 'cash generation', 'return on capital', 'earnings quality', 'margin stability', 'capital efficiency', 'financial consistency'],
    missingEvidence: [
      { label: '5-10 year gross, operating, and net margin history', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'operating cash flow and free cash flow conversion history', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'ROIC and ROCE trend history', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'accruals and exceptional items review', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'asset turnover and working capital trend data', priority: 'Medium', status: 'missing', sourceCount: 0 },
      { label: 'downturn or cycle-period financial history', priority: 'Medium', status: 'missing', sourceCount: 0 }
    ]
  });
  const sections = Object.freeze({
    financialQualityHeader: createFinancialQualityHeader(normalized),
    profitabilityProfile: createSection('ProfitabilityProfile', normalized.profitabilityProfile),
    cashGeneration: createSection('CashGeneration', normalized.cashGeneration),
    returnOnCapital: createSection('ReturnOnCapital', normalized.returnOnCapital),
    earningsQuality: createSection('EarningsQuality', normalized.earningsQuality),
    marginStability: createSection('MarginStability', normalized.marginStability),
    capitalEfficiency: createSection('CapitalEfficiency', normalized.capitalEfficiency),
    financialConsistency: createSection('FinancialConsistency', normalized.financialConsistency),
    evidenceExpectations,
    qualityFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    financialQualityAssessmentOnly: true,
    noFinancialQualityScore: true,
    noRanking: true,
    noQualityScore: true,
    noIntrinsicValue: true,
    noValuation: true,
    noRecommendation: true,
    noExecution: true
  });
  const futureExtensions = Object.freeze(['financial statement integration', 'margin trend charts', 'cash conversion analysis', 'ROIC and ROCE trend view', 'earnings quality diagnostics']);

  return deepFreeze({
    type: 'financial-quality',
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
      extensions: {
        quality: {
          dimension: 'Financial Quality',
          financialDimensions: Object.freeze(['profitability', 'cash generation', 'return on capital', 'earnings quality', 'margin stability', 'capital efficiency', 'financial consistency']),
          evidenceExpectations: evidenceExpectations.items,
          measurementDeferred: true
        }
      }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      financialQualityNotValuation: true,
      userCanUnderstand: Object.freeze(['profitability quality', 'cash generation quality', 'return quality', 'earnings quality', 'margin stability', 'capital efficiency', 'financial consistency']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultFinancialQualityInput() { return clone(DEFAULT_FINANCIAL_QUALITY_INPUT); }

function createFinancialQualityHeader(input) { return Object.freeze({ component: 'FinancialQualityHeader', companyName: input.company.displayName, investorQuestion: FEATURE_META.investorQuestion }); }
function createSection(component, input) { return Object.freeze({ component, ...input, factsOnly: false }); }
function createEvidenceExpectations(input) { return Object.freeze({ component: 'FinancialQualityEvidenceExpectations', items: deepFreeze([
  { section: 'Profitability Profile', typicalEvidence: input.profitabilityProfile.evidenceExpectation },
  { section: 'Cash Generation', typicalEvidence: input.cashGeneration.evidenceExpectation },
  { section: 'Return on Capital', typicalEvidence: input.returnOnCapital.evidenceExpectation },
  { section: 'Earnings Quality', typicalEvidence: input.earningsQuality.evidenceExpectation },
  { section: 'Margin Stability', typicalEvidence: input.marginStability.evidenceExpectation },
  { section: 'Capital Efficiency', typicalEvidence: input.capitalEfficiency.evidenceExpectation },
  { section: 'Financial Consistency', typicalEvidence: input.financialConsistency.evidenceExpectation }
]), actionable: true }); }
function createFinancialQualityFacts(input) { return Object.freeze({ component: 'FinancialQualityFacts', items: deepFreeze([
  { id: 'profitability-profile', kind: 'fact', source: 'financial-quality-input', value: input.profitabilityProfile.currentRead },
  { id: 'cash-generation', kind: 'fact', source: 'financial-quality-input', value: input.cashGeneration.currentRead },
  { id: 'return-on-capital', kind: 'fact', source: 'financial-quality-input', value: input.returnOnCapital.currentRead },
  { id: 'earnings-quality', kind: 'fact', source: 'financial-quality-input', value: input.earningsQuality.currentRead },
  { id: 'financial-consistency', kind: 'fact', source: 'financial-quality-input', value: input.financialConsistency.currentRead }
]), factsOnly: true }); }
function createAiInterpretation(input) { return Object.freeze({ component: 'FinancialQualityAIInterpretation', kind: 'generated_explanation', source: 'deterministic-product-summary', basedOn: Object.freeze(['profitability-profile', 'cash-generation', 'return-on-capital', 'earnings-quality', 'margin-stability', 'capital-efficiency', 'financial-consistency']), summary: `${input.company.displayName}'s financial quality cannot be concluded until multi-year profitability, cash conversion, returns, earnings quality, and consistency evidence are connected. This feature identifies what must be verified before judging financial quality.`, caution: 'Generated financial quality interpretation only. It does not calculate intrinsic value, perform valuation, rank the company, recommend action, or replace investor judgment.' }); }
function createInvestorJudgment(input) { return Object.freeze({ component: 'FinancialQualityInvestorJudgment', status: input.investorJudgment.status, note: input.investorJudgment.note, controlledBy: 'Investor', noAutomation: true }); }
function normalizeInput(input) { const company = input.company || {}; requireText(company.displayName, 'company.displayName'); return Object.freeze({ company: Object.freeze({ displayName: company.displayName }), profitabilityProfile: normalizeSignalGroup(input.profitabilityProfile), cashGeneration: normalizeSignalGroup(input.cashGeneration), returnOnCapital: normalizeSignalGroup(input.returnOnCapital), earningsQuality: normalizeSignalGroup(input.earningsQuality), marginStability: normalizeSignalGroup(input.marginStability), capitalEfficiency: normalizeSignalGroup(input.capitalEfficiency), financialConsistency: normalizeSignalGroup(input.financialConsistency), investorJudgment: Object.freeze({ status: valueOrUnknown(input.investorJudgment?.status), note: valueOrUnknown(input.investorJudgment?.note) }) }); }
function normalizeSignalGroup(group) { const source = group || {}; requireText(source.currentRead, 'currentRead'); requireText(source.evidenceExpectation, 'evidenceExpectation'); return Object.freeze({ ...source, qualityIndicators: freezeList(source.qualityIndicators) }); }
function freezeList(value) { return Object.freeze([...(Array.isArray(value) ? value : [])]); }
function valueOrUnknown(value) { return value === undefined || value === null || value === '' ? 'Unknown' : value; }
function requireText(value, label) { if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
