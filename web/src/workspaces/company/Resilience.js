import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-BQ-007',
  workspace: 'Company Workspace',
  epic: 'Business Quality',
  featureId: 'BQ.7',
  featureName: 'Resilience',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'Can the business withstand adversity?',
  purpose: 'Assess whether the business can absorb, adapt to, and recover from adverse conditions without becoming a risk rating, valuation, recommendation, or investment decision.'
});

const DEFAULT_RESILIENCE_INPUT = Object.freeze({
  company: Object.freeze({ displayName: 'Apex Consumer Products' }),
  businessDependence: Object.freeze({
    currentRead: 'The business appears dependent on recurring consumer categories, distribution execution, and domestic demand concentration.',
    dependencyTypes: Object.freeze(['category demand', 'distribution availability', 'domestic market concentration']),
    evidenceExpectation: 'Revenue mix, concentration disclosures'
  }),
  customerConcentration: Object.freeze({
    currentRead: 'Likely broad end-consumer base, but channel and distributor concentration require evidence.',
    concentrationLevel: 'To verify',
    evidenceExpectation: 'Top customer disclosures, renewal history'
  }),
  supplierDependence: Object.freeze({
    currentRead: 'Input, packaging, commodity, and logistics dependence require supplier and sourcing review.',
    dependenceLevel: 'Medium to verify',
    evidenceExpectation: 'Supplier concentration, sourcing strategy'
  }),
  geographicConcentration: Object.freeze({
    currentRead: 'High India exposure may create local-demand and local-policy concentration.',
    concentrationLevel: 'High',
    evidenceExpectation: 'Revenue and production by geography'
  }),
  balanceSheetFlexibility: Object.freeze({
    currentRead: 'Liquidity, debt maturity, refinancing flexibility, and unused facilities are not yet connected.',
    flexibilityRead: 'Unknown',
    evidenceExpectation: 'Liquidity, debt maturity profile, unused facilities'
  }),
  cashFlowResilience: Object.freeze({
    currentRead: 'Requires operating cash flow and free cash flow behavior through stress periods.',
    resilienceRead: 'Unknown',
    evidenceExpectation: 'Cash flow through downturns, stress periods'
  }),
  pricingResilience: Object.freeze({
    currentRead: 'Requires evidence of margin retention during inflation, input cost shocks, and promotional pressure.',
    resilienceRead: 'Unknown',
    evidenceExpectation: 'Margin retention during inflation or commodity cycles'
  }),
  historicalRecovery: Object.freeze({
    currentRead: 'Requires evidence from recessions, disruptions, commodity cycles, or category shocks.',
    recoveryRead: 'Unknown',
    evidenceExpectation: 'Performance after recessions, disruptions, or industry shocks'
  }),
  adaptiveCapacity: Object.freeze({
    currentRead: 'Adaptability may depend on product refresh, channel shifts, operational response, and management execution.',
    adaptabilityRead: 'To verify',
    evidenceExpectation: 'Product innovation, operational changes, management responses'
  }),
  shockScenarios: Object.freeze([
    Object.freeze({ scenario: 'Input cost inflation', expectedPressure: 'Margin compression and pricing challenge', responseEvidenceNeeded: 'price increase history and margin retention' }),
    Object.freeze({ scenario: 'Distribution disruption', expectedPressure: 'Availability loss and channel inventory stress', responseEvidenceNeeded: 'alternate channel and logistics response history' }),
    Object.freeze({ scenario: 'Demand slowdown', expectedPressure: 'Volume decline and promotional pressure', responseEvidenceNeeded: 'downturn volume and cash flow history' }),
    Object.freeze({ scenario: 'Regulatory or compliance shock', expectedPressure: 'Product reformulation, recall, or distribution interruption', responseEvidenceNeeded: 'compliance track record and recall response evidence' })
  ]),
  investorJudgment: Object.freeze({ status: 'Resilience reviewed', note: 'Resilience is not concluded. The business may have repeat-purchase support, but shock response and recovery evidence remain incomplete.' })
});

export function createResilience(input = DEFAULT_RESILIENCE_INPUT) {
  const normalized = normalizeInput(input);
  const evidenceExpectations = createEvidenceExpectations(normalized);
  const qualityFacts = createResilienceFacts(normalized);
  const aiInterpretation = createAiInterpretation(normalized);
  const investorJudgment = createInvestorJudgment(normalized);
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Low',
    coverage: 52,
    rationale: 'Resilience identifies dependence, shock scenarios, response capabilities, and adaptability questions, but downturn history, stress-period cash flow, pricing resilience, and recovery evidence remain incomplete.',
    evidenceItems: ['business dependence', 'customer concentration', 'supplier dependence', 'geographic concentration', 'balance sheet flexibility', 'cash flow resilience', 'pricing resilience', 'historical recovery', 'adaptive capacity'],
    missingEvidence: [
      { label: 'cash flow through downturns or stress periods', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'margin retention during inflation or commodity shocks', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'customer or channel concentration evidence', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'supplier concentration and sourcing strategy', priority: 'Medium', status: 'missing', sourceCount: 0 },
      { label: 'liquidity and debt maturity profile', priority: 'Medium', status: 'missing', sourceCount: 0 },
      { label: 'historical recovery after disruptions', priority: 'Medium', status: 'missing', sourceCount: 0 }
    ]
  });
  const sections = Object.freeze({
    resilienceHeader: createResilienceHeader(normalized),
    businessDependence: createSection('BusinessDependence', normalized.businessDependence),
    customerConcentration: createSection('CustomerConcentration', normalized.customerConcentration),
    supplierDependence: createSection('SupplierDependence', normalized.supplierDependence),
    geographicConcentration: createSection('GeographicConcentration', normalized.geographicConcentration),
    balanceSheetFlexibility: createSection('BalanceSheetFlexibility', normalized.balanceSheetFlexibility),
    cashFlowResilience: createSection('CashFlowResilience', normalized.cashFlowResilience),
    pricingResilience: createSection('PricingResilience', normalized.pricingResilience),
    historicalRecovery: createSection('HistoricalRecovery', normalized.historicalRecovery),
    adaptiveCapacity: createSection('AdaptiveCapacity', normalized.adaptiveCapacity),
    shockScenarios: createShockScenarios(normalized),
    evidenceExpectations,
    qualityFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    resilienceAssessmentOnly: true,
    noResilienceScore: true,
    noRanking: true,
    noQualityScore: true,
    noRiskRating: true,
    noValuation: true,
    noRecommendation: true,
    noExecution: true
  });
  const futureExtensions = Object.freeze(['stress period evidence links', 'cash flow resilience chart', 'pricing resilience tracker', 'shock scenario history', 'recovery timeline']);

  return deepFreeze({
    type: 'resilience',
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
          dimension: 'Resilience',
          shockScenarios: normalized.shockScenarios,
          evidenceExpectations: evidenceExpectations.items,
          measurementDeferred: true
        }
      }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      resilienceNotRiskRating: true,
      userCanUnderstand: Object.freeze(['business dependence', 'customer concentration', 'supplier dependence', 'geographic concentration', 'balance sheet flexibility', 'cash flow resilience', 'pricing resilience', 'historical recovery', 'adaptive capacity']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultResilienceInput() { return clone(DEFAULT_RESILIENCE_INPUT); }

function createResilienceHeader(input) { return Object.freeze({ component: 'ResilienceHeader', companyName: input.company.displayName, investorQuestion: FEATURE_META.investorQuestion }); }
function createSection(component, input) { return Object.freeze({ component, ...input, factsOnly: false }); }
function createShockScenarios(input) { return Object.freeze({ component: 'ShockScenarios', items: input.shockScenarios, factsOnly: false }); }
function createEvidenceExpectations(input) { return Object.freeze({ component: 'ResilienceEvidenceExpectations', items: deepFreeze([
  { section: 'Business Dependence', typicalEvidence: input.businessDependence.evidenceExpectation },
  { section: 'Customer Concentration', typicalEvidence: input.customerConcentration.evidenceExpectation },
  { section: 'Supplier Dependence', typicalEvidence: input.supplierDependence.evidenceExpectation },
  { section: 'Geographic Concentration', typicalEvidence: input.geographicConcentration.evidenceExpectation },
  { section: 'Balance Sheet Flexibility', typicalEvidence: input.balanceSheetFlexibility.evidenceExpectation },
  { section: 'Cash Flow Resilience', typicalEvidence: input.cashFlowResilience.evidenceExpectation },
  { section: 'Pricing Resilience', typicalEvidence: input.pricingResilience.evidenceExpectation },
  { section: 'Historical Recovery', typicalEvidence: input.historicalRecovery.evidenceExpectation },
  { section: 'Adaptive Capacity', typicalEvidence: input.adaptiveCapacity.evidenceExpectation }
]), actionable: true }); }
function createResilienceFacts(input) { return Object.freeze({ component: 'ResilienceFacts', items: deepFreeze([
  { id: 'business-dependence', kind: 'fact', source: 'resilience-input', value: input.businessDependence.currentRead },
  { id: 'customer-concentration', kind: 'fact', source: 'resilience-input', value: input.customerConcentration.concentrationLevel },
  { id: 'supplier-dependence', kind: 'fact', source: 'resilience-input', value: input.supplierDependence.dependenceLevel },
  { id: 'geographic-concentration', kind: 'fact', source: 'resilience-input', value: input.geographicConcentration.concentrationLevel },
  { id: 'balance-sheet-flexibility', kind: 'fact', source: 'resilience-input', value: input.balanceSheetFlexibility.flexibilityRead },
  { id: 'adaptive-capacity', kind: 'fact', source: 'resilience-input', value: input.adaptiveCapacity.adaptabilityRead }
]), factsOnly: true }); }
function createAiInterpretation(input) { return Object.freeze({ component: 'ResilienceAIInterpretation', kind: 'generated_explanation', source: 'deterministic-product-summary', basedOn: Object.freeze(['business-dependence', 'shock-scenarios', 'response-capability', 'recovery-history', 'future-adaptability']), summary: `${input.company.displayName}'s resilience cannot be concluded until cash flow through stress periods, pricing response, concentration exposure, balance sheet flexibility, and recovery history are verified. The feature currently identifies likely shock scenarios and evidence gaps.`, caution: 'Generated resilience interpretation only. It does not assign a resilience score, risk rating, valuation, recommendation, or replace investor judgment.' }); }
function createInvestorJudgment(input) { return Object.freeze({ component: 'ResilienceInvestorJudgment', status: input.investorJudgment.status, note: input.investorJudgment.note, controlledBy: 'Investor', noAutomation: true }); }
function normalizeInput(input) { const company = input.company || {}; requireText(company.displayName, 'company.displayName'); return Object.freeze({ company: Object.freeze({ displayName: company.displayName }), businessDependence: normalizeListObject(input.businessDependence, ['currentRead', 'evidenceExpectation'], ['dependencyTypes']), customerConcentration: normalizeObject(input.customerConcentration, ['currentRead', 'concentrationLevel', 'evidenceExpectation']), supplierDependence: normalizeObject(input.supplierDependence, ['currentRead', 'dependenceLevel', 'evidenceExpectation']), geographicConcentration: normalizeObject(input.geographicConcentration, ['currentRead', 'concentrationLevel', 'evidenceExpectation']), balanceSheetFlexibility: normalizeObject(input.balanceSheetFlexibility, ['currentRead', 'flexibilityRead', 'evidenceExpectation']), cashFlowResilience: normalizeObject(input.cashFlowResilience, ['currentRead', 'resilienceRead', 'evidenceExpectation']), pricingResilience: normalizeObject(input.pricingResilience, ['currentRead', 'resilienceRead', 'evidenceExpectation']), historicalRecovery: normalizeObject(input.historicalRecovery, ['currentRead', 'recoveryRead', 'evidenceExpectation']), adaptiveCapacity: normalizeObject(input.adaptiveCapacity, ['currentRead', 'adaptabilityRead', 'evidenceExpectation']), shockScenarios: normalizeItems(input.shockScenarios, ['scenario', 'expectedPressure', 'responseEvidenceNeeded']), investorJudgment: Object.freeze({ status: valueOrUnknown(input.investorJudgment?.status), note: valueOrUnknown(input.investorJudgment?.note) }) }); }
function normalizeObject(item, requiredFields) { const source = item || {}; for (const field of requiredFields) requireText(source[field], field); return Object.freeze({ ...source }); }
function normalizeListObject(item, requiredFields, listFields) { const source = normalizeObject(item, requiredFields); const lists = Object.fromEntries(listFields.map(field => [field, freezeList(item?.[field])])); return Object.freeze({ ...source, ...lists }); }
function normalizeItems(items, requiredFields) { return deepFreeze(freezeList(items).map((item, index) => { for (const field of requiredFields) requireText(item?.[field], `items[${index}].${field}`); return Object.freeze({ ...item }); })); }
function freezeList(value) { return Object.freeze([...(Array.isArray(value) ? value : [])]); }
function valueOrUnknown(value) { return value === undefined || value === null || value === '' ? 'Unknown' : value; }
function requireText(value, label) { if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
