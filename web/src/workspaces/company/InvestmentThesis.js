import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createOverviewFeatureView } from './OverviewFeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-OV-002',
  workspace: 'Company Workspace',
  epic: 'Overview',
  featureId: '1.2',
  featureName: 'Investment Thesis',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'Why might this business deserve ownership?',
  purpose: 'Capture the current ownership thesis, counter-thesis, assumptions, evidence gaps, and investor judgment without making an automated recommendation.'
});

const DEFAULT_INVESTMENT_THESIS_INPUT = Object.freeze({
  company: Object.freeze({ displayName: 'Apex Consumer Products' }),
  thesis: Object.freeze({
    status: 'Draft',
    lastReviewedAt: 'demo snapshot',
    owner: 'Investor',
    summary: 'Apex may be worth deeper research because it combines a familiar consumer staples category with diversified product lines, high domestic exposure, and potential operating leverage from branded distribution.'
  }),
  supportingFacts: Object.freeze([
    Object.freeze({ id: 'fact-segment-diversification', text: 'Revenue is spread across packaged foods, beverages, and household essentials.', source: 'Business Snapshot' }),
    Object.freeze({ id: 'fact-domestic-exposure', text: 'India contributes the majority of geographic exposure.', source: 'Business Snapshot' }),
    Object.freeze({ id: 'fact-essential-products', text: 'Products are everyday consumer categories rather than discretionary luxury purchases.', source: 'Business Snapshot' })
  ]),
  thesisPoints: Object.freeze([
    Object.freeze({ id: 'thesis-demand', label: 'Demand durability', text: 'Staples demand may be more resilient than discretionary categories.', linkedFactIds: Object.freeze(['fact-essential-products']) }),
    Object.freeze({ id: 'thesis-distribution', label: 'Distribution reach', text: 'Multiple channels may support repeat purchasing and brand availability.', linkedFactIds: Object.freeze(['fact-segment-diversification']) }),
    Object.freeze({ id: 'thesis-domestic-growth', label: 'Domestic growth runway', text: 'High India exposure may provide a long runway if category penetration and premiumization continue.', linkedFactIds: Object.freeze(['fact-domestic-exposure']) })
  ]),
  counterpoints: Object.freeze([
    Object.freeze({ id: 'counter-competition', text: 'Consumer staples categories can face intense competition and pricing pressure.', severity: 'Medium' }),
    Object.freeze({ id: 'counter-input-costs', text: 'Commodity and packaging cost inflation may pressure margins.', severity: 'Medium' }),
    Object.freeze({ id: 'counter-execution', text: 'The thesis depends on sustained brand execution and distribution quality.', severity: 'Medium' })
  ]),
  assumptions: Object.freeze([
    Object.freeze({ id: 'assumption-demand', text: 'Core categories remain relevant to consumers.', confidence: 'Medium' }),
    Object.freeze({ id: 'assumption-brand', text: 'Brands retain shelf space and pricing power.', confidence: 'Low' }),
    Object.freeze({ id: 'assumption-capital-allocation', text: 'Management reinvests prudently in distribution and product quality.', confidence: 'Unknown' })
  ]),
  evidenceGaps: Object.freeze([
    Object.freeze({ id: 'gap-financial-quality', text: 'Validate margin profile, ROCE, and free cash flow conversion.', priority: 'High' }),
    Object.freeze({ id: 'gap-market-share', text: 'Check market share trends and category growth.', priority: 'High' }),
    Object.freeze({ id: 'gap-governance', text: 'Review management incentives, related-party transactions, and capital allocation record.', priority: 'Medium' })
  ]),
  investorJudgment: Object.freeze({ status: 'Not decided', note: 'Use this thesis to guide research. Do not treat it as a buy, sell, or hold decision.' })
});

export function createInvestmentThesis(input = DEFAULT_INVESTMENT_THESIS_INPUT) {
  const normalized = normalizeInput(input);
  const facts = createFactSection(normalized);
  const aiInterpretation = createAiInterpretation(normalized);
  const investorJudgment = createInvestorJudgment(normalized);
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Medium',
    coverage: 68,
    rationale: 'Investment Thesis has several supporting facts and explicit counterpoints, but financial quality, market share, and governance evidence remain open research gaps.',
    evidenceItems: normalized.supportingFacts.map(fact => fact.id),
    missingEvidence: normalized.evidenceGaps.map(gap => gap.text)
  });
  const futureExtensions = Object.freeze(['link thesis points to evidence artifacts', 'version thesis history', 'AI thesis challenger', 'convert gaps into research tasks']);

  return deepFreeze({
    type: 'investment-thesis',
    feature: FEATURE_META,
    businessLogic: false,
    selfContained: true,
    responsive: Object.freeze({ supportsCompact: true, supportsWide: true, minimumContentWidth: 320 }),
    evidenceConfidence,
    sections: Object.freeze({
      thesisHeader: createThesisHeader(normalized),
      thesisSummary: createThesisSummary(normalized),
      supportingFacts: facts,
      thesisPoints: createThesisPoints(normalized),
      counterpoints: createCounterpoints(normalized),
      assumptions: createAssumptions(normalized),
      evidenceGaps: createEvidenceGaps(normalized),
      aiInterpretation,
      investorJudgment
    }),
    overviewFeatureView: createOverviewFeatureView({
      type: 'investment-thesis',
      feature: FEATURE_META,
      facts: facts.items,
      aiInterpretation,
      investorJudgment,
      evidenceConfidence,
      guardrails: { noValuation: true, noScoring: true, noRecommendation: true, noExecution: true },
      futureExtensions,
      sections: Object.freeze({
        thesisHeader: createThesisHeader(normalized),
        thesisSummary: createThesisSummary(normalized),
        supportingFacts: facts,
        thesisPoints: createThesisPoints(normalized),
        counterpoints: createCounterpoints(normalized),
        assumptions: createAssumptions(normalized),
        evidenceGaps: createEvidenceGaps(normalized),
        aiInterpretation,
        investorJudgment
      })
    }),
    boundaries: Object.freeze({
      facts: 'Sourced or user-entered observations that support or challenge the thesis.',
      aiInterpretation: 'Generated explanation that improves readability and highlights gaps; it does not decide.',
      investorJudgment: 'Explicit investor-controlled status and note.',
      noRecommendation: true,
      noValuation: true,
      noScoring: true,
      noExecution: true
    }),
    acceptance: Object.freeze({
      independentlyUsable: true,
      userCanUnderstand: Object.freeze(['why the business may deserve ownership', 'what facts support the thesis', 'what could break the thesis', 'what evidence is still missing']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true,
      noRecommendationLogic: true
    }),
    futureExtensions
  });
}

export function getDefaultInvestmentThesisInput() {
  return clone(DEFAULT_INVESTMENT_THESIS_INPUT);
}

function normalizeInput(input) {
  const company = input.company || {};
  const thesis = input.thesis || {};
  requireText(company.displayName, 'company.displayName');
  requireText(thesis.summary, 'thesis.summary');
  return Object.freeze({
    company: Object.freeze({ displayName: company.displayName }),
    thesis: Object.freeze({
      status: valueOrUnknown(thesis.status),
      lastReviewedAt: valueOrUnknown(thesis.lastReviewedAt),
      owner: valueOrUnknown(thesis.owner),
      summary: thesis.summary
    }),
    supportingFacts: normalizeItems(input.supportingFacts, ['id', 'text', 'source']),
    thesisPoints: normalizeItems(input.thesisPoints, ['id', 'label', 'text'], item => Object.freeze({ ...item, linkedFactIds: freezeList(item.linkedFactIds) })),
    counterpoints: normalizeItems(input.counterpoints, ['id', 'text', 'severity']),
    assumptions: normalizeItems(input.assumptions, ['id', 'text', 'confidence']),
    evidenceGaps: normalizeItems(input.evidenceGaps, ['id', 'text', 'priority']),
    investorJudgment: Object.freeze({
      status: valueOrUnknown(input.investorJudgment?.status),
      note: valueOrUnknown(input.investorJudgment?.note)
    })
  });
}

function createThesisHeader(input) {
  return Object.freeze({
    component: 'ThesisHeader',
    companyName: input.company.displayName,
    status: input.thesis.status,
    owner: input.thesis.owner,
    lastReviewedAt: input.thesis.lastReviewedAt,
    investorQuestion: FEATURE_META.investorQuestion
  });
}

function createThesisSummary(input) {
  return Object.freeze({
    component: 'ThesisSummary',
    summary: input.thesis.summary,
    source: 'investor-entered-thesis',
    factsOnly: false,
    requiresInvestorReview: true
  });
}

function createFactSection(input) {
  return Object.freeze({
    component: 'SupportingFacts',
    items: deepFreeze(input.supportingFacts.map(fact => ({ ...fact, kind: 'fact' }))),
    factsOnly: true
  });
}

function createThesisPoints(input) {
  return Object.freeze({
    component: 'ThesisPoints',
    items: deepFreeze(input.thesisPoints.map(point => ({ ...point, kind: 'investor_thesis_point' }))),
    requiresEvidenceReview: true
  });
}

function createCounterpoints(input) {
  return Object.freeze({
    component: 'Counterpoints',
    items: deepFreeze(input.counterpoints.map(point => ({ ...point, kind: 'counter_thesis_point' }))),
    purpose: 'Show what could invalidate or weaken the thesis.'
  });
}

function createAssumptions(input) {
  return Object.freeze({
    component: 'Assumptions',
    items: deepFreeze(input.assumptions.map(assumption => ({ ...assumption, kind: 'assumption' }))),
    purpose: 'Make hidden assumptions explicit before deeper research.'
  });
}

function createEvidenceGaps(input) {
  return Object.freeze({
    component: 'EvidenceGaps',
    items: deepFreeze(input.evidenceGaps.map(gap => ({ ...gap, kind: 'evidence_gap' }))),
    purpose: 'Identify what must be researched before conviction can increase.'
  });
}

function createAiInterpretation(input) {
  const strongestPoint = input.thesisPoints[0]?.label || 'the stated thesis';
  const topGap = input.evidenceGaps[0]?.text || 'Validate the core thesis with evidence.';
  return Object.freeze({
    component: 'AIInterpretation',
    kind: 'generated_explanation',
    source: 'deterministic-product-summary',
    basedOn: Object.freeze(['thesis-summary', 'supporting-facts', 'counterpoints', 'assumptions', 'evidence-gaps']),
    summary: `${input.company.displayName}'s draft thesis centers on ${strongestPoint.toLowerCase()}. The main research priority is to ${lowerFirst(topGap)}`,
    caution: 'AI interpretation is explanatory only. It does not create conviction, score the company, or recommend an action.',
    highlightsMissingEvidence: input.evidenceGaps.length > 0
  });
}

function createInvestorJudgment(input) {
  return Object.freeze({
    component: 'InvestorJudgment',
    status: input.investorJudgment.status,
    note: input.investorJudgment.note,
    controlledBy: 'Investor',
    finalConclusionRequiredFromInvestor: true,
    noAutomation: true
  });
}

function normalizeItems(items, requiredFields, transform = item => Object.freeze({ ...item })) {
  return deepFreeze(freezeList(items).map((item, index) => {
    for (const field of requiredFields) requireText(item?.[field], `items[${index}].${field}`);
    return transform(item);
  }));
}

function lowerFirst(text) {
  return text ? `${text.charAt(0).toLowerCase()}${text.slice(1)}` : text;
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
