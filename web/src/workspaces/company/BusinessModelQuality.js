import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-BQ-002',
  workspace: 'Company Workspace',
  epic: 'Business Quality',
  featureId: 'BQ.2',
  featureName: 'Business Model Quality',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'Is the business model durable?',
  purpose: 'Assess the durability characteristics of the business model without creating a quality score, valuation, recommendation, or investment decision.'
});

const DEFAULT_BUSINESS_MODEL_QUALITY_INPUT = Object.freeze({
  company: Object.freeze({ displayName: 'Apex Consumer Products' }),
  businessModelSummary: Object.freeze({
    model: 'Branded consumer products sold through recurring-use categories and multi-channel distribution.',
    durabilityRead: 'Potentially durable because many products are repeat-purchase categories, but durability depends on brand relevance, distribution strength, pricing resilience, and customer retention evidence.'
  }),
  revenueModel: Object.freeze({
    type: 'Product sales',
    recurringNature: 'Repeat purchase, not contractual recurring revenue',
    durabilityImplication: 'Demand can repeat frequently, but revenue must be defended through product relevance, pricing, availability, and brand execution.'
  }),
  customerDependence: Object.freeze({
    dependenceLevel: 'Medium',
    customerBase: 'Broad consumer base with dependence on retail and distribution channels.',
    keyRisks: Object.freeze(['channel concentration', 'retailer bargaining power', 'consumer brand switching'])
  }),
  switchingCosts: Object.freeze({
    level: 'Low to Medium',
    explanation: 'Consumers can switch brands easily, but habit, taste preference, trust, and availability may create soft switching costs.',
    evidenceNeeded: Object.freeze(['repeat purchase data', 'brand loyalty evidence', 'pricing retention evidence'])
  }),
  repeatPurchase: Object.freeze({
    level: 'Medium to High',
    explanation: 'Core categories are everyday-use products that may support frequent repurchase.',
    limitation: 'Repeat purchase does not guarantee loyalty or pricing power.'
  }),
  scalability: Object.freeze({
    level: 'Medium',
    explanation: 'Scaling depends on manufacturing capacity, distribution reach, working capital, and brand investment.',
    constraints: Object.freeze(['capacity expansion', 'inventory discipline', 'channel execution', 'marketing investment'])
  }),
  operatingLeverage: Object.freeze({
    potential: 'Medium',
    explanation: 'Fixed brand, distribution, and manufacturing investments may create operating leverage if volumes grow.',
    evidenceNeeded: Object.freeze(['fixed cost structure', 'volume growth history', 'margin response to scale'])
  }),
  durabilitySignals: Object.freeze([
    Object.freeze({ signal: 'Repeat purchase categories', read: 'Positive durability signal', evidenceStatus: 'partial' }),
    Object.freeze({ signal: 'Broad product portfolio', read: 'May reduce single-product dependence', evidenceStatus: 'partial' }),
    Object.freeze({ signal: 'Distribution availability', read: 'Important for durability but must be maintained', evidenceStatus: 'partial' }),
    Object.freeze({ signal: 'Low contractual lock-in', read: 'Durability depends on soft factors rather than contracts', evidenceStatus: 'verified' })
  ]),
  fragilitySignals: Object.freeze([
    Object.freeze({ signal: 'Low hard switching costs', implication: 'Customers can switch if price, quality, or availability deteriorates.' }),
    Object.freeze({ signal: 'Channel dependence', implication: 'Retailer and distributor relationships can affect shelf presence.' }),
    Object.freeze({ signal: 'Input cost sensitivity', implication: 'Cost inflation can pressure the model if pricing power is weak.' })
  ]),
  investorJudgment: Object.freeze({ status: 'Business model durability reviewed', note: 'The model has plausible durability signals, but evidence is incomplete. Do not treat this as a business quality score.' })
});

export function createBusinessModelQuality(input = DEFAULT_BUSINESS_MODEL_QUALITY_INPUT) {
  const normalized = normalizeInput(input);
  const modelFacts = createBusinessModelFacts(normalized);
  const aiInterpretation = createAiInterpretation(normalized);
  const investorJudgment = createInvestorJudgment(normalized);
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Medium',
    coverage: 67,
    rationale: 'Business Model Quality identifies durability signals and fragility risks, but direct evidence for repeat purchase, loyalty, channel dependence, and operating leverage remains incomplete.',
    evidenceItems: ['business model summary', 'revenue model', 'customer dependence', 'switching costs', 'repeat purchase', 'scalability', 'operating leverage', 'durability signals', 'fragility signals'],
    missingEvidence: [
      { label: 'repeat purchase or retention evidence', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'brand loyalty or pricing retention evidence', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'channel concentration data', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'fixed cost and operating leverage evidence', priority: 'Medium', status: 'missing', sourceCount: 0 },
      { label: 'input cost pass-through history', priority: 'Medium', status: 'partial', sourceCount: 1 }
    ]
  });
  const sections = Object.freeze({
    businessModelQualityHeader: createBusinessModelQualityHeader(normalized),
    businessModelSummary: createBusinessModelSummary(normalized),
    revenueModel: createRevenueModel(normalized),
    customerDependence: createCustomerDependence(normalized),
    switchingCosts: createSwitchingCosts(normalized),
    repeatPurchase: createRepeatPurchase(normalized),
    scalability: createScalability(normalized),
    operatingLeverage: createOperatingLeverage(normalized),
    durabilitySignals: createDurabilitySignals(normalized),
    fragilitySignals: createFragilitySignals(normalized),
    modelFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    durabilityAssessmentOnly: true,
    noQualityScore: true,
    noRanking: true,
    noValuation: true,
    noRecommendation: true,
    noExecution: true
  });
  const futureExtensions = Object.freeze(['retention evidence links', 'channel concentration analysis', 'operating leverage trend view', 'business model durability score after all dimensions are implemented']);

  return deepFreeze({
    type: 'business-model-quality',
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
      facts: modelFacts.items,
      aiInterpretation,
      investorJudgment,
      evidenceConfidence,
      guardrails,
      sections,
      metadata: { workspace: FEATURE_META.workspace, status: FEATURE_META.status, futureExtensions },
      extensions: {
        quality: {
          dimension: 'Business Model',
          durabilitySignals: normalized.durabilitySignals,
          fragilitySignals: normalized.fragilitySignals,
          measurementDeferred: true
        }
      }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      assessesDurabilityNotScore: true,
      userCanUnderstand: Object.freeze(['revenue model durability', 'customer dependence', 'switching costs', 'repeat purchase characteristics', 'scalability', 'operating leverage potential', 'durability signals', 'fragility signals']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultBusinessModelQualityInput() {
  return clone(DEFAULT_BUSINESS_MODEL_QUALITY_INPUT);
}

function createBusinessModelQualityHeader(input) { return Object.freeze({ component: 'BusinessModelQualityHeader', companyName: input.company.displayName, investorQuestion: FEATURE_META.investorQuestion }); }
function createBusinessModelSummary(input) { return Object.freeze({ component: 'BusinessModelSummary', ...input.businessModelSummary, factsOnly: false }); }
function createRevenueModel(input) { return Object.freeze({ component: 'BusinessModelRevenueModel', ...input.revenueModel, factsOnly: false }); }
function createCustomerDependence(input) { return Object.freeze({ component: 'CustomerDependence', ...input.customerDependence, factsOnly: false }); }
function createSwitchingCosts(input) { return Object.freeze({ component: 'SwitchingCosts', ...input.switchingCosts, factsOnly: false }); }
function createRepeatPurchase(input) { return Object.freeze({ component: 'RepeatPurchase', ...input.repeatPurchase, factsOnly: false }); }
function createScalability(input) { return Object.freeze({ component: 'Scalability', ...input.scalability, factsOnly: false }); }
function createOperatingLeverage(input) { return Object.freeze({ component: 'OperatingLeverage', ...input.operatingLeverage, factsOnly: false }); }
function createDurabilitySignals(input) { return Object.freeze({ component: 'DurabilitySignals', items: input.durabilitySignals, factsOnly: false }); }
function createFragilitySignals(input) { return Object.freeze({ component: 'FragilitySignals', items: input.fragilitySignals, factsOnly: false }); }

function createBusinessModelFacts(input) {
  return Object.freeze({
    component: 'BusinessModelQualityFacts',
    items: deepFreeze([
      { id: 'business-model', kind: 'fact', source: 'business-model-quality-input', value: input.businessModelSummary.model },
      { id: 'revenue-model', kind: 'fact', source: 'business-model-quality-input', value: input.revenueModel.type },
      { id: 'customer-dependence', kind: 'fact', source: 'business-model-quality-input', value: input.customerDependence.dependenceLevel },
      { id: 'switching-costs', kind: 'fact', source: 'business-model-quality-input', value: input.switchingCosts.level },
      { id: 'repeat-purchase', kind: 'fact', source: 'business-model-quality-input', value: input.repeatPurchase.level },
      { id: 'scalability', kind: 'fact', source: 'business-model-quality-input', value: input.scalability.level }
    ]),
    factsOnly: true
  });
}

function createAiInterpretation(input) {
  return Object.freeze({
    component: 'BusinessModelQualityAIInterpretation',
    kind: 'generated_explanation',
    source: 'deterministic-product-summary',
    basedOn: Object.freeze(['business-model-summary', 'revenue-model', 'customer-dependence', 'switching-costs', 'repeat-purchase', 'scalability', 'operating-leverage', 'durability-signals', 'fragility-signals']),
    summary: `${input.company.displayName}'s business model durability appears tied to repeat purchase behavior, distribution availability, and soft customer habits rather than contractual lock-in. The main fragilities to validate are ${input.fragilitySignals.map(item => item.signal.toLowerCase()).join(', ')}.`,
    caution: 'Generated durability interpretation only. It does not create a quality score, rank the company, value the business, recommend action, or replace investor judgment.'
  });
}
function createInvestorJudgment(input) { return Object.freeze({ component: 'BusinessModelQualityInvestorJudgment', status: input.investorJudgment.status, note: input.investorJudgment.note, controlledBy: 'Investor', noAutomation: true }); }

function normalizeInput(input) {
  const company = input.company || {};
  requireText(company.displayName, 'company.displayName');
  return Object.freeze({
    company: Object.freeze({ displayName: company.displayName }),
    businessModelSummary: normalizeObject(input.businessModelSummary, ['model', 'durabilityRead']),
    revenueModel: normalizeObject(input.revenueModel, ['type', 'recurringNature', 'durabilityImplication']),
    customerDependence: normalizeListObject(input.customerDependence, ['dependenceLevel', 'customerBase'], ['keyRisks']),
    switchingCosts: normalizeListObject(input.switchingCosts, ['level', 'explanation'], ['evidenceNeeded']),
    repeatPurchase: normalizeObject(input.repeatPurchase, ['level', 'explanation', 'limitation']),
    scalability: normalizeListObject(input.scalability, ['level', 'explanation'], ['constraints']),
    operatingLeverage: normalizeListObject(input.operatingLeverage, ['potential', 'explanation'], ['evidenceNeeded']),
    durabilitySignals: normalizeItems(input.durabilitySignals, ['signal', 'read', 'evidenceStatus']),
    fragilitySignals: normalizeItems(input.fragilitySignals, ['signal', 'implication']),
    investorJudgment: Object.freeze({ status: valueOrUnknown(input.investorJudgment?.status), note: valueOrUnknown(input.investorJudgment?.note) })
  });
}
function normalizeObject(item, requiredFields) { const source = item || {}; for (const field of requiredFields) requireText(source[field], field); return Object.freeze({ ...source }); }
function normalizeListObject(item, requiredFields, listFields) { const source = normalizeObject(item, requiredFields); const lists = Object.fromEntries(listFields.map(field => [field, freezeList(item?.[field])])); return Object.freeze({ ...source, ...lists }); }
function normalizeItems(items, requiredFields) { return deepFreeze(freezeList(items).map((item, index) => { for (const field of requiredFields) requireText(item?.[field], `items[${index}].${field}`); return Object.freeze({ ...item }); })); }
function freezeList(value) { return Object.freeze([...(Array.isArray(value) ? value : [])]); }
function valueOrUnknown(value) { return value === undefined || value === null || value === '' ? 'Unknown' : value; }
function requireText(value, label) { if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
