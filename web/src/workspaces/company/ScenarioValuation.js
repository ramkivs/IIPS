import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-VAL-003',
  workspace: 'Company Workspace',
  epic: 'Valuation',
  featureId: 'VAL.3',
  featureName: 'Scenario Valuation',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'How does estimated value change across scenarios?',
  purpose: 'Estimate valuation across multiple coherent scenarios and expose each scenario’s assumptions without identifying a correct scenario, assigning probabilities, or recommending action.'
});

const DEFAULT_SCENARIO_VALUATION_INPUT = Object.freeze({
  company: Object.freeze({ displayName: 'Apex Consumer Products' }),
  scenarioDefinitions: Object.freeze({
    framework: 'Three internally consistent scenarios using revenue growth, margins, reinvestment, discount rate, and terminal growth assumptions.',
    scenarioSet: 'Bear / Base / Bull',
    noProbabilityAssigned: true,
    evidenceExpectation: 'Assumption framework and rationale'
  }),
  scenarios: Object.freeze([
    Object.freeze({
      scenarioId: 'bear',
      label: 'Bear Scenario',
      estimatedValue: '₹920',
      assumptions: Object.freeze({ revenueGrowth: 'Low single digit', margin: 'Pressure from competition and input costs', reinvestment: 'Elevated working capital need', discountRate: 'Higher required return', terminalGrowth: 'Conservative mature growth' }),
      rationale: 'Downturn assumptions, slower growth, and margin pressure reduce estimated value.',
      evidenceExpectation: 'Downturn assumptions, margin pressure, slower growth'
    }),
    Object.freeze({
      scenarioId: 'base',
      label: 'Base Scenario',
      estimatedValue: '₹1,180',
      assumptions: Object.freeze({ revenueGrowth: 'Mid-single digit to high-single digit', margin: 'Stable margins', reinvestment: 'Moderate reinvestment', discountRate: 'Normal required return', terminalGrowth: 'Inflation-plus mature growth' }),
      rationale: 'Base assumptions reflect steady execution and moderate reinvestment without heroic margin expansion.',
      evidenceExpectation: 'Management guidance, historical performance, consensus assumptions'
    }),
    Object.freeze({
      scenarioId: 'bull',
      label: 'Bull Scenario',
      estimatedValue: '₹1,520',
      assumptions: Object.freeze({ revenueGrowth: 'Low-double digit', margin: 'Modest operating leverage', reinvestment: 'Efficient reinvestment', discountRate: 'Lower justified required return', terminalGrowth: 'Sustained category growth' }),
      rationale: 'Strong execution, operating leverage, and efficient reinvestment increase estimated value.',
      evidenceExpectation: 'Strong execution, favorable market conditions, sustained returns'
    })
  ]),
  keyAssumptionDifferences: Object.freeze([
    Object.freeze({ driver: 'Revenue growth', bear: 'Low single digit', base: 'Mid/high-single digit', bull: 'Low-double digit' }),
    Object.freeze({ driver: 'Margins', bear: 'Pressure', base: 'Stable', bull: 'Modest expansion' }),
    Object.freeze({ driver: 'Reinvestment', bear: 'Elevated need', base: 'Moderate', bull: 'Efficient' }),
    Object.freeze({ driver: 'Discount rate', bear: 'Higher', base: 'Normal', bull: 'Lower justified' }),
    Object.freeze({ driver: 'Terminal growth', bear: 'Conservative', base: 'Mature steady', bull: 'Sustained category growth' })
  ]),
  scenarioComparison: Object.freeze({
    spread: '₹600',
    lowScenario: 'Bear Scenario',
    highScenario: 'Bull Scenario',
    interpretation: 'Estimated value changes materially as growth, margins, reinvestment, discount rate, and terminal assumptions change together.'
  }),
  investorJudgment: Object.freeze({ status: 'Scenario valuation reviewed', note: 'Investor must judge whether each scenario’s assumptions are internally coherent and evidence-supported. No scenario is selected as correct.' })
});

export function createScenarioValuation(input = DEFAULT_SCENARIO_VALUATION_INPUT) {
  const normalized = normalizeInput(input);
  const evidenceExpectations = createEvidenceExpectations(normalized);
  const valuationFacts = createValuationFacts(normalized);
  const aiInterpretation = createAiInterpretation(normalized);
  const investorJudgment = createInvestorJudgment(normalized);
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Medium',
    coverage: 56,
    rationale: 'Scenario Valuation defines bear, base, and bull assumptions with conditional valuation outputs, but source-linked support for scenario assumptions and model outputs remains incomplete.',
    evidenceItems: ['scenario definitions', 'bear scenario', 'base scenario', 'bull scenario', 'key assumption differences', 'scenario comparison'],
    missingEvidence: [
      { label: 'scenario model artifact link', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'bear-case historical analogs', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'base-case management or consensus support', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'bull-case execution evidence', priority: 'Medium', status: 'missing', sourceCount: 0 },
      { label: 'discount rate and terminal assumption support by scenario', priority: 'High', status: 'missing', sourceCount: 0 }
    ]
  });
  const sections = Object.freeze({
    scenarioValuationHeader: createHeader(normalized),
    scenarioDefinitions: createScenarioDefinitions(normalized),
    bearScenario: createScenarioSection(normalized.scenarios[0]),
    baseScenario: createScenarioSection(normalized.scenarios[1]),
    bullScenario: createScenarioSection(normalized.scenarios[2]),
    scenarioComparison: createScenarioComparison(normalized),
    keyAssumptionDifferences: createKeyAssumptionDifferences(normalized),
    evidenceExpectations,
    valuationFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    valuationOnly: true,
    scenarioValuationOnly: true,
    noProbabilityAssignment: true,
    noPreferredScenario: true,
    noTargetPrice: true,
    noRecommendation: true,
    noDecision: true,
    noExecution: true,
    noPositionSizing: true,
    noPortfolioAction: true
  });
  const futureExtensions = Object.freeze(['scenario model artifact links', 'scenario chart', 'scenario-specific evidence confidence', 'scenario version history']);

  return deepFreeze({
    type: 'scenario-valuation',
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
          dimension: 'Scenario Valuation',
          scenarios: normalized.scenarios,
          keyAssumptionDifferences: normalized.keyAssumptionDifferences,
          scenarioComparison: normalized.scenarioComparison,
          noProbabilityAssigned: true
        }
      }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      conditionalValuationOnly: true,
      noProbabilityAssignment: true,
      noPreferredScenario: true,
      userCanUnderstand: Object.freeze(['scenario definitions', 'bear scenario', 'base scenario', 'bull scenario', 'scenario comparison', 'key assumption differences', 'evidence support for scenarios']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultScenarioValuationInput() { return clone(DEFAULT_SCENARIO_VALUATION_INPUT); }

function createHeader(input) { return Object.freeze({ component: 'ScenarioValuationHeader', companyName: input.company.displayName, investorQuestion: FEATURE_META.investorQuestion }); }
function createScenarioDefinitions(input) { return Object.freeze({ component: 'ScenarioDefinitions', ...input.scenarioDefinitions, noProbabilityAssigned: true }); }
function createScenarioSection(scenario) { return Object.freeze({ component: scenario.label.replaceAll(' ', ''), ...scenario, conditionalOutcomeOnly: true, noProbabilityAssigned: true }); }
function createScenarioComparison(input) { return Object.freeze({ component: 'ScenarioComparison', ...input.scenarioComparison, noPreferredScenario: true }); }
function createKeyAssumptionDifferences(input) { return Object.freeze({ component: 'KeyAssumptionDifferences', items: input.keyAssumptionDifferences, factsOnly: false }); }
function createEvidenceExpectations(input) { return Object.freeze({ component: 'ScenarioValuationEvidenceExpectations', items: deepFreeze([
  { section: 'Scenario Definitions', typicalEvidence: input.scenarioDefinitions.evidenceExpectation },
  { section: 'Bear Scenario', typicalEvidence: input.scenarios[0].evidenceExpectation },
  { section: 'Base Scenario', typicalEvidence: input.scenarios[1].evidenceExpectation },
  { section: 'Bull Scenario', typicalEvidence: input.scenarios[2].evidenceExpectation },
  { section: 'Key Assumption Differences', typicalEvidence: 'Growth, margins, reinvestment, discount rate, terminal growth' },
  { section: 'Scenario Comparison', typicalEvidence: 'Model outputs tied back to documented assumptions' }
]), actionable: true }); }
function createValuationFacts(input) { return Object.freeze({ component: 'ScenarioValuationFacts', items: deepFreeze([
  { id: 'scenario-set', kind: 'fact', source: 'scenario-valuation-input', value: input.scenarioDefinitions.scenarioSet },
  { id: 'bear-estimate', kind: 'fact', source: 'scenario-valuation-input', value: input.scenarios[0].estimatedValue },
  { id: 'base-estimate', kind: 'fact', source: 'scenario-valuation-input', value: input.scenarios[1].estimatedValue },
  { id: 'bull-estimate', kind: 'fact', source: 'scenario-valuation-input', value: input.scenarios[2].estimatedValue },
  { id: 'scenario-spread', kind: 'fact', source: 'scenario-valuation-input', value: input.scenarioComparison.spread }
]), factsOnly: true }); }
function createAiInterpretation(input) { return Object.freeze({ component: 'ScenarioValuationAIInterpretation', kind: 'generated_explanation', source: 'deterministic-product-summary', basedOn: Object.freeze(['scenario-definitions', 'bear-scenario', 'base-scenario', 'bull-scenario', 'key-assumption-differences', 'scenario-comparison']), summary: `${input.company.displayName}'s scenario valuation shows conditional values from ${input.scenarios[0].estimatedValue} to ${input.scenarios[2].estimatedValue}. The spread is driven by coherent changes in growth, margins, reinvestment, discount rate, and terminal assumptions rather than by selecting one correct scenario.`, caution: 'Generated scenario interpretation only. It assigns no probabilities, chooses no preferred scenario, issues no target price, recommends no action, makes no decision, and executes nothing.' }); }
function createInvestorJudgment(input) { return Object.freeze({ component: 'ScenarioValuationInvestorJudgment', status: input.investorJudgment.status, note: input.investorJudgment.note, controlledBy: 'Investor', noAutomation: true }); }
function normalizeInput(input) { const company = input.company || {}; requireText(company.displayName, 'company.displayName'); const scenarios = normalizeItems(input.scenarios, ['scenarioId', 'label', 'estimatedValue', 'assumptions', 'rationale', 'evidenceExpectation']); if (scenarios.length !== 3) throw new Error('Scenario Valuation requires exactly three scenarios'); return Object.freeze({ company: Object.freeze({ displayName: company.displayName }), scenarioDefinitions: normalizeObject(input.scenarioDefinitions, ['framework', 'scenarioSet', 'noProbabilityAssigned', 'evidenceExpectation']), scenarios, keyAssumptionDifferences: normalizeItems(input.keyAssumptionDifferences, ['driver', 'bear', 'base', 'bull']), scenarioComparison: normalizeObject(input.scenarioComparison, ['spread', 'lowScenario', 'highScenario', 'interpretation']), investorJudgment: Object.freeze({ status: valueOrUnknown(input.investorJudgment?.status), note: valueOrUnknown(input.investorJudgment?.note) }) }); }
function normalizeObject(item, requiredFields) { const source = item || {}; for (const field of requiredFields) if (source[field] === undefined || source[field] === null || source[field] === '') throw new Error(`${field} is required`); return Object.freeze({ ...source }); }
function normalizeItems(items, requiredFields) { return deepFreeze(freezeList(items).map((item, index) => { for (const field of requiredFields) if (item?.[field] === undefined || item?.[field] === null || item?.[field] === '') throw new Error(`items[${index}].${field} is required`); return Object.freeze({ ...item }); })); }
function freezeList(value) { return Object.freeze([...(Array.isArray(value) ? value : [])]); }
function valueOrUnknown(value) { return value === undefined || value === null || value === '' ? 'Unknown' : value; }
function requireText(value, label) { if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
