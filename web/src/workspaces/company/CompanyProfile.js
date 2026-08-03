import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createOverviewFeatureView } from './OverviewFeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-OV-003',
  workspace: 'Company Workspace',
  epic: 'Overview',
  featureId: '1.3',
  featureName: 'Company Profile',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'How is this business organized?',
  purpose: 'Explain the company structure, operating model, customer base, distribution model, revenue model, capital intensity, and regulatory context without repeating the Business Snapshot.'
});

const DEFAULT_COMPANY_PROFILE_INPUT = Object.freeze({
  company: Object.freeze({ displayName: 'Apex Consumer Products' }),
  corporateStructure: Object.freeze({
    parentCompany: 'Apex Consumer Products Limited',
    structureType: 'Listed operating company',
    notableSubsidiaries: Object.freeze(['Apex Foods Private Limited', 'Apex Beverages Private Limited']),
    ownershipNotes: 'Publicly listed parent with operating subsidiaries for major product categories.'
  }),
  operatingModel: Object.freeze({
    model: 'Brand owner with manufacturing, outsourced production support, and multi-channel distribution.',
    keyActivities: Object.freeze(['product development', 'brand management', 'procurement', 'manufacturing coordination', 'distribution', 'retail execution']),
    operatingLeverage: 'Medium',
    workingCapitalIntensity: 'Medium'
  }),
  businessSegments: Object.freeze([
    Object.freeze({ name: 'Packaged foods', role: 'Core volume and brand anchor', operatingNotes: 'Manufactured through internal plants and selected contract partners.' }),
    Object.freeze({ name: 'Beverages', role: 'Growth and premiumization category', operatingNotes: 'Requires cold-chain and retail availability in selected markets.' }),
    Object.freeze({ name: 'Household essentials', role: 'Repeat-purchase adjacency', operatingNotes: 'Distributed through general trade and modern trade channels.' })
  ]),
  geographicFootprint: Object.freeze([
    Object.freeze({ region: 'India', operatingRole: 'Primary market and distribution base' }),
    Object.freeze({ region: 'International', operatingRole: 'Selective export and diaspora-led demand' })
  ]),
  customerCategories: Object.freeze([
    Object.freeze({ category: 'B2C', description: 'Households buying through retail, modern trade, and digital channels' }),
    Object.freeze({ category: 'B2B', description: 'Institutional and wholesale buyers for selected categories' })
  ]),
  distributionModel: Object.freeze({
    channels: Object.freeze(['general trade', 'modern trade', 'e-commerce', 'direct-to-consumer', 'institutional distribution']),
    dependencyNotes: 'Execution depends on shelf availability, distributor relationships, and channel inventory discipline.'
  }),
  revenueModel: Object.freeze({
    primaryModel: 'Product sales',
    pricingModel: 'Unit volume multiplied by realized price, adjusted for trade schemes and channel mix.',
    recurringNature: 'Repeat-purchase consumer categories, but not contractual recurring revenue.'
  }),
  capitalIntensity: Object.freeze({
    level: 'Medium',
    drivers: Object.freeze(['manufacturing capacity', 'working capital', 'brand investment', 'distribution infrastructure']),
    investorImplication: 'Requires review of asset turns, inventory discipline, and reinvestment returns before forming conviction.'
  }),
  regulatoryEnvironment: Object.freeze({
    level: 'Medium',
    regimes: Object.freeze(['food safety regulation', 'consumer protection', 'labeling standards', 'tax compliance', 'advertising standards']),
    investorImplication: 'Regulatory failures can affect recalls, brand trust, distribution, and margins.'
  }),
  investorJudgment: Object.freeze({ status: 'Profile reviewed', note: 'Operating structure is understandable; financial quality and competitive position still need separate review.' })
});

export function createCompanyProfile(input = DEFAULT_COMPANY_PROFILE_INPUT) {
  const normalized = normalizeInput(input);
  const structuralFacts = createStructuralFacts(normalized);
  const aiInterpretation = createAiInterpretation(normalized);
  const investorJudgment = createInvestorJudgment(normalized);
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Medium',
    coverage: 72,
    rationale: 'Company Profile is structurally complete across operating model, segments, customers, distribution, revenue model, capital intensity, and regulation, but it still needs source-linked documentation.',
    evidenceItems: ['corporate structure', 'operating model', 'business segments', 'customer categories', 'distribution model', 'revenue model', 'capital intensity', 'regulatory environment'],
    missingEvidence: ['subsidiary filings', 'operating asset map', 'customer concentration evidence']
  });
  const futureExtensions = Object.freeze(['subsidiary map', 'operating asset map', 'customer concentration links', 'regulatory risk flags']);

  return deepFreeze({
    type: 'company-profile',
    feature: FEATURE_META,
    businessLogic: false,
    selfContained: true,
    responsive: Object.freeze({ supportsCompact: true, supportsWide: true, minimumContentWidth: 320 }),
    evidenceConfidence,
    sections: Object.freeze({
      profileHeader: createProfileHeader(normalized),
      corporateStructure: createCorporateStructure(normalized),
      operatingModel: createOperatingModel(normalized),
      businessSegments: createBusinessSegments(normalized),
      geographicFootprint: createGeographicFootprint(normalized),
      customerCategories: createCustomerCategories(normalized),
      distributionModel: createDistributionModel(normalized),
      revenueModel: createRevenueModel(normalized),
      capitalIntensity: createCapitalIntensity(normalized),
      regulatoryEnvironment: createRegulatoryEnvironment(normalized),
      structuralFacts,
      aiInterpretation,
      investorJudgment
    }),
    overviewFeatureView: createOverviewFeatureView({
      type: 'company-profile',
      feature: FEATURE_META,
      facts: structuralFacts.items,
      aiInterpretation,
      investorJudgment,
      evidenceConfidence,
      guardrails: { noValuation: true, noScoring: true, noRecommendation: true, noExecution: true },
      futureExtensions,
      sections: Object.freeze({
        profileHeader: createProfileHeader(normalized),
        corporateStructure: createCorporateStructure(normalized),
        operatingModel: createOperatingModel(normalized),
        businessSegments: createBusinessSegments(normalized),
        geographicFootprint: createGeographicFootprint(normalized),
        customerCategories: createCustomerCategories(normalized),
        distributionModel: createDistributionModel(normalized),
        revenueModel: createRevenueModel(normalized),
        capitalIntensity: createCapitalIntensity(normalized),
        regulatoryEnvironment: createRegulatoryEnvironment(normalized),
        structuralFacts,
        aiInterpretation,
        investorJudgment
      })
    }),
    boundaries: Object.freeze({
      structuralFacts: 'Operating and organizational facts about how the business works.',
      aiInterpretation: 'Generated structural explanation only; it does not evaluate attractiveness.',
      investorJudgment: 'Investor-controlled profile review status.',
      noValuation: true,
      noScoring: true,
      noRecommendation: true,
      noExecution: true
    }),
    acceptance: Object.freeze({
      independentlyUsable: true,
      userCanUnderstand: Object.freeze(['corporate structure', 'operating model', 'customer categories', 'distribution model', 'revenue model', 'capital intensity', 'regulatory environment']),
      structuralNotDescriptive: true,
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultCompanyProfileInput() {
  return clone(DEFAULT_COMPANY_PROFILE_INPUT);
}

function normalizeInput(input) {
  const company = input.company || {};
  requireText(company.displayName, 'company.displayName');
  return Object.freeze({
    company: Object.freeze({ displayName: company.displayName }),
    corporateStructure: normalizeObject(input.corporateStructure, ['parentCompany', 'structureType', 'ownershipNotes'], item => Object.freeze({ ...item, notableSubsidiaries: freezeList(item.notableSubsidiaries) })),
    operatingModel: normalizeObject(input.operatingModel, ['model', 'operatingLeverage', 'workingCapitalIntensity'], item => Object.freeze({ ...item, keyActivities: freezeList(item.keyActivities) })),
    businessSegments: normalizeItems(input.businessSegments, ['name', 'role', 'operatingNotes']),
    geographicFootprint: normalizeItems(input.geographicFootprint, ['region', 'operatingRole']),
    customerCategories: normalizeItems(input.customerCategories, ['category', 'description']),
    distributionModel: normalizeObject(input.distributionModel, ['dependencyNotes'], item => Object.freeze({ ...item, channels: freezeList(item.channels) })),
    revenueModel: normalizeObject(input.revenueModel, ['primaryModel', 'pricingModel', 'recurringNature']),
    capitalIntensity: normalizeObject(input.capitalIntensity, ['level', 'investorImplication'], item => Object.freeze({ ...item, drivers: freezeList(item.drivers) })),
    regulatoryEnvironment: normalizeObject(input.regulatoryEnvironment, ['level', 'investorImplication'], item => Object.freeze({ ...item, regimes: freezeList(item.regimes) })),
    investorJudgment: Object.freeze({ status: valueOrUnknown(input.investorJudgment?.status), note: valueOrUnknown(input.investorJudgment?.note) })
  });
}

function createProfileHeader(input) {
  return Object.freeze({ component: 'ProfileHeader', companyName: input.company.displayName, investorQuestion: FEATURE_META.investorQuestion, structuralFocus: true });
}

function createCorporateStructure(input) {
  return Object.freeze({ component: 'CorporateStructure', ...input.corporateStructure, factsOnly: true });
}

function createOperatingModel(input) {
  return Object.freeze({ component: 'OperatingModel', ...input.operatingModel, factsOnly: true });
}

function createBusinessSegments(input) {
  return Object.freeze({ component: 'BusinessSegments', items: input.businessSegments, factsOnly: true });
}

function createGeographicFootprint(input) {
  return Object.freeze({ component: 'GeographicFootprint', items: input.geographicFootprint, factsOnly: true });
}

function createCustomerCategories(input) {
  return Object.freeze({ component: 'CustomerCategories', items: input.customerCategories, factsOnly: true });
}

function createDistributionModel(input) {
  return Object.freeze({ component: 'DistributionModel', ...input.distributionModel, factsOnly: true });
}

function createRevenueModel(input) {
  return Object.freeze({ component: 'RevenueModel', ...input.revenueModel, factsOnly: true });
}

function createCapitalIntensity(input) {
  return Object.freeze({ component: 'CapitalIntensity', ...input.capitalIntensity, factsOnly: true });
}

function createRegulatoryEnvironment(input) {
  return Object.freeze({ component: 'RegulatoryEnvironment', ...input.regulatoryEnvironment, factsOnly: true });
}

function createStructuralFacts(input) {
  return Object.freeze({
    component: 'StructuralFacts',
    items: deepFreeze([
      { id: 'corporate-structure', kind: 'fact', source: 'company-profile-input', value: input.corporateStructure.structureType },
      { id: 'operating-model', kind: 'fact', source: 'company-profile-input', value: input.operatingModel.model },
      { id: 'customer-categories', kind: 'fact', source: 'company-profile-input', value: input.customerCategories.map(c => c.category).join(', ') },
      { id: 'distribution-model', kind: 'fact', source: 'company-profile-input', value: input.distributionModel.channels.join(', ') },
      { id: 'revenue-model', kind: 'fact', source: 'company-profile-input', value: input.revenueModel.primaryModel },
      { id: 'capital-intensity', kind: 'fact', source: 'company-profile-input', value: input.capitalIntensity.level },
      { id: 'regulatory-environment', kind: 'fact', source: 'company-profile-input', value: input.regulatoryEnvironment.level }
    ]),
    factsOnly: true
  });
}

function createAiInterpretation(input) {
  return Object.freeze({
    component: 'ProfileAIInterpretation',
    kind: 'generated_explanation',
    source: 'deterministic-product-summary',
    basedOn: Object.freeze(['corporate-structure', 'operating-model', 'customer-categories', 'distribution-model', 'revenue-model', 'capital-intensity', 'regulatory-environment']),
    summary: `${input.company.displayName} appears organized as a ${input.corporateStructure.structureType.toLowerCase()} with a ${input.revenueModel.primaryModel.toLowerCase()} revenue model, ${input.capitalIntensity.level.toLowerCase()} capital intensity, and ${input.regulatoryEnvironment.level.toLowerCase()} regulatory exposure.`,
    caution: 'Generated structural explanation only. It does not determine business quality, valuation, score, or investment action.'
  });
}

function createInvestorJudgment(input) {
  return Object.freeze({
    component: 'ProfileInvestorJudgment',
    status: input.investorJudgment.status,
    note: input.investorJudgment.note,
    controlledBy: 'Investor',
    noAutomation: true
  });
}

function normalizeObject(item, requiredFields, transform = value => Object.freeze({ ...value })) {
  const source = item || {};
  for (const field of requiredFields) requireText(source[field], field);
  return transform(source);
}

function normalizeItems(items, requiredFields) {
  return deepFreeze(freezeList(items).map((item, index) => {
    for (const field of requiredFields) requireText(item?.[field], `items[${index}].${field}`);
    return Object.freeze({ ...item });
  }));
}

function freezeList(value) {
  return Object.freeze([...(Array.isArray(value) ? value : [])]);
}

function valueOrUnknown(value) {
  return value === undefined || value === null || value === '' ? 'Unknown' : value;
}

function requireText(value, label) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
