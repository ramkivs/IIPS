import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-BQ-003',
  workspace: 'Company Workspace',
  epic: 'Business Quality',
  featureId: 'BQ.3',
  featureName: 'Competitive Position',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'Can competitors erode this business?',
  purpose: 'Assess competitive durability by separating structural advantages, observed evidence of advantage, threats that could weaken the position, and future sustainability.'
});

const DEFAULT_COMPETITIVE_POSITION_INPUT = Object.freeze({
  company: Object.freeze({ displayName: 'Apex Consumer Products' }),
  industryStructure: Object.freeze({
    structure: 'Fragmented consumer staples category with national brands, regional challengers, private labels, and unorganized competitors.',
    rivalryLevel: 'High',
    entryBarrierLevel: 'Medium',
    evidenceExpectation: 'Industry reports, regulatory filings, and market studies'
  }),
  competitiveLandscape: Object.freeze([
    Object.freeze({ competitorType: 'National branded players', pressure: 'Brand, promotion, portfolio breadth, and distribution intensity.', evidenceExpectation: 'Competitor disclosures, market share data, annual reports' }),
    Object.freeze({ competitorType: 'Regional brands', pressure: 'Local taste, pricing, distributor relationships, and regional familiarity.', evidenceExpectation: 'Regional market studies and distributor checks' }),
    Object.freeze({ competitorType: 'Private labels', pressure: 'Retailer shelf control and value positioning.', evidenceExpectation: 'Retailer disclosures and category shelf data' })
  ]),
  sourcesOfAdvantage: Object.freeze([
    Object.freeze({ source: 'Brand familiarity', type: 'brand', hypothesis: 'Recognized brands may support repeat purchase and shelf pull.', evidenceStatus: 'partial' }),
    Object.freeze({ source: 'Distribution reach', type: 'distribution', hypothesis: 'Broad availability can make products easier to buy and harder for smaller competitors to displace.', evidenceStatus: 'partial' }),
    Object.freeze({ source: 'Portfolio breadth', type: 'scale', hypothesis: 'Multiple categories may increase shelf relevance and channel relationships.', evidenceStatus: 'partial' }),
    Object.freeze({ source: 'Taste and format fit', type: 'differentiation', hypothesis: 'Localized products may improve customer repeat behavior.', evidenceStatus: 'missing' })
  ]),
  evidenceOfAdvantage: Object.freeze([
    Object.freeze({ evidence: 'Stable shelf presence in core channels', supports: 'Distribution reach', strength: 'Medium', sourceType: 'channel evidence' }),
    Object.freeze({ evidence: 'Repeat-purchase product categories', supports: 'Brand familiarity', strength: 'Medium', sourceType: 'category behavior' }),
    Object.freeze({ evidence: 'Broad category portfolio', supports: 'Portfolio breadth', strength: 'Medium', sourceType: 'product portfolio' })
  ]),
  competitivePressures: Object.freeze([
    Object.freeze({ pressure: 'Promotional intensity', impact: 'Can weaken pricing and brand differentiation.' }),
    Object.freeze({ pressure: 'Private-label expansion', impact: 'Can pressure value positioning and shelf space.' }),
    Object.freeze({ pressure: 'Regional competitor agility', impact: 'Can challenge local relevance and pricing.' })
  ]),
  customerSwitchingDynamics: Object.freeze({
    switchingCostLevel: 'Low to Medium',
    explanation: 'Consumers can switch brands easily, but habits, taste preference, trust, and availability may create soft switching costs.',
    evidenceExpectation: 'Contract terms, switching costs, renewal rates, ecosystem lock-in, repeat purchase data'
  }),
  pricingPower: Object.freeze({
    currentRead: 'Unproven',
    explanation: 'Pricing power requires evidence that price increases can be accepted without material volume loss or margin compression.',
    evidenceExpectation: 'Historical price increases, margin preservation, customer acceptance'
  }),
  innovationDifferentiation: Object.freeze({
    currentRead: 'Moderate',
    explanation: 'Product launches, packaging formats, and localized taste may support differentiation, but durability requires evidence.',
    evidenceExpectation: 'R&D investment, product launches, IP portfolio'
  }),
  threatAssessment: Object.freeze([
    Object.freeze({ threat: 'New entrants', severity: 'Medium', rationale: 'Category entry is possible where capital and regulatory requirements are manageable.' }),
    Object.freeze({ threat: 'Substitutes', severity: 'Medium', rationale: 'Consumers may shift to alternate formats, private labels, or local brands.' }),
    Object.freeze({ threat: 'Regulatory shifts', severity: 'Low to Medium', rationale: 'Food safety and labeling changes can affect product formulation or compliance cost.' }),
    Object.freeze({ threat: 'Technology or channel shift', severity: 'Medium', rationale: 'Digital commerce and quick commerce can change discovery, pricing, and promotion dynamics.' })
  ]),
  futureSustainability: Object.freeze({
    currentRead: 'Requires monitoring',
    sustainabilityFactors: Object.freeze(['continued brand relevance', 'distribution execution', 'product refresh', 'pricing discipline', 'channel adaptation']),
    evidenceExpectation: 'Capital requirements, reinvestment runway, and long-term industry outlook'
  }),
  investorJudgment: Object.freeze({ status: 'Competitive position reviewed', note: 'Competitive durability is plausible but not proven. Evidence must distinguish claimed advantages from observed advantage.' })
});

export function createCompetitivePosition(input = DEFAULT_COMPETITIVE_POSITION_INPUT) {
  const normalized = normalizeInput(input);
  const evidenceExpectations = createEvidenceExpectations(normalized);
  const qualityFacts = createCompetitiveFacts(normalized);
  const aiInterpretation = createAiInterpretation(normalized);
  const investorJudgment = createInvestorJudgment(normalized);
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Medium',
    coverage: 62,
    rationale: 'Competitive Position identifies possible advantage sources and threats, but direct evidence for pricing power, retention, market share stability, and competitor pressure is incomplete.',
    evidenceItems: ['industry structure', 'competitive landscape', 'sources of advantage', 'evidence of advantage', 'competitive pressures', 'switching dynamics', 'pricing power', 'innovation and differentiation', 'threat assessment', 'future sustainability'],
    missingEvidence: [
      { label: 'market share trend data', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'pricing action and volume retention history', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'customer retention or repeat purchase data', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'competitor disclosure comparison', priority: 'Medium', status: 'partial', sourceCount: 1 },
      { label: 'channel and shelf-space evidence', priority: 'Medium', status: 'partial', sourceCount: 1 }
    ]
  });
  const sections = Object.freeze({
    competitivePositionHeader: createCompetitivePositionHeader(normalized),
    industryStructure: createIndustryStructure(normalized),
    competitiveLandscape: createCompetitiveLandscape(normalized),
    sourcesOfCompetitiveAdvantage: createSourcesOfCompetitiveAdvantage(normalized),
    evidenceOfAdvantage: createEvidenceOfAdvantage(normalized),
    competitivePressures: createCompetitivePressures(normalized),
    customerSwitchingDynamics: createCustomerSwitchingDynamics(normalized),
    pricingPower: createPricingPower(normalized),
    innovationDifferentiation: createInnovationDifferentiation(normalized),
    threatAssessment: createThreatAssessment(normalized),
    futureSustainability: createFutureSustainability(normalized),
    evidenceExpectations,
    qualityFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    competitiveAssessmentOnly: true,
    noMoatScore: true,
    noRanking: true,
    noQualityScore: true,
    noValuation: true,
    noRecommendation: true,
    noExecution: true
  });
  const futureExtensions = Object.freeze(['peer evidence integration', 'market share trend chart', 'pricing power evidence links', 'competitive threat monitor']);

  return deepFreeze({
    type: 'competitive-position',
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
          dimension: 'Competitive Position',
          advantageSources: normalized.sourcesOfAdvantage,
          observedEvidence: normalized.evidenceOfAdvantage,
          threats: normalized.threatAssessment,
          evidenceExpectations: evidenceExpectations.items,
          measurementDeferred: true
        }
      }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      competitiveDurabilityNotMoatScore: true,
      separatesAdvantageSourcesFromObservedEvidence: true,
      userCanUnderstand: Object.freeze(['industry structure', 'competitive landscape', 'sources of advantage', 'evidence of advantage', 'threats to advantage', 'customer switching dynamics', 'pricing power', 'innovation and differentiation', 'future sustainability']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultCompetitivePositionInput() {
  return clone(DEFAULT_COMPETITIVE_POSITION_INPUT);
}

function createCompetitivePositionHeader(input) { return Object.freeze({ component: 'CompetitivePositionHeader', companyName: input.company.displayName, investorQuestion: FEATURE_META.investorQuestion }); }
function createIndustryStructure(input) { return Object.freeze({ component: 'IndustryStructure', ...input.industryStructure, factsOnly: false }); }
function createCompetitiveLandscape(input) { return Object.freeze({ component: 'CompetitiveLandscapeBQ', items: input.competitiveLandscape, factsOnly: false }); }
function createSourcesOfCompetitiveAdvantage(input) { return Object.freeze({ component: 'SourcesOfCompetitiveAdvantage', items: input.sourcesOfAdvantage, hypothesisOnly: true }); }
function createEvidenceOfAdvantage(input) { return Object.freeze({ component: 'EvidenceOfAdvantage', items: input.evidenceOfAdvantage, observedEvidenceOnly: true }); }
function createCompetitivePressures(input) { return Object.freeze({ component: 'CompetitivePressures', items: input.competitivePressures, factsOnly: false }); }
function createCustomerSwitchingDynamics(input) { return Object.freeze({ component: 'CustomerSwitchingDynamics', ...input.customerSwitchingDynamics, factsOnly: false }); }
function createPricingPower(input) { return Object.freeze({ component: 'PricingPower', ...input.pricingPower, measurementDeferred: true }); }
function createInnovationDifferentiation(input) { return Object.freeze({ component: 'InnovationDifferentiation', ...input.innovationDifferentiation, factsOnly: false }); }
function createThreatAssessment(input) { return Object.freeze({ component: 'ThreatAssessment', items: input.threatAssessment, factsOnly: false }); }
function createFutureSustainability(input) { return Object.freeze({ component: 'FutureSustainability', ...input.futureSustainability, factsOnly: false }); }

function createEvidenceExpectations(input) {
  return Object.freeze({
    component: 'CompetitiveEvidenceExpectations',
    items: deepFreeze([
      { section: 'Industry Structure', typicalEvidence: input.industryStructure.evidenceExpectation },
      { section: 'Competitive Landscape', typicalEvidence: 'Competitor disclosures, market share data, annual reports' },
      { section: 'Sources of Competitive Advantage', typicalEvidence: 'Company disclosures, patents, distribution network, brand strength' },
      { section: 'Evidence of Advantage', typicalEvidence: 'Gross margin stability, pricing actions, customer retention, market share trends' },
      { section: 'Competitive Pressures', typicalEvidence: 'New entrants, substitutes, regulatory changes, technology shifts' },
      { section: 'Customer Switching Dynamics', typicalEvidence: input.customerSwitchingDynamics.evidenceExpectation },
      { section: 'Pricing Power', typicalEvidence: input.pricingPower.evidenceExpectation },
      { section: 'Innovation & Differentiation', typicalEvidence: input.innovationDifferentiation.evidenceExpectation },
      { section: 'Threat Assessment', typicalEvidence: 'Emerging competitors, disruption risks, concentration risks' },
      { section: 'Future Sustainability', typicalEvidence: input.futureSustainability.evidenceExpectation }
    ]),
    actionable: true
  });
}

function createCompetitiveFacts(input) {
  return Object.freeze({
    component: 'CompetitiveQualityFacts',
    items: deepFreeze([
      { id: 'industry-structure', kind: 'fact', source: 'competitive-position-input', value: input.industryStructure.structure },
      { id: 'rivalry-level', kind: 'fact', source: 'competitive-position-input', value: input.industryStructure.rivalryLevel },
      { id: 'advantage-sources', kind: 'fact', source: 'competitive-position-input', value: input.sourcesOfAdvantage.map(item => item.source).join(', ') },
      { id: 'observed-advantage-evidence', kind: 'fact', source: 'competitive-position-input', value: input.evidenceOfAdvantage.map(item => item.evidence).join(', ') },
      { id: 'switching-cost-level', kind: 'fact', source: 'competitive-position-input', value: input.customerSwitchingDynamics.switchingCostLevel },
      { id: 'pricing-power-read', kind: 'fact', source: 'competitive-position-input', value: input.pricingPower.currentRead }
    ]),
    factsOnly: true
  });
}

function createAiInterpretation(input) {
  return Object.freeze({
    component: 'CompetitivePositionAIInterpretation',
    kind: 'generated_explanation',
    source: 'deterministic-product-summary',
    basedOn: Object.freeze(['industry-structure', 'competitive-landscape', 'sources-of-advantage', 'evidence-of-advantage', 'competitive-pressures', 'customer-switching-dynamics', 'pricing-power', 'innovation-differentiation', 'threat-assessment', 'future-sustainability']),
    summary: `${input.company.displayName}'s competitive durability depends on whether hypothesized advantages such as ${input.sourcesOfAdvantage.map(item => item.source.toLowerCase()).join(', ')} are supported by observable evidence. The current evidence is incomplete, so threats such as ${input.threatAssessment.map(item => item.threat.toLowerCase()).join(', ')} require monitoring.`,
    caution: 'Generated competitive interpretation only. It does not assign a moat score, rank the company, value the business, recommend action, or replace investor judgment.'
  });
}
function createInvestorJudgment(input) { return Object.freeze({ component: 'CompetitivePositionInvestorJudgment', status: input.investorJudgment.status, note: input.investorJudgment.note, controlledBy: 'Investor', noAutomation: true }); }

function normalizeInput(input) {
  const company = input.company || {};
  requireText(company.displayName, 'company.displayName');
  return Object.freeze({
    company: Object.freeze({ displayName: company.displayName }),
    industryStructure: normalizeObject(input.industryStructure, ['structure', 'rivalryLevel', 'entryBarrierLevel', 'evidenceExpectation']),
    competitiveLandscape: normalizeItems(input.competitiveLandscape, ['competitorType', 'pressure', 'evidenceExpectation']),
    sourcesOfAdvantage: normalizeItems(input.sourcesOfAdvantage, ['source', 'type', 'hypothesis', 'evidenceStatus']),
    evidenceOfAdvantage: normalizeItems(input.evidenceOfAdvantage, ['evidence', 'supports', 'strength', 'sourceType']),
    competitivePressures: normalizeItems(input.competitivePressures, ['pressure', 'impact']),
    customerSwitchingDynamics: normalizeObject(input.customerSwitchingDynamics, ['switchingCostLevel', 'explanation', 'evidenceExpectation']),
    pricingPower: normalizeObject(input.pricingPower, ['currentRead', 'explanation', 'evidenceExpectation']),
    innovationDifferentiation: normalizeObject(input.innovationDifferentiation, ['currentRead', 'explanation', 'evidenceExpectation']),
    threatAssessment: normalizeItems(input.threatAssessment, ['threat', 'severity', 'rationale']),
    futureSustainability: normalizeListObject(input.futureSustainability, ['currentRead', 'evidenceExpectation'], ['sustainabilityFactors']),
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
