import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-BQ-004',
  workspace: 'Company Workspace',
  epic: 'Business Quality',
  featureId: 'BQ.4',
  featureName: 'Capital Allocation',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'Does management allocate capital effectively?',
  purpose: 'Assess capital allocation discipline across capital sources, allocation choices, reinvestment, acquisitions, shareholder returns, balance sheet discipline, working capital, and long-term value creation without producing a score or valuation.'
});

const DEFAULT_CAPITAL_ALLOCATION_INPUT = Object.freeze({
  company: Object.freeze({ displayName: 'Apex Consumer Products' }),
  capitalAllocationPhilosophy: Object.freeze({
    statedPhilosophy: 'Prioritize reinvestment in brands, distribution, capacity, and working capital discipline while maintaining conservative leverage.',
    clarity: 'Medium',
    consistencyRead: 'Management commentary suggests a reinvestment-first approach, but historical outcome evidence remains incomplete.',
    evidenceExpectation: 'Annual letters, management commentary, capital allocation policies'
  }),
  capitalSources: Object.freeze([
    Object.freeze({ source: 'Operating cash flow', role: 'Primary internal funding source', durability: 'To verify' }),
    Object.freeze({ source: 'Debt capacity', role: 'Supplemental funding for capacity or working capital', durability: 'To verify' }),
    Object.freeze({ source: 'Equity issuance', role: 'Not expected as a routine funding source', durability: 'Low preference' })
  ]),
  reinvestmentStrategy: Object.freeze({
    strategy: 'Reinvest in product availability, brand building, distribution reach, and manufacturing capacity.',
    currentRead: 'Plausible but evidence incomplete',
    evidenceExpectation: 'Capex history, expansion projects, R&D investment'
  }),
  organicInvestment: Object.freeze([
    Object.freeze({ area: 'Distribution expansion', expectedPurpose: 'Increase availability and market penetration', evidenceStatus: 'partial' }),
    Object.freeze({ area: 'Capacity additions', expectedPurpose: 'Support growth and supply reliability', evidenceStatus: 'missing' }),
    Object.freeze({ area: 'Product development', expectedPurpose: 'Refresh portfolio and maintain relevance', evidenceStatus: 'partial' }),
    Object.freeze({ area: 'Productivity improvements', expectedPurpose: 'Improve efficiency and cost resilience', evidenceStatus: 'missing' })
  ]),
  acquisitions: Object.freeze({
    history: 'No major acquisition record included in current product snapshot.',
    disciplineRead: 'Unknown',
    evidenceExpectation: 'Acquisition history, integration outcomes, post-acquisition performance'
  }),
  shareholderReturns: Object.freeze({
    dividendPolicy: 'Appears secondary to reinvestment; requires dividend history validation.',
    buybackPolicy: 'No recurring buyback pattern included in current product snapshot.',
    dilutionRead: 'Requires issuance history review.',
    evidenceExpectation: 'Dividend history, buyback history, issuance history'
  }),
  balanceSheetDiscipline: Object.freeze({
    leverageRead: 'Conservative posture suggested but not yet verified.',
    refinancingRead: 'Requires debt maturity and refinancing history.',
    evidenceExpectation: 'Debt trends, leverage policy, refinancing decisions'
  }),
  workingCapitalDiscipline: Object.freeze({
    currentRead: 'Important due to inventory, receivables, trade schemes, and distributor economics.',
    openQuestions: Object.freeze(['inventory days trend', 'receivables quality', 'payables discipline', 'cash conversion cycle']),
    evidenceExpectation: 'Inventory, receivables, payables, cash conversion cycle'
  }),
  capitalAllocationTrackRecord: Object.freeze({
    currentRead: 'Incomplete',
    outcomeEvidenceNeeded: Object.freeze(['ROIC trends', 'incremental returns on invested capital', 'growth funded without excessive dilution', 'cash conversion outcomes']),
    evidenceExpectation: 'ROIC trends, incremental returns on invested capital, historical outcomes'
  }),
  longTermValueCreation: Object.freeze({
    currentRead: 'Unproven',
    valueCreationQuestion: 'Has retained capital created durable per-share value over time?',
    evidenceNeeded: Object.freeze(['per-share growth', 'return on reinvestment', 'capital intensity trend', 'shareholder dilution history'])
  }),
  investorJudgment: Object.freeze({ status: 'Capital allocation reviewed', note: 'Capital allocation discipline is not yet concluded. Evidence must connect management choices to long-term outcomes.' })
});

export function createCapitalAllocation(input = DEFAULT_CAPITAL_ALLOCATION_INPUT) {
  const normalized = normalizeInput(input);
  const evidenceExpectations = createEvidenceExpectations(normalized);
  const qualityFacts = createCapitalAllocationFacts(normalized);
  const aiInterpretation = createAiInterpretation(normalized);
  const investorJudgment = createInvestorJudgment(normalized);
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Medium',
    coverage: 58,
    rationale: 'Capital Allocation identifies management philosophy, reinvestment choices, shareholder returns, balance sheet discipline, working capital discipline, and track record questions, but outcome evidence remains incomplete.',
    evidenceItems: ['capital allocation philosophy', 'capital sources', 'reinvestment strategy', 'organic investment', 'acquisitions', 'shareholder returns', 'balance sheet discipline', 'working capital discipline', 'track record'],
    missingEvidence: [
      { label: 'capex history and project outcomes', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'ROIC and incremental return trend', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'cash conversion cycle history', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'dividend, buyback, and issuance history', priority: 'Medium', status: 'missing', sourceCount: 0 },
      { label: 'debt maturity and refinancing history', priority: 'Medium', status: 'missing', sourceCount: 0 }
    ]
  });
  const sections = Object.freeze({
    capitalAllocationHeader: createCapitalAllocationHeader(normalized),
    capitalAllocationPhilosophy: createCapitalAllocationPhilosophy(normalized),
    capitalSources: createCapitalSources(normalized),
    reinvestmentStrategy: createReinvestmentStrategy(normalized),
    organicInvestment: createOrganicInvestment(normalized),
    acquisitions: createAcquisitions(normalized),
    shareholderReturns: createShareholderReturns(normalized),
    balanceSheetDiscipline: createBalanceSheetDiscipline(normalized),
    workingCapitalDiscipline: createWorkingCapitalDiscipline(normalized),
    capitalAllocationTrackRecord: createCapitalAllocationTrackRecord(normalized),
    longTermValueCreation: createLongTermValueCreation(normalized),
    evidenceExpectations,
    qualityFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    capitalAllocationAssessmentOnly: true,
    noCapitalAllocationScore: true,
    noRanking: true,
    noQualityScore: true,
    noValuation: true,
    noRecommendation: true,
    noExecution: true
  });
  const futureExtensions = Object.freeze(['capital allocation timeline', 'incremental ROIC analysis', 'cash conversion trend integration', 'shareholder return history']);

  return deepFreeze({
    type: 'capital-allocation',
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
          dimension: 'Capital Allocation',
          capitalSources: normalized.capitalSources,
          allocationChoices: normalized.organicInvestment,
          evidenceExpectations: evidenceExpectations.items,
          measurementDeferred: true
        }
      }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      lifecycleBasedAssessment: true,
      userCanUnderstand: Object.freeze(['capital allocation philosophy', 'capital sources', 'reinvestment strategy', 'organic investment', 'acquisitions', 'shareholder returns', 'balance sheet discipline', 'working capital discipline', 'capital allocation track record', 'long-term value creation']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultCapitalAllocationInput() {
  return clone(DEFAULT_CAPITAL_ALLOCATION_INPUT);
}

function createCapitalAllocationHeader(input) { return Object.freeze({ component: 'CapitalAllocationHeader', companyName: input.company.displayName, investorQuestion: FEATURE_META.investorQuestion }); }
function createCapitalAllocationPhilosophy(input) { return Object.freeze({ component: 'CapitalAllocationPhilosophy', ...input.capitalAllocationPhilosophy, factsOnly: false }); }
function createCapitalSources(input) { return Object.freeze({ component: 'CapitalSources', items: input.capitalSources, factsOnly: false }); }
function createReinvestmentStrategy(input) { return Object.freeze({ component: 'ReinvestmentStrategy', ...input.reinvestmentStrategy, factsOnly: false }); }
function createOrganicInvestment(input) { return Object.freeze({ component: 'OrganicInvestment', items: input.organicInvestment, factsOnly: false }); }
function createAcquisitions(input) { return Object.freeze({ component: 'Acquisitions', ...input.acquisitions, factsOnly: false }); }
function createShareholderReturns(input) { return Object.freeze({ component: 'ShareholderReturns', ...input.shareholderReturns, factsOnly: false }); }
function createBalanceSheetDiscipline(input) { return Object.freeze({ component: 'BalanceSheetDiscipline', ...input.balanceSheetDiscipline, factsOnly: false }); }
function createWorkingCapitalDiscipline(input) { return Object.freeze({ component: 'WorkingCapitalDiscipline', ...input.workingCapitalDiscipline, factsOnly: false }); }
function createCapitalAllocationTrackRecord(input) { return Object.freeze({ component: 'CapitalAllocationTrackRecord', ...input.capitalAllocationTrackRecord, factsOnly: false }); }
function createLongTermValueCreation(input) { return Object.freeze({ component: 'LongTermValueCreation', ...input.longTermValueCreation, factsOnly: false }); }

function createEvidenceExpectations(input) {
  return Object.freeze({
    component: 'CapitalAllocationEvidenceExpectations',
    items: deepFreeze([
      { section: 'Capital Allocation Philosophy', typicalEvidence: input.capitalAllocationPhilosophy.evidenceExpectation },
      { section: 'Reinvestment Strategy', typicalEvidence: input.reinvestmentStrategy.evidenceExpectation },
      { section: 'Organic Investment', typicalEvidence: 'Capacity additions, product development, productivity improvements' },
      { section: 'Acquisitions', typicalEvidence: input.acquisitions.evidenceExpectation },
      { section: 'Shareholder Returns', typicalEvidence: input.shareholderReturns.evidenceExpectation },
      { section: 'Balance Sheet Discipline', typicalEvidence: input.balanceSheetDiscipline.evidenceExpectation },
      { section: 'Working Capital Discipline', typicalEvidence: input.workingCapitalDiscipline.evidenceExpectation },
      { section: 'Capital Allocation Track Record', typicalEvidence: input.capitalAllocationTrackRecord.evidenceExpectation }
    ]),
    actionable: true
  });
}

function createCapitalAllocationFacts(input) {
  return Object.freeze({
    component: 'CapitalAllocationFacts',
    items: deepFreeze([
      { id: 'capital-allocation-philosophy', kind: 'fact', source: 'capital-allocation-input', value: input.capitalAllocationPhilosophy.statedPhilosophy },
      { id: 'capital-sources', kind: 'fact', source: 'capital-allocation-input', value: input.capitalSources.map(source => source.source).join(', ') },
      { id: 'reinvestment-strategy', kind: 'fact', source: 'capital-allocation-input', value: input.reinvestmentStrategy.strategy },
      { id: 'organic-investment-areas', kind: 'fact', source: 'capital-allocation-input', value: input.organicInvestment.map(item => item.area).join(', ') },
      { id: 'track-record-read', kind: 'fact', source: 'capital-allocation-input', value: input.capitalAllocationTrackRecord.currentRead }
    ]),
    factsOnly: true
  });
}

function createAiInterpretation(input) {
  return Object.freeze({
    component: 'CapitalAllocationAIInterpretation',
    kind: 'generated_explanation',
    source: 'deterministic-product-summary',
    basedOn: Object.freeze(['capital-allocation-philosophy', 'capital-sources', 'reinvestment-strategy', 'organic-investment', 'acquisitions', 'shareholder-returns', 'balance-sheet-discipline', 'working-capital-discipline', 'capital-allocation-track-record', 'long-term-value-creation']),
    summary: `${input.company.displayName}'s capital allocation appears reinvestment-oriented, but effectiveness is not yet proven because project outcomes, incremental returns, cash conversion, and shareholder return history require evidence.`,
    caution: 'Generated capital allocation interpretation only. It does not create a capital allocation score, rank management, value the company, recommend action, or replace investor judgment.'
  });
}
function createInvestorJudgment(input) { return Object.freeze({ component: 'CapitalAllocationInvestorJudgment', status: input.investorJudgment.status, note: input.investorJudgment.note, controlledBy: 'Investor', noAutomation: true }); }

function normalizeInput(input) {
  const company = input.company || {};
  requireText(company.displayName, 'company.displayName');
  return Object.freeze({
    company: Object.freeze({ displayName: company.displayName }),
    capitalAllocationPhilosophy: normalizeObject(input.capitalAllocationPhilosophy, ['statedPhilosophy', 'clarity', 'consistencyRead', 'evidenceExpectation']),
    capitalSources: normalizeItems(input.capitalSources, ['source', 'role', 'durability']),
    reinvestmentStrategy: normalizeObject(input.reinvestmentStrategy, ['strategy', 'currentRead', 'evidenceExpectation']),
    organicInvestment: normalizeItems(input.organicInvestment, ['area', 'expectedPurpose', 'evidenceStatus']),
    acquisitions: normalizeObject(input.acquisitions, ['history', 'disciplineRead', 'evidenceExpectation']),
    shareholderReturns: normalizeObject(input.shareholderReturns, ['dividendPolicy', 'buybackPolicy', 'dilutionRead', 'evidenceExpectation']),
    balanceSheetDiscipline: normalizeObject(input.balanceSheetDiscipline, ['leverageRead', 'refinancingRead', 'evidenceExpectation']),
    workingCapitalDiscipline: normalizeListObject(input.workingCapitalDiscipline, ['currentRead', 'evidenceExpectation'], ['openQuestions']),
    capitalAllocationTrackRecord: normalizeListObject(input.capitalAllocationTrackRecord, ['currentRead', 'evidenceExpectation'], ['outcomeEvidenceNeeded']),
    longTermValueCreation: normalizeListObject(input.longTermValueCreation, ['currentRead', 'valueCreationQuestion'], ['evidenceNeeded']),
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
