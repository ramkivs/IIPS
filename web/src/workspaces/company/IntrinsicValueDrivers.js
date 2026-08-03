import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-VAL-002',
  workspace: 'Company Workspace',
  epic: 'Valuation',
  featureId: 'VAL.2',
  featureName: 'Intrinsic Value Drivers',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'What assumptions drive intrinsic value?',
  purpose: 'Identify and explain the fundamental assumptions that influence intrinsic value and their interactions without calculating or concluding a definitive intrinsic value.'
});

const DEFAULT_INTRINSIC_VALUE_DRIVERS_INPUT = Object.freeze({
  company: Object.freeze({ displayName: 'Apex Consumer Products' }),
  revenueGrowthDrivers: Object.freeze({
    concept: 'Revenue growth can increase intrinsic value when growth produces future cash flows above the capital required to fund it.',
    positiveEffect: 'Higher sustainable growth can expand future cash flows.',
    caution: 'Growth can destroy value if it requires excessive reinvestment or earns poor incremental returns.',
    evidenceExpectation: 'Historical growth, TAM, management guidance, analyst estimates'
  }),
  profitabilityDrivers: Object.freeze({
    concept: 'Profitability determines how much revenue converts into operating earnings and potential cash generation.',
    positiveEffect: 'Higher durable margins generally increase intrinsic value.',
    caution: 'Margin assumptions must be supported by cost structure, pricing power, and competitive evidence.',
    evidenceExpectation: 'Margin history, operating leverage, cost structure'
  }),
  reinvestmentDrivers: Object.freeze({
    concept: 'Reinvestment is the capital required to support growth, capacity, working capital, and competitive position.',
    positiveEffect: 'Efficient reinvestment can compound value over time.',
    caution: 'Higher growth often requires higher reinvestment, which can reduce near-term free cash flow.',
    evidenceExpectation: 'Capex, R&D, working capital, acquisition history'
  }),
  cashFlowDrivers: Object.freeze({
    concept: 'Intrinsic value depends on cash that can ultimately be generated for capital providers.',
    positiveEffect: 'Strong cash conversion increases the quality of valuation outputs.',
    caution: 'Accounting profits that do not convert to cash should weaken confidence in valuation assumptions.',
    evidenceExpectation: 'Operating cash flow, free cash flow conversion'
  }),
  costOfCapitalAssumptions: Object.freeze({
    concept: 'Cost of capital discounts future cash flows to present value and reflects required return for risk.',
    positiveEffect: 'Lower justified cost of capital increases present value.',
    caution: 'Understating risk can overstate intrinsic value.',
    evidenceExpectation: 'Risk-free rate, equity risk premium, beta assumptions, debt costs'
  }),
  terminalValueAssumptions: Object.freeze({
    concept: 'Terminal assumptions estimate value beyond the explicit forecast period.',
    positiveEffect: 'Higher sustainable terminal growth can increase terminal value.',
    caution: 'Terminal growth has a large impact only if it is economically sustainable.',
    evidenceExpectation: 'Long-term GDP/inflation assumptions, mature industry economics'
  }),
  driverInteractions: Object.freeze([
    Object.freeze({ relationship: 'Higher Growth → Higher Reinvestment → Lower Near-Term Free Cash Flow', explanation: 'Growth can raise value only if incremental returns exceed the capital required to fund that growth.' }),
    Object.freeze({ relationship: 'Higher Margins → Higher Cash Generation → Higher Intrinsic Value', explanation: 'Margin improvement can increase value when it is durable and cash-backed.' }),
    Object.freeze({ relationship: 'Higher Cost of Capital → Lower Present Value', explanation: 'A higher required return reduces the present value of future cash flows.' }),
    Object.freeze({ relationship: 'Higher Terminal Growth → Higher Terminal Value, Only If Sustainable', explanation: 'Terminal growth assumptions must be constrained by mature industry economics and long-term economic reality.' })
  ]),
  investorJudgment: Object.freeze({ status: 'Intrinsic value drivers reviewed', note: 'Investor must judge whether the drivers and assumptions are evidence-supported before relying on later valuation outputs.' })
});

export function createIntrinsicValueDrivers(input = DEFAULT_INTRINSIC_VALUE_DRIVERS_INPUT) {
  const normalized = normalizeInput(input);
  const evidenceExpectations = createEvidenceExpectations(normalized);
  const valuationFacts = createValuationFacts(normalized);
  const aiInterpretation = createAiInterpretation(normalized);
  const investorJudgment = createInvestorJudgment(normalized);
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Medium',
    coverage: 59,
    rationale: 'Intrinsic Value Drivers explains the major valuation assumptions and interactions, but historical support for growth, margins, reinvestment, cash conversion, cost of capital, and terminal assumptions remains incomplete.',
    evidenceItems: ['revenue growth drivers', 'profitability drivers', 'reinvestment drivers', 'cash flow drivers', 'cost of capital assumptions', 'terminal value assumptions', 'driver interactions'],
    missingEvidence: [
      { label: 'historical growth and addressable-market support', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'margin history and operating leverage evidence', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'reinvestment and working capital history', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'free cash flow conversion evidence', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'cost of capital assumption support', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'terminal growth economic support', priority: 'Medium', status: 'missing', sourceCount: 0 }
    ]
  });
  const sections = Object.freeze({
    intrinsicValueDriversHeader: createHeader(normalized),
    revenueGrowthDrivers: createDriverSection('RevenueGrowthDrivers', normalized.revenueGrowthDrivers),
    profitabilityDrivers: createDriverSection('ProfitabilityDrivers', normalized.profitabilityDrivers),
    reinvestmentDrivers: createDriverSection('ReinvestmentDrivers', normalized.reinvestmentDrivers),
    cashFlowDrivers: createDriverSection('CashFlowDrivers', normalized.cashFlowDrivers),
    costOfCapitalAssumptions: createDriverSection('CostOfCapitalAssumptions', normalized.costOfCapitalAssumptions),
    terminalValueAssumptions: createDriverSection('TerminalValueAssumptions', normalized.terminalValueAssumptions),
    driverInteraction: createDriverInteraction(normalized),
    evidenceExpectations,
    valuationFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    valuationOnly: true,
    intrinsicValueDriversOnly: true,
    noIntrinsicValueConclusion: true,
    noPreferredMethod: true,
    noTargetPrice: true,
    noRecommendation: true,
    noDecision: true,
    noExecution: true,
    noPositionSizing: true,
    noPortfolioAction: true
  });
  const futureExtensions = Object.freeze(['linked assumption evidence', 'driver dependency map', 'scenario model integration', 'sensitivity integration']);

  return deepFreeze({
    type: 'intrinsic-value-drivers',
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
      facts: valuationFacts.items,
      aiInterpretation,
      investorJudgment,
      evidenceConfidence,
      guardrails,
      sections,
      metadata: { workspace: FEATURE_META.workspace, status: FEATURE_META.status, futureExtensions },
      extensions: {
        valuation: {
          dimension: 'Intrinsic Value Drivers',
          driverInteractions: normalized.driverInteractions,
          evidenceExpectations: evidenceExpectations.items,
          explanatoryOnly: true
        }
      }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      explanatoryNotComputational: true,
      noIntrinsicValueConclusion: true,
      userCanUnderstand: Object.freeze(['revenue growth drivers', 'profitability drivers', 'reinvestment drivers', 'cash flow drivers', 'cost of capital assumptions', 'terminal value assumptions', 'driver interactions']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultIntrinsicValueDriversInput() { return clone(DEFAULT_INTRINSIC_VALUE_DRIVERS_INPUT); }

function createHeader(input) { return Object.freeze({ component: 'IntrinsicValueDriversHeader', companyName: input.company.displayName, investorQuestion: FEATURE_META.investorQuestion }); }
function createDriverSection(component, input) { return Object.freeze({ component, ...input, explanatoryOnly: true }); }
function createDriverInteraction(input) { return Object.freeze({ component: 'DriverInteraction', items: input.driverInteractions, relationshipFocused: true, noNumericSensitivity: true }); }
function createEvidenceExpectations(input) { return Object.freeze({ component: 'IntrinsicValueDriverEvidenceExpectations', items: deepFreeze([
  { section: 'Revenue Growth Drivers', typicalEvidence: input.revenueGrowthDrivers.evidenceExpectation },
  { section: 'Profitability Drivers', typicalEvidence: input.profitabilityDrivers.evidenceExpectation },
  { section: 'Reinvestment Drivers', typicalEvidence: input.reinvestmentDrivers.evidenceExpectation },
  { section: 'Cash Flow Drivers', typicalEvidence: input.cashFlowDrivers.evidenceExpectation },
  { section: 'Cost of Capital Assumptions', typicalEvidence: input.costOfCapitalAssumptions.evidenceExpectation },
  { section: 'Terminal Value Assumptions', typicalEvidence: input.terminalValueAssumptions.evidenceExpectation },
  { section: 'Driver Interaction', typicalEvidence: 'Scenario models showing relationships between assumptions' }
]), actionable: true }); }
function createValuationFacts(input) { return Object.freeze({ component: 'IntrinsicValueDriverFacts', items: deepFreeze([
  { id: 'revenue-growth-driver', kind: 'fact', source: 'intrinsic-value-drivers-input', value: input.revenueGrowthDrivers.concept },
  { id: 'profitability-driver', kind: 'fact', source: 'intrinsic-value-drivers-input', value: input.profitabilityDrivers.concept },
  { id: 'reinvestment-driver', kind: 'fact', source: 'intrinsic-value-drivers-input', value: input.reinvestmentDrivers.concept },
  { id: 'cash-flow-driver', kind: 'fact', source: 'intrinsic-value-drivers-input', value: input.cashFlowDrivers.concept },
  { id: 'cost-of-capital-driver', kind: 'fact', source: 'intrinsic-value-drivers-input', value: input.costOfCapitalAssumptions.concept },
  { id: 'terminal-value-driver', kind: 'fact', source: 'intrinsic-value-drivers-input', value: input.terminalValueAssumptions.concept }
]), factsOnly: true }); }
function createAiInterpretation(input) { return Object.freeze({ component: 'IntrinsicValueDriversAIInterpretation', kind: 'generated_explanation', source: 'deterministic-product-summary', basedOn: Object.freeze(['revenue-growth', 'profitability', 'reinvestment', 'cash-flow', 'cost-of-capital', 'terminal-assumptions', 'driver-interaction']), summary: `${input.company.displayName}'s intrinsic value is driven by the relationship between growth, profitability, reinvestment, cash conversion, discount rate, and terminal assumptions. The most important principle is that growth increases value only when supported by adequate returns and cash generation.`, caution: 'Generated driver explanation only. It does not calculate intrinsic value, select a preferred method, issue a target price, recommend action, make a decision, or execute anything.' }); }
function createInvestorJudgment(input) { return Object.freeze({ component: 'IntrinsicValueDriversInvestorJudgment', status: input.investorJudgment.status, note: input.investorJudgment.note, controlledBy: 'Investor', noAutomation: true }); }
function normalizeInput(input) { const company = input.company || {}; requireText(company.displayName, 'company.displayName'); return Object.freeze({ company: Object.freeze({ displayName: company.displayName }), revenueGrowthDrivers: normalizeDriver(input.revenueGrowthDrivers), profitabilityDrivers: normalizeDriver(input.profitabilityDrivers), reinvestmentDrivers: normalizeDriver(input.reinvestmentDrivers), cashFlowDrivers: normalizeDriver(input.cashFlowDrivers), costOfCapitalAssumptions: normalizeDriver(input.costOfCapitalAssumptions), terminalValueAssumptions: normalizeDriver(input.terminalValueAssumptions), driverInteractions: normalizeItems(input.driverInteractions, ['relationship', 'explanation']), investorJudgment: Object.freeze({ status: valueOrUnknown(input.investorJudgment?.status), note: valueOrUnknown(input.investorJudgment?.note) }) }); }
function normalizeDriver(item) { return normalizeObject(item, ['concept', 'positiveEffect', 'caution', 'evidenceExpectation']); }
function normalizeObject(item, requiredFields) { const source = item || {}; for (const field of requiredFields) requireText(source[field], field); return Object.freeze({ ...source }); }
function normalizeItems(items, requiredFields) { return deepFreeze(freezeList(items).map((item, index) => { for (const field of requiredFields) requireText(item?.[field], `items[${index}].${field}`); return Object.freeze({ ...item }); })); }
function freezeList(value) { return Object.freeze([...(Array.isArray(value) ? value : [])]); }
function valueOrUnknown(value) { return value === undefined || value === null || value === '' ? 'Unknown' : value; }
function requireText(value, label) { if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
