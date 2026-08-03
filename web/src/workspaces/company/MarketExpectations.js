import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-VAL-005',
  workspace: 'Company Workspace',
  epic: 'Valuation',
  featureId: 'VAL.5',
  featureName: 'Market Expectations',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'What expectations appear to be embedded in the current price?',
  purpose: 'Infer and explain the expectations implied by the current market price without concluding that the market is right or wrong and without recommending action.'
});

const DEFAULT_MARKET_EXPECTATIONS_INPUT = Object.freeze({
  company: Object.freeze({ displayName: 'Apex Consumer Products' }),
  currentMarketPrice: Object.freeze({
    price: 1240,
    displayPrice: '₹1,240',
    currency: 'INR',
    asOf: 'FY2026 demo snapshot',
    source: 'valuation snapshot input'
  }),
  impliedGrowthExpectations: Object.freeze({
    currentRead: 'Current price appears to require growth assumptions close to the base-to-bull range rather than the bear case.',
    impliedAssumption: 'Mid/high-single digit to low-double digit revenue growth depending on margin and reinvestment assumptions.',
    evidenceExpectation: 'Reverse-valuation assumptions, analyst expectations, historical growth'
  }),
  impliedProfitabilityExpectations: Object.freeze({
    currentRead: 'Current price appears to require stable to modestly improving profitability if growth remains moderate.',
    impliedAssumption: 'Stable margins or modest operating leverage.',
    evidenceExpectation: 'Historical margins, peer economics, management guidance'
  }),
  impliedReinvestmentExpectations: Object.freeze({
    currentRead: 'Current price appears more supportable if reinvestment remains efficient and does not consume excessive incremental cash flow.',
    impliedAssumption: 'Moderate reinvestment with reasonable incremental returns.',
    evidenceExpectation: 'Capex, R&D, working capital, capital allocation history'
  }),
  scenarioConsistency: Object.freeze({
    closestScenario: 'Base Scenario',
    consistencyRead: 'Current market price sits closer to the base scenario than to the bear scenario, while still below the bull scenario estimate.',
    noCorrectScenario: true,
    evidenceExpectation: 'Mapping between implied assumptions and documented valuation scenarios'
  }),
  expectationSummary: Object.freeze({
    summary: 'The current price appears to embed expectations of steady growth, stable profitability, and manageable reinvestment. These expectations require evidence support before any investor conclusion can be formed.',
    evidenceExpectation: 'Consolidated explanation supported by documented assumptions'
  }),
  investorJudgment: Object.freeze({ status: 'Market expectations reviewed', note: 'Investor must decide whether the inferred expectations are reasonable. This feature does not conclude whether the market is mispricing the company.' })
});

export function createMarketExpectations(input = DEFAULT_MARKET_EXPECTATIONS_INPUT) {
  const normalized = normalizeInput(input);
  const evidenceExpectations = createEvidenceExpectations(normalized);
  const valuationFacts = createValuationFacts(normalized);
  const aiInterpretation = createAiInterpretation(normalized);
  const investorJudgment = createInvestorJudgment(normalized);
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Medium',
    coverage: 54,
    rationale: 'Market Expectations infers assumptions implied by current price, but reverse-valuation model support, external consensus, and historical evidence remain incomplete.',
    evidenceItems: ['current market price', 'implied growth expectations', 'implied profitability expectations', 'implied reinvestment expectations', 'scenario consistency', 'expectation summary'],
    missingEvidence: [
      { label: 'source-linked market price and timestamp', priority: 'High', status: 'partial', sourceCount: 1 },
      { label: 'reverse-valuation model artifact', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'analyst or consensus expectation support', priority: 'Medium', status: 'missing', sourceCount: 0 },
      { label: 'historical growth and margin evidence', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'scenario mapping documentation', priority: 'High', status: 'missing', sourceCount: 0 }
    ]
  });
  const sections = Object.freeze({
    marketExpectationsHeader: createHeader(normalized),
    currentMarketPrice: createCurrentMarketPrice(normalized),
    impliedGrowthExpectations: createSection('ImpliedGrowthExpectations', normalized.impliedGrowthExpectations),
    impliedProfitabilityExpectations: createSection('ImpliedProfitabilityExpectations', normalized.impliedProfitabilityExpectations),
    impliedReinvestmentExpectations: createSection('ImpliedReinvestmentExpectations', normalized.impliedReinvestmentExpectations),
    scenarioConsistency: createScenarioConsistency(normalized),
    expectationSummary: createExpectationSummary(normalized),
    evidenceExpectations,
    valuationFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    valuationOnly: true,
    marketExpectationsOnly: true,
    expectationInferenceOnly: true,
    noMarketMispricingConclusion: true,
    noCorrectScenario: true,
    noTargetPrice: true,
    noRecommendation: true,
    noDecision: true,
    noExecution: true,
    noPositionSizing: true,
    noPortfolioAction: true
  });
  const futureExtensions = Object.freeze(['reverse valuation artifact links', 'consensus expectation integration', 'market-implied assumption charts', 'scenario mapping drill-through']);

  return deepFreeze({
    type: 'market-expectations',
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
          dimension: 'Market Expectations',
          impliedGrowthExpectations: normalized.impliedGrowthExpectations,
          impliedProfitabilityExpectations: normalized.impliedProfitabilityExpectations,
          impliedReinvestmentExpectations: normalized.impliedReinvestmentExpectations,
          scenarioConsistency: normalized.scenarioConsistency,
          expectationInferenceOnly: true
        }
      }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      expectationInferenceOnly: true,
      noMarketMispricingConclusion: true,
      userCanUnderstand: Object.freeze(['current market price', 'implied growth expectations', 'implied profitability expectations', 'implied reinvestment expectations', 'scenario consistency', 'expectation summary', 'evidence support for inferred expectations']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultMarketExpectationsInput() { return clone(DEFAULT_MARKET_EXPECTATIONS_INPUT); }

function createHeader(input) { return Object.freeze({ component: 'MarketExpectationsHeader', companyName: input.company.displayName, investorQuestion: FEATURE_META.investorQuestion }); }
function createCurrentMarketPrice(input) { return Object.freeze({ component: 'MarketExpectationsCurrentMarketPrice', ...input.currentMarketPrice, factsOnly: true }); }
function createSection(component, input) { return Object.freeze({ component, ...input, inferenceOnly: true }); }
function createScenarioConsistency(input) { return Object.freeze({ component: 'ScenarioConsistency', ...input.scenarioConsistency, noCorrectScenario: true }); }
function createExpectationSummary(input) { return Object.freeze({ component: 'ExpectationSummary', ...input.expectationSummary, noMispricingConclusion: true }); }
function createEvidenceExpectations(input) { return Object.freeze({ component: 'MarketExpectationsEvidenceExpectations', items: deepFreeze([
  { section: 'Current Market Price', typicalEvidence: 'Source-linked market price and timestamp' },
  { section: 'Implied Growth Expectations', typicalEvidence: input.impliedGrowthExpectations.evidenceExpectation },
  { section: 'Implied Profitability Expectations', typicalEvidence: input.impliedProfitabilityExpectations.evidenceExpectation },
  { section: 'Implied Reinvestment Expectations', typicalEvidence: input.impliedReinvestmentExpectations.evidenceExpectation },
  { section: 'Scenario Consistency', typicalEvidence: input.scenarioConsistency.evidenceExpectation },
  { section: 'Expectation Summary', typicalEvidence: input.expectationSummary.evidenceExpectation }
]), actionable: true }); }
function createValuationFacts(input) { return Object.freeze({ component: 'MarketExpectationsFacts', items: deepFreeze([
  { id: 'current-market-price', kind: 'fact', source: 'market-expectations-input', value: input.currentMarketPrice.displayPrice },
  { id: 'implied-growth', kind: 'fact', source: 'market-expectations-input', value: input.impliedGrowthExpectations.impliedAssumption },
  { id: 'implied-profitability', kind: 'fact', source: 'market-expectations-input', value: input.impliedProfitabilityExpectations.impliedAssumption },
  { id: 'implied-reinvestment', kind: 'fact', source: 'market-expectations-input', value: input.impliedReinvestmentExpectations.impliedAssumption },
  { id: 'scenario-consistency', kind: 'fact', source: 'market-expectations-input', value: input.scenarioConsistency.closestScenario }
]), factsOnly: true }); }
function createAiInterpretation(input) { return Object.freeze({ component: 'MarketExpectationsAIInterpretation', kind: 'generated_explanation', source: 'deterministic-product-summary', basedOn: Object.freeze(['current-market-price', 'implied-growth', 'implied-profitability', 'implied-reinvestment', 'scenario-consistency']), summary: `${input.company.displayName}'s current price appears to imply expectations near ${input.scenarioConsistency.closestScenario.toLowerCase()}, with assumptions around ${input.impliedGrowthExpectations.impliedAssumption.toLowerCase()} and ${input.impliedProfitabilityExpectations.impliedAssumption.toLowerCase()}. This inference does not mean the market is correct or incorrect.`, caution: 'Generated market expectations interpretation only. It does not conclude mispricing, identify a correct scenario, issue a target price, recommend action, make a decision, size a position, or execute anything.' }); }
function createInvestorJudgment(input) { return Object.freeze({ component: 'MarketExpectationsInvestorJudgment', status: input.investorJudgment.status, note: input.investorJudgment.note, controlledBy: 'Investor', noAutomation: true }); }
function normalizeInput(input) { const company = input.company || {}; requireText(company.displayName, 'company.displayName'); return Object.freeze({ company: Object.freeze({ displayName: company.displayName }), currentMarketPrice: normalizeObject(input.currentMarketPrice, ['price', 'displayPrice', 'currency', 'asOf', 'source']), impliedGrowthExpectations: normalizeObject(input.impliedGrowthExpectations, ['currentRead', 'impliedAssumption', 'evidenceExpectation']), impliedProfitabilityExpectations: normalizeObject(input.impliedProfitabilityExpectations, ['currentRead', 'impliedAssumption', 'evidenceExpectation']), impliedReinvestmentExpectations: normalizeObject(input.impliedReinvestmentExpectations, ['currentRead', 'impliedAssumption', 'evidenceExpectation']), scenarioConsistency: normalizeObject(input.scenarioConsistency, ['closestScenario', 'consistencyRead', 'noCorrectScenario', 'evidenceExpectation']), expectationSummary: normalizeObject(input.expectationSummary, ['summary', 'evidenceExpectation']), investorJudgment: Object.freeze({ status: valueOrUnknown(input.investorJudgment?.status), note: valueOrUnknown(input.investorJudgment?.note) }) }); }
function normalizeObject(item, requiredFields) { const source = item || {}; for (const field of requiredFields) if (source[field] === undefined || source[field] === null || source[field] === '') throw new Error(`${field} is required`); return Object.freeze({ ...source }); }
function valueOrUnknown(value) { return value === undefined || value === null || value === '' ? 'Unknown' : value; }
function requireText(value, label) { if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
