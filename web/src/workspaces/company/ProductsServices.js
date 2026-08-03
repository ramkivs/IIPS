import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createOverviewFeatureView } from './OverviewFeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-OV-005',
  workspace: 'Company Workspace',
  epic: 'Overview',
  featureId: '1.5',
  featureName: 'Products & Services',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'What exactly does this company sell, and who uses it?',
  purpose: 'Explain the company product portfolio from the customer perspective, including offerings, customers, use cases, value proposition, qualitative revenue drivers, differentiation, and product lifecycle.'
});

const DEFAULT_PRODUCTS_SERVICES_INPUT = Object.freeze({
  company: Object.freeze({ displayName: 'Apex Consumer Products' }),
  productPortfolio: Object.freeze({
    summary: 'Apex sells everyday packaged food, beverage, and household essential products used by households and selected institutional customers.',
    portfolioRole: 'Recurring consumer purchase portfolio'
  }),
  coreOfferings: Object.freeze([
    Object.freeze({ name: 'Packaged foods', customerNeed: 'Convenient daily meals and snacks', usageFrequency: 'Frequent', maturity: 'Mature' }),
    Object.freeze({ name: 'Beverages', customerNeed: 'Refreshment and occasion-led consumption', usageFrequency: 'Frequent', maturity: 'Growth pockets' }),
    Object.freeze({ name: 'Household essentials', customerNeed: 'Routine household consumption', usageFrequency: 'Recurring', maturity: 'Mature' })
  ]),
  customerSegments: Object.freeze([
    Object.freeze({ segment: 'Households', type: 'B2C', description: 'Retail consumers buying through general trade, modern trade, and digital channels.' }),
    Object.freeze({ segment: 'Retailers and distributors', type: 'B2B', description: 'Channel partners that stock, distribute, and promote products.' }),
    Object.freeze({ segment: 'Institutions', type: 'B2B', description: 'Selected bulk buyers for food service, pantry, or wholesale needs.' })
  ]),
  primaryUseCases: Object.freeze([
    Object.freeze({ useCase: 'Daily consumption', relatedOfferings: Object.freeze(['Packaged foods', 'Beverages']) }),
    Object.freeze({ useCase: 'Convenience purchase', relatedOfferings: Object.freeze(['Packaged foods']) }),
    Object.freeze({ useCase: 'Routine household replenishment', relatedOfferings: Object.freeze(['Household essentials']) })
  ]),
  valueProposition: Object.freeze([
    Object.freeze({ proposition: 'Convenience', explanation: 'Products reduce preparation effort or improve availability for daily needs.' }),
    Object.freeze({ proposition: 'Brand familiarity', explanation: 'Repeat purchase may be supported by recognition and habit.' }),
    Object.freeze({ proposition: 'Channel availability', explanation: 'Broad distribution can make products easy to find when needed.' })
  ]),
  qualitativeRevenueDrivers: Object.freeze([
    Object.freeze({ driver: 'Repeat purchase frequency', explanation: 'More frequent category usage can support recurring product demand without implying contractual revenue.' }),
    Object.freeze({ driver: 'Distribution availability', explanation: 'Products must be available in relevant channels when customers are ready to buy.' }),
    Object.freeze({ driver: 'Portfolio breadth', explanation: 'Multiple categories may create more purchase occasions and shelf presence.' })
  ]),
  productDifferentiation: Object.freeze([
    Object.freeze({ basis: 'Brand and taste preference', limitation: 'Differentiation can weaken if competitors match price, quality, or availability.' }),
    Object.freeze({ basis: 'Packaging and format', limitation: 'Formats can be copied over time.' }),
    Object.freeze({ basis: 'Distribution reach', limitation: 'Channel access requires ongoing execution.' })
  ]),
  productLifecycle: Object.freeze([
    Object.freeze({ offering: 'Packaged foods', lifecycleStage: 'Mature with premiumization opportunities' }),
    Object.freeze({ offering: 'Beverages', lifecycleStage: 'Selective growth' }),
    Object.freeze({ offering: 'Household essentials', lifecycleStage: 'Mature repeat-purchase category' })
  ]),
  investorJudgment: Object.freeze({ status: 'Product portfolio reviewed', note: 'Products and customers are understandable; next review should validate segment data and customer concentration.' })
});

export function createProductsServices(input = DEFAULT_PRODUCTS_SERVICES_INPUT) {
  const normalized = normalizeInput(input);
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Medium',
    coverage: 74,
    rationale: 'Products & Services has clear product, customer, use-case, and value-proposition coverage, but still needs source-linked product catalogs, channel data, and customer concentration evidence.',
    evidenceItems: ['product portfolio', 'core offerings', 'customer segments', 'use cases', 'value proposition', 'qualitative revenue drivers', 'product differentiation', 'product lifecycle'],
    missingEvidence: ['source-linked product catalog', 'channel-level evidence', 'customer concentration evidence']
  });
  const sections = Object.freeze({
    productsHeader: createProductsHeader(normalized),
    productPortfolio: createProductPortfolio(normalized),
    coreOfferings: createCoreOfferings(normalized),
    customerSegments: createCustomerSegments(normalized),
    primaryUseCases: createPrimaryUseCases(normalized),
    valueProposition: createValueProposition(normalized),
    qualitativeRevenueDrivers: createQualitativeRevenueDrivers(normalized),
    productDifferentiation: createProductDifferentiation(normalized),
    productLifecycle: createProductLifecycle(normalized),
    productFacts: normalized.productFacts,
    aiInterpretation: createAiInterpretation(normalized),
    investorJudgment: createInvestorJudgment(normalized)
  });
  const guardrails = Object.freeze({ qualitativeRevenueOnly: true, noReportedSegmentRevenue: true, noValuation: true, noScoring: true, noRecommendation: true, noExecution: true });
  const futureExtensions = Object.freeze(['product catalog links', 'customer concentration analysis', 'SKU-level lifecycle view', 'channel-level product mapping']);

  return deepFreeze({
    type: 'products-services',
    feature: FEATURE_META,
    businessLogic: false,
    selfContained: true,
    responsive: Object.freeze({ supportsCompact: true, supportsWide: true, minimumContentWidth: 320 }),
    evidenceConfidence,
    sections,
    overviewFeatureView: createOverviewFeatureView({
      type: 'products-services',
      feature: FEATURE_META,
      facts: sections.productFacts.items,
      aiInterpretation: sections.aiInterpretation,
      investorJudgment: sections.investorJudgment,
      evidenceConfidence,
      guardrails,
      futureExtensions,
      sections
    }),
    boundaries: Object.freeze({
      customerPerspective: true,
      qualitativeRevenueOnly: true,
      noReportedSegmentRevenue: true,
      noValuation: true,
      noScoring: true,
      noRecommendation: true,
      noExecution: true
    }),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      customerPerspective: true,
      qualitativeRevenueDriversOnly: true,
      doesNotDuplicateRevenueSegments: true,
      userCanUnderstand: Object.freeze(['product portfolio', 'core offerings', 'customer segments', 'primary use cases', 'value proposition', 'qualitative revenue drivers', 'product differentiation', 'product lifecycle']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultProductsServicesInput() {
  return clone(DEFAULT_PRODUCTS_SERVICES_INPUT);
}

function createProductsHeader(input) {
  return Object.freeze({ component: 'ProductsHeader', companyName: input.company.displayName, investorQuestion: FEATURE_META.investorQuestion });
}
function createProductPortfolio(input) { return Object.freeze({ component: 'ProductPortfolio', ...input.productPortfolio, factsOnly: true }); }
function createCoreOfferings(input) { return Object.freeze({ component: 'CoreOfferings', items: input.coreOfferings, factsOnly: true }); }
function createCustomerSegments(input) { return Object.freeze({ component: 'CustomerSegments', items: input.customerSegments, factsOnly: true }); }
function createPrimaryUseCases(input) { return Object.freeze({ component: 'PrimaryUseCases', items: input.primaryUseCases, factsOnly: true }); }
function createValueProposition(input) { return Object.freeze({ component: 'ValueProposition', items: input.valueProposition, factsOnly: true }); }
function createQualitativeRevenueDrivers(input) { return Object.freeze({ component: 'QualitativeRevenueDrivers', items: input.qualitativeRevenueDrivers, qualitativeOnly: true, factsOnly: true }); }
function createProductDifferentiation(input) { return Object.freeze({ component: 'ProductDifferentiation', items: input.productDifferentiation, factsOnly: true }); }
function createProductLifecycle(input) { return Object.freeze({ component: 'ProductLifecycle', items: input.productLifecycle, factsOnly: true }); }
function createProductFacts(input) {
  return Object.freeze({
    component: 'ProductFacts',
    items: deepFreeze([
      { id: 'portfolio-role', kind: 'fact', source: 'products-services-input', value: input.productPortfolio.portfolioRole },
      { id: 'core-offerings', kind: 'fact', source: 'products-services-input', value: input.coreOfferings.map(item => item.name).join(', ') },
      { id: 'customer-segments', kind: 'fact', source: 'products-services-input', value: input.customerSegments.map(item => `${item.segment} (${item.type})`).join(', ') },
      { id: 'primary-use-cases', kind: 'fact', source: 'products-services-input', value: input.primaryUseCases.map(item => item.useCase).join(', ') }
    ]),
    factsOnly: true
  });
}
function createAiInterpretation(input) {
  return Object.freeze({
    component: 'ProductsAIInterpretation',
    kind: 'generated_explanation',
    source: 'deterministic-product-summary',
    basedOn: Object.freeze(['product-portfolio', 'core-offerings', 'customer-segments', 'use-cases', 'value-proposition', 'qualitative-revenue-drivers', 'product-differentiation', 'product-lifecycle']),
    summary: `${input.company.displayName} sells recurring-use products to ${input.customerSegments.map(item => item.segment.toLowerCase()).join(', ')}. The main qualitative revenue drivers are ${input.qualitativeRevenueDrivers.map(item => item.driver.toLowerCase()).join(', ')}.`,
    caution: 'Generated product interpretation only. Revenue drivers are qualitative business drivers, not reported revenue segments or valuation inputs.'
  });
}
function createInvestorJudgment(input) { return Object.freeze({ component: 'ProductsInvestorJudgment', status: input.investorJudgment.status, note: input.investorJudgment.note, controlledBy: 'Investor', noAutomation: true }); }

function normalizeInput(input) {
  const company = input.company || {};
  requireText(company.displayName, 'company.displayName');
  const normalized = Object.freeze({
    company: Object.freeze({ displayName: company.displayName }),
    productPortfolio: normalizeObject(input.productPortfolio, ['summary', 'portfolioRole']),
    coreOfferings: normalizeItems(input.coreOfferings, ['name', 'customerNeed', 'usageFrequency', 'maturity']),
    customerSegments: normalizeItems(input.customerSegments, ['segment', 'type', 'description']),
    primaryUseCases: normalizeItems(input.primaryUseCases, ['useCase'], item => Object.freeze({ ...item, relatedOfferings: freezeList(item.relatedOfferings) })),
    valueProposition: normalizeItems(input.valueProposition, ['proposition', 'explanation']),
    qualitativeRevenueDrivers: normalizeItems(input.qualitativeRevenueDrivers, ['driver', 'explanation']),
    productDifferentiation: normalizeItems(input.productDifferentiation, ['basis', 'limitation']),
    productLifecycle: normalizeItems(input.productLifecycle, ['offering', 'lifecycleStage']),
    investorJudgment: Object.freeze({ status: valueOrUnknown(input.investorJudgment?.status), note: valueOrUnknown(input.investorJudgment?.note) })
  });
  return Object.freeze({ ...normalized, productFacts: createProductFacts(normalized) });
}

function normalizeObject(item, requiredFields) {
  const source = item || {};
  for (const field of requiredFields) requireText(source[field], field);
  return Object.freeze({ ...source });
}
function normalizeItems(items, requiredFields, transform = item => Object.freeze({ ...item })) {
  return deepFreeze(freezeList(items).map((item, index) => {
    for (const field of requiredFields) requireText(item?.[field], `items[${index}].${field}`);
    return transform(item);
  }));
}
function freezeList(value) { return Object.freeze([...(Array.isArray(value) ? value : [])]); }
function valueOrUnknown(value) { return value === undefined || value === null || value === '' ? 'Unknown' : value; }
function requireText(value, label) { if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
