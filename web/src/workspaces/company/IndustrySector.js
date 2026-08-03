import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createOverviewFeatureView } from './OverviewFeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-OV-004',
  workspace: 'Company Workspace',
  epic: 'Overview',
  featureId: '1.4',
  featureName: 'Industry & Sector',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'What environment does this business compete in?',
  purpose: 'Explain the sector and industry environment, market structure, competitive landscape, growth drivers, headwinds, lifecycle, regulation, and structural risks without using financial-quality or valuation analysis.'
});

const DEFAULT_INDUSTRY_SECTOR_INPUT = Object.freeze({
  company: Object.freeze({ displayName: 'Apex Consumer Products' }),
  classification: Object.freeze({ sector: 'Consumer Staples', industry: 'Packaged Foods' }),
  industryOverview: Object.freeze({
    summary: 'The packaged foods industry serves recurring household consumption needs through branded and private-label products distributed across retail, modern trade, and digital channels.',
    demandPattern: 'Recurring but category-sensitive consumer demand',
    substitutionRisk: 'Medium'
  }),
  sectorCharacteristics: Object.freeze([
    Object.freeze({ name: 'Repeat purchase behavior', description: 'Consumers buy many products frequently, but brand switching can occur when price or availability changes.' }),
    Object.freeze({ name: 'Distribution intensity', description: 'Availability across stores and channels is important because purchase decisions are often made at the point of sale.' }),
    Object.freeze({ name: 'Input sensitivity', description: 'Raw material, packaging, freight, and trade promotion costs can influence industry conditions.' })
  ]),
  marketStructure: Object.freeze({
    structure: 'Fragmented with large national brands, regional brands, private labels, and unorganized competitors.',
    buyerPower: 'Medium',
    supplierPower: 'Medium',
    entryBarriers: 'Medium',
    channelPower: 'Medium'
  }),
  competitiveLandscape: Object.freeze([
    Object.freeze({ competitorType: 'National branded players', description: 'Compete through brand recall, distribution reach, portfolio breadth, and promotion.' }),
    Object.freeze({ competitorType: 'Regional brands', description: 'Compete through local taste, pricing, and regional relationships.' }),
    Object.freeze({ competitorType: 'Private labels', description: 'Compete through retailer shelf control and value positioning.' })
  ]),
  growthDrivers: Object.freeze([
    Object.freeze({ driver: 'Urbanization and convenience consumption', durability: 'Medium' }),
    Object.freeze({ driver: 'Modern trade and digital channel expansion', durability: 'Medium' }),
    Object.freeze({ driver: 'Premiumization in selected categories', durability: 'Medium' })
  ]),
  industryHeadwinds: Object.freeze([
    Object.freeze({ headwind: 'Input cost volatility', severity: 'Medium' }),
    Object.freeze({ headwind: 'Competitive discounting', severity: 'Medium' }),
    Object.freeze({ headwind: 'Changing consumer preferences', severity: 'Medium' })
  ]),
  regulatoryEnvironment: Object.freeze({
    level: 'Medium',
    description: 'Industry participants must comply with food safety, labeling, packaging, advertising, tax, and consumer protection requirements.',
    distinction: 'This describes industry-level regulation, not company-specific compliance quality.'
  }),
  industryLifecycle: Object.freeze({
    stage: 'Mature with pockets of growth',
    explanation: 'Core staples categories are established, while premium formats, digital channels, and new product categories may still grow.'
  }),
  structuralRisks: Object.freeze([
    Object.freeze({ risk: 'Low switching costs', implication: 'Customers may shift brands if price, quality, or availability changes.' }),
    Object.freeze({ risk: 'Channel dependence', implication: 'Retailer and distributor relationships can influence availability and promotions.' }),
    Object.freeze({ risk: 'Regulatory non-compliance sensitivity', implication: 'Industry incidents can damage trust and disrupt sales.' })
  ]),
  investorJudgment: Object.freeze({ status: 'Industry context reviewed', note: 'Industry structure is understandable; competitive advantage and financial quality should be evaluated in later epics.' })
});

export function createIndustrySector(input = DEFAULT_INDUSTRY_SECTOR_INPUT) {
  const normalized = normalizeInput(input);
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Medium',
    coverage: 70,
    rationale: 'Industry & Sector covers the major non-financial context areas, but it needs source-linked industry reports, competitor lists, and regulatory references for higher confidence.',
    evidenceItems: ['industry overview', 'sector characteristics', 'market structure', 'competitive landscape', 'growth drivers', 'headwinds', 'regulatory environment', 'industry lifecycle', 'structural risks'],
    missingEvidence: ['source-linked industry reports', 'competitor data sources', 'regulatory references']
  });
  const aiInterpretation = createAiInterpretation(normalized);
  const investorJudgment = createInvestorJudgment(normalized);
  const futureExtensions = Object.freeze(['source-linked industry reports', 'peer list integration', 'industry change alerts', 'regulatory event feed']);
  const facts = createIndustryFacts(normalized);
  return deepFreeze({
    type: 'industry-sector',
    feature: FEATURE_META,
    businessLogic: false,
    selfContained: true,
    responsive: Object.freeze({ supportsCompact: true, supportsWide: true, minimumContentWidth: 320 }),
    evidenceConfidence,
    sections: Object.freeze({
      industryHeader: createIndustryHeader(normalized),
      industryOverview: createIndustryOverview(normalized),
      sectorCharacteristics: createSectorCharacteristics(normalized),
      marketStructure: createMarketStructure(normalized),
      competitiveLandscape: createCompetitiveLandscape(normalized),
      growthDrivers: createGrowthDrivers(normalized),
      industryHeadwinds: createIndustryHeadwinds(normalized),
      regulatoryEnvironment: createRegulatoryEnvironment(normalized),
      industryLifecycle: createIndustryLifecycle(normalized),
      structuralRisks: createStructuralRisks(normalized),
      industryFacts: facts,
      aiInterpretation,
      investorJudgment
    }),
    overviewFeatureView: createOverviewFeatureView({
      type: 'industry-sector',
      feature: FEATURE_META,
      facts: facts.items,
      aiInterpretation,
      investorJudgment,
      evidenceConfidence,
      guardrails: { noValuation: true, noScoring: true, noRecommendation: true, noExecution: true, noRoe: true, noMargins: true, noMoatRating: true, noFinancialQuality: true },
      futureExtensions,
      sections: Object.freeze({
        industryHeader: createIndustryHeader(normalized),
        industryOverview: createIndustryOverview(normalized),
        sectorCharacteristics: createSectorCharacteristics(normalized),
        marketStructure: createMarketStructure(normalized),
        competitiveLandscape: createCompetitiveLandscape(normalized),
        growthDrivers: createGrowthDrivers(normalized),
        industryHeadwinds: createIndustryHeadwinds(normalized),
        regulatoryEnvironment: createRegulatoryEnvironment(normalized),
        industryLifecycle: createIndustryLifecycle(normalized),
        structuralRisks: createStructuralRisks(normalized),
        industryFacts: facts,
        aiInterpretation,
        investorJudgment
      })
    }),
    boundaries: Object.freeze({
      nonFinancialContextOnly: true,
      noRoe: true,
      noMargins: true,
      noValuation: true,
      noMoatRating: true,
      noFinancialQuality: true,
      noScoring: true,
      noRecommendation: true,
      noExecution: true
    }),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      stillMakesSenseWithoutFinancialNumbers: true,
      userCanUnderstand: Object.freeze(['industry overview', 'sector characteristics', 'market structure', 'competitive landscape', 'growth drivers', 'industry headwinds', 'industry-level regulation', 'industry lifecycle', 'structural risks']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultIndustrySectorInput() {
  return clone(DEFAULT_INDUSTRY_SECTOR_INPUT);
}

function normalizeInput(input) {
  const company = input.company || {};
  const classification = input.classification || {};
  requireText(company.displayName, 'company.displayName');
  requireText(classification.sector, 'classification.sector');
  requireText(classification.industry, 'classification.industry');
  return Object.freeze({
    company: Object.freeze({ displayName: company.displayName }),
    classification: Object.freeze({ sector: classification.sector, industry: classification.industry }),
    industryOverview: normalizeObject(input.industryOverview, ['summary', 'demandPattern', 'substitutionRisk']),
    sectorCharacteristics: normalizeItems(input.sectorCharacteristics, ['name', 'description']),
    marketStructure: normalizeObject(input.marketStructure, ['structure', 'buyerPower', 'supplierPower', 'entryBarriers', 'channelPower']),
    competitiveLandscape: normalizeItems(input.competitiveLandscape, ['competitorType', 'description']),
    growthDrivers: normalizeItems(input.growthDrivers, ['driver', 'durability']),
    industryHeadwinds: normalizeItems(input.industryHeadwinds, ['headwind', 'severity']),
    regulatoryEnvironment: normalizeObject(input.regulatoryEnvironment, ['level', 'description', 'distinction']),
    industryLifecycle: normalizeObject(input.industryLifecycle, ['stage', 'explanation']),
    structuralRisks: normalizeItems(input.structuralRisks, ['risk', 'implication']),
    investorJudgment: Object.freeze({ status: valueOrUnknown(input.investorJudgment?.status), note: valueOrUnknown(input.investorJudgment?.note) })
  });
}

function createIndustryHeader(input) {
  return Object.freeze({ component: 'IndustryHeader', companyName: input.company.displayName, sector: input.classification.sector, industry: input.classification.industry, investorQuestion: FEATURE_META.investorQuestion });
}
function createIndustryOverview(input) { return Object.freeze({ component: 'IndustryOverview', ...input.industryOverview, factsOnly: true }); }
function createSectorCharacteristics(input) { return Object.freeze({ component: 'SectorCharacteristics', items: input.sectorCharacteristics, factsOnly: true }); }
function createMarketStructure(input) { return Object.freeze({ component: 'MarketStructure', ...input.marketStructure, factsOnly: true }); }
function createCompetitiveLandscape(input) { return Object.freeze({ component: 'CompetitiveLandscape', items: input.competitiveLandscape, factsOnly: true }); }
function createGrowthDrivers(input) { return Object.freeze({ component: 'GrowthDrivers', items: input.growthDrivers, factsOnly: true }); }
function createIndustryHeadwinds(input) { return Object.freeze({ component: 'IndustryHeadwinds', items: input.industryHeadwinds, factsOnly: true }); }
function createRegulatoryEnvironment(input) { return Object.freeze({ component: 'IndustryRegulatoryEnvironment', ...input.regulatoryEnvironment, factsOnly: true }); }
function createIndustryLifecycle(input) { return Object.freeze({ component: 'IndustryLifecycle', ...input.industryLifecycle, factsOnly: true }); }
function createStructuralRisks(input) { return Object.freeze({ component: 'StructuralRisks', items: input.structuralRisks, factsOnly: true }); }

function createIndustryFacts(input) {
  return Object.freeze({
    component: 'IndustryFacts',
    items: deepFreeze([
      { id: 'sector-industry', kind: 'fact', source: 'industry-sector-input', value: `${input.classification.sector} / ${input.classification.industry}` },
      { id: 'market-structure', kind: 'fact', source: 'industry-sector-input', value: input.marketStructure.structure },
      { id: 'industry-lifecycle', kind: 'fact', source: 'industry-sector-input', value: input.industryLifecycle.stage },
      { id: 'regulatory-level', kind: 'fact', source: 'industry-sector-input', value: input.regulatoryEnvironment.level }
    ]),
    factsOnly: true
  });
}

function createAiInterpretation(input) {
  return Object.freeze({
    component: 'IndustryAIInterpretation',
    kind: 'generated_explanation',
    source: 'deterministic-product-summary',
    basedOn: Object.freeze(['industry-overview', 'sector-characteristics', 'market-structure', 'competitive-landscape', 'growth-drivers', 'headwinds', 'regulation', 'lifecycle', 'structural-risks']),
    summary: `${input.company.displayName} competes in a ${input.classification.industry.toLowerCase()} environment with ${input.marketStructure.entryBarriers.toLowerCase()} entry barriers, ${input.marketStructure.channelPower.toLowerCase()} channel power, and an industry lifecycle described as ${input.industryLifecycle.stage.toLowerCase()}.`,
    caution: 'Generated industry interpretation only. It excludes ROE, margins, valuation, moat rating, financial quality, score, and recommendation.'
  });
}

function createInvestorJudgment(input) {
  return Object.freeze({ component: 'IndustryInvestorJudgment', status: input.investorJudgment.status, note: input.investorJudgment.note, controlledBy: 'Investor', noAutomation: true });
}

function normalizeObject(item, requiredFields) {
  const source = item || {};
  for (const field of requiredFields) requireText(source[field], field);
  return Object.freeze({ ...source });
}
function normalizeItems(items, requiredFields) {
  return deepFreeze(freezeList(items).map((item, index) => {
    for (const field of requiredFields) requireText(item?.[field], `items[${index}].${field}`);
    return Object.freeze({ ...item });
  }));
}
function freezeList(value) { return Object.freeze([...(Array.isArray(value) ? value : [])]); }
function valueOrUnknown(value) { return value === undefined || value === null || value === '' ? 'Unknown' : value; }
function requireText(value, label) { if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
