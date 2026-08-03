import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createOverviewFeatureView } from './OverviewFeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-OV-007',
  workspace: 'Company Workspace',
  epic: 'Overview',
  featureId: '1.7',
  featureName: 'Geographic Exposure',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'Where is this business exposed geographically?',
  purpose: 'Explain the risks and opportunities created by geography across operations, revenue, supply chain, customers, currency, geopolitics, concentration, and growth markets.'
});

const DEFAULT_GEOGRAPHIC_EXPOSURE_INPUT = Object.freeze({
  company: Object.freeze({ displayName: 'Apex Consumer Products' }),
  operatingFootprint: Object.freeze([
    Object.freeze({ geography: 'India', role: 'Primary operating market', exposureLevel: 'High' }),
    Object.freeze({ geography: 'International', role: 'Selective export markets', exposureLevel: 'Low' })
  ]),
  revenueExposure: Object.freeze([
    Object.freeze({ geography: 'India', contributionPercent: 82, exposureLevel: 'High' }),
    Object.freeze({ geography: 'International', contributionPercent: 18, exposureLevel: 'Low' })
  ]),
  manufacturingFootprint: Object.freeze([
    Object.freeze({ geography: 'India', activity: 'Primary manufacturing and packaging base', exposureLevel: 'High' }),
    Object.freeze({ geography: 'International', activity: 'Limited third-party packing or export support', exposureLevel: 'Low' })
  ]),
  supplyChainExposure: Object.freeze([
    Object.freeze({ geography: 'India', exposure: 'Local agricultural inputs, packaging, and logistics', riskLevel: 'Medium' }),
    Object.freeze({ geography: 'Global', exposure: 'Selected commodities, flavors, packaging inputs, and equipment', riskLevel: 'Medium' })
  ]),
  customerExposure: Object.freeze([
    Object.freeze({ geography: 'India', customerBase: 'Household retail consumers and channel partners', exposureLevel: 'High' }),
    Object.freeze({ geography: 'International', customerBase: 'Export distributors and diaspora-led demand', exposureLevel: 'Low' })
  ]),
  currencyExposure: Object.freeze([
    Object.freeze({ currency: 'INR', role: 'Reporting and primary revenue currency', exposureLevel: 'High' }),
    Object.freeze({ currency: 'USD', role: 'Selected import/export exposure', exposureLevel: 'Medium' })
  ]),
  geopoliticalExposure: Object.freeze([
    Object.freeze({ geography: 'India', risk: 'Domestic policy, taxation, food safety, and logistics disruption', riskLevel: 'Medium' }),
    Object.freeze({ geography: 'Export markets', risk: 'Trade rules, import restrictions, and currency volatility', riskLevel: 'Low' })
  ]),
  growthMarkets: Object.freeze([
    Object.freeze({ geography: 'India Tier 2/3 cities', opportunity: 'Distribution expansion and category penetration', evidenceStatus: 'partial' }),
    Object.freeze({ geography: 'Selected export markets', opportunity: 'Diaspora-led demand and niche category expansion', evidenceStatus: 'missing' })
  ]),
  structuralGeographicRisks: Object.freeze([
    Object.freeze({ risk: 'Domestic concentration', implication: 'High dependence on one country can amplify local demand, policy, or logistics shocks.' }),
    Object.freeze({ risk: 'Input geography mismatch', implication: 'Revenue may be domestic while certain costs depend on global commodities or imports.' }),
    Object.freeze({ risk: 'Export execution risk', implication: 'International growth may require distributor quality, compliance, and local consumer fit.' })
  ]),
  investorJudgment: Object.freeze({ status: 'Geographic exposure reviewed', note: 'Geographic exposure is understandable; next work should verify source links and monitor country concentration.' })
});

export function createGeographicExposure(input = DEFAULT_GEOGRAPHIC_EXPOSURE_INPUT) {
  const normalized = normalizeInput(input);
  const countryConcentration = createCountryConcentration(normalized);
  const geographicFacts = createGeographicFacts(normalized, countryConcentration);
  const aiInterpretation = createAiInterpretation(normalized, countryConcentration);
  const investorJudgment = createInvestorJudgment(normalized);
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Medium',
    coverage: 73,
    rationale: 'Geographic Exposure covers revenue, operations, manufacturing, supply chain, customers, currency, geopolitics, concentration, and growth markets, but still needs source-linked country disclosures and supply chain evidence.',
    evidenceItems: ['operating footprint', 'revenue exposure', 'manufacturing footprint', 'supply chain exposure', 'customer exposure', 'currency exposure', 'geopolitical exposure', 'country concentration', 'growth markets', 'structural geographic risks'],
    missingEvidence: [
      { label: 'country-level annual report disclosure', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'manufacturing location source', priority: 'High', status: 'partial', sourceCount: 1 },
      { label: 'supply chain geography evidence', priority: 'Medium', status: 'missing', sourceCount: 0 },
      { label: 'currency exposure note', priority: 'Medium', status: 'missing', sourceCount: 0 }
    ]
  });
  const sections = Object.freeze({
    geographicExposureHeader: createGeographicExposureHeader(normalized),
    operatingFootprint: createOperatingFootprint(normalized),
    revenueExposure: createRevenueExposure(normalized),
    manufacturingFootprint: createManufacturingFootprint(normalized),
    supplyChainExposure: createSupplyChainExposure(normalized),
    customerExposure: createCustomerExposure(normalized),
    currencyExposure: createCurrencyExposure(normalized),
    geopoliticalExposure: createGeopoliticalExposure(normalized),
    countryConcentration,
    growthMarkets: createGrowthMarkets(normalized),
    structuralGeographicRisks: createStructuralGeographicRisks(normalized),
    geographicFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    exposureNotPresenceOnly: true,
    noValuation: true,
    noScoring: true,
    noRecommendation: true,
    noExecution: true
  });
  const futureExtensions = Object.freeze(['country exposure map', 'currency sensitivity links', 'geopolitical event alerts', 'supply-chain geography evidence links']);

  return deepFreeze({
    type: 'geographic-exposure',
    feature: FEATURE_META,
    businessLogic: false,
    selfContained: true,
    responsive: Object.freeze({ supportsCompact: true, supportsWide: true, minimumContentWidth: 320 }),
    evidenceConfidence,
    sections,
    overviewFeatureView: createOverviewFeatureView({
      type: 'geographic-exposure',
      feature: FEATURE_META,
      facts: geographicFacts.items,
      aiInterpretation,
      investorJudgment,
      evidenceConfidence,
      guardrails,
      futureExtensions,
      sections
    }),
    boundaries: Object.freeze({
      exposureNotPresenceOnly: true,
      complementsRevenueSegments: true,
      noValuation: true,
      noScoring: true,
      noRecommendation: true,
      noExecution: true
    }),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      exposureFocused: true,
      userCanUnderstand: Object.freeze(['operating footprint', 'revenue exposure', 'manufacturing footprint', 'supply chain exposure', 'customer exposure', 'currency exposure', 'geopolitical exposure', 'country concentration', 'growth markets', 'structural geographic risks']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultGeographicExposureInput() {
  return clone(DEFAULT_GEOGRAPHIC_EXPOSURE_INPUT);
}

function createGeographicExposureHeader(input) { return Object.freeze({ component: 'GeographicExposureHeader', companyName: input.company.displayName, investorQuestion: FEATURE_META.investorQuestion }); }
function createOperatingFootprint(input) { return Object.freeze({ component: 'OperatingFootprint', items: input.operatingFootprint, factsOnly: true }); }
function createRevenueExposure(input) { return Object.freeze({ component: 'RevenueExposure', items: input.revenueExposure, factsOnly: true }); }
function createManufacturingFootprint(input) { return Object.freeze({ component: 'ManufacturingFootprint', items: input.manufacturingFootprint, factsOnly: true }); }
function createSupplyChainExposure(input) { return Object.freeze({ component: 'SupplyChainExposure', items: input.supplyChainExposure, factsOnly: true }); }
function createCustomerExposure(input) { return Object.freeze({ component: 'CustomerExposure', items: input.customerExposure, factsOnly: true }); }
function createCurrencyExposure(input) { return Object.freeze({ component: 'CurrencyExposure', items: input.currencyExposure, factsOnly: true }); }
function createGeopoliticalExposure(input) { return Object.freeze({ component: 'GeopoliticalExposure', items: input.geopoliticalExposure, factsOnly: true }); }
function createGrowthMarkets(input) { return Object.freeze({ component: 'GrowthMarkets', items: input.growthMarkets, factsOnly: true }); }
function createStructuralGeographicRisks(input) { return Object.freeze({ component: 'StructuralGeographicRisks', items: input.structuralGeographicRisks, factsOnly: true }); }

function createCountryConcentration(input) {
  const largest = [...input.revenueExposure].sort((a, b) => b.contributionPercent - a.contributionPercent)[0];
  return Object.freeze({
    component: 'CountryConcentration',
    largestGeography: largest.geography,
    largestContributionPercent: largest.contributionPercent,
    concentrationLevel: largest.contributionPercent >= 70 ? 'High' : largest.contributionPercent >= 40 ? 'Medium' : 'Low',
    factsOnly: true
  });
}

function createGeographicFacts(input, concentration) {
  return Object.freeze({
    component: 'GeographicFacts',
    items: deepFreeze([
      { id: 'largest-geography', kind: 'fact', source: 'geographic-exposure-input', value: `${concentration.largestGeography}: ${concentration.largestContributionPercent}%` },
      { id: 'country-concentration', kind: 'fact', source: 'computed-from-revenue-exposure', value: concentration.concentrationLevel },
      { id: 'operating-footprint', kind: 'fact', source: 'geographic-exposure-input', value: input.operatingFootprint.map(item => `${item.geography}: ${item.exposureLevel}`).join(', ') },
      { id: 'currency-exposure', kind: 'fact', source: 'geographic-exposure-input', value: input.currencyExposure.map(item => `${item.currency}: ${item.exposureLevel}`).join(', ') },
      { id: 'growth-markets', kind: 'fact', source: 'geographic-exposure-input', value: input.growthMarkets.map(item => item.geography).join(', ') }
    ]),
    factsOnly: true
  });
}

function createAiInterpretation(input, concentration) {
  const highRisk = input.structuralGeographicRisks[0]?.risk || 'geographic concentration';
  return Object.freeze({
    component: 'GeographicExposureAIInterpretation',
    kind: 'generated_explanation',
    source: 'deterministic-product-summary',
    basedOn: Object.freeze(['operating-footprint', 'revenue-exposure', 'manufacturing-footprint', 'supply-chain-exposure', 'customer-exposure', 'currency-exposure', 'geopolitical-exposure', 'country-concentration', 'growth-markets', 'structural-geographic-risks']),
    summary: `${input.company.displayName} has ${concentration.concentrationLevel.toLowerCase()} geographic concentration, led by ${concentration.largestGeography} at ${concentration.largestContributionPercent}% of revenue exposure. The main structural geographic risk to review is ${highRisk.toLowerCase()}.`,
    caution: 'Generated geographic exposure interpretation only. It does not value the company, score geography quality, recommend action, or replace investor judgment.'
  });
}
function createInvestorJudgment(input) { return Object.freeze({ component: 'GeographicExposureInvestorJudgment', status: input.investorJudgment.status, note: input.investorJudgment.note, controlledBy: 'Investor', noAutomation: true }); }

function normalizeInput(input) {
  const company = input.company || {};
  requireText(company.displayName, 'company.displayName');
  return Object.freeze({
    company: Object.freeze({ displayName: company.displayName }),
    operatingFootprint: normalizeItems(input.operatingFootprint, ['geography', 'role', 'exposureLevel']),
    revenueExposure: normalizeItems(input.revenueExposure, ['geography', 'contributionPercent', 'exposureLevel']),
    manufacturingFootprint: normalizeItems(input.manufacturingFootprint, ['geography', 'activity', 'exposureLevel']),
    supplyChainExposure: normalizeItems(input.supplyChainExposure, ['geography', 'exposure', 'riskLevel']),
    customerExposure: normalizeItems(input.customerExposure, ['geography', 'customerBase', 'exposureLevel']),
    currencyExposure: normalizeItems(input.currencyExposure, ['currency', 'role', 'exposureLevel']),
    geopoliticalExposure: normalizeItems(input.geopoliticalExposure, ['geography', 'risk', 'riskLevel']),
    growthMarkets: normalizeItems(input.growthMarkets, ['geography', 'opportunity', 'evidenceStatus']),
    structuralGeographicRisks: normalizeItems(input.structuralGeographicRisks, ['risk', 'implication']),
    investorJudgment: Object.freeze({ status: valueOrUnknown(input.investorJudgment?.status), note: valueOrUnknown(input.investorJudgment?.note) })
  });
}
function normalizeItems(items, requiredFields) { return deepFreeze(freezeList(items).map((item, index) => { for (const field of requiredFields) if (item?.[field] === undefined || item?.[field] === null || item?.[field] === '') throw new Error(`items[${index}].${field} is required`); return Object.freeze({ ...item }); })); }
function freezeList(value) { return Object.freeze([...(Array.isArray(value) ? value : [])]); }
function valueOrUnknown(value) { return value === undefined || value === null || value === '' ? 'Unknown' : value; }
function requireText(value, label) { if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
