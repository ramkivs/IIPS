import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';
import { createBusinessQualitySummary } from './BusinessQualitySummary.js';
import { createValuationSummary } from './ValuationSummary.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-ID-003',
  workspace: 'Company Workspace',
  epic: 'Investment Decision',
  featureId: 'ID.3',
  featureName: 'Quality–Valuation Tradeoff',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'Is the quality worth the valuation?',
  purpose: 'Explain how business quality and valuation interact, where they reinforce each other, and where tensions exist without optimizing the tradeoff, recommending action, or making a decision.'
});

export function createQualityValuationTradeoff({ businessQualityFeature, valuationFeature } = {}) {
  const businessQuality = businessQualityFeature || createBusinessQualitySummary();
  const valuation = valuationFeature || createValuationSummary();
  validateInputs({ businessQuality, valuation });

  const reinforcementAreas = createReinforcementAreas({ businessQuality, valuation });
  const tensionAreas = createTensionAreas({ businessQuality, valuation });
  const tradeoffLandscape = createTradeoffLandscape({ businessQuality, valuation, reinforcementAreas, tensionAreas });
  const decisionFacts = createDecisionFacts({ businessQuality, valuation, reinforcementAreas, tensionAreas, tradeoffSummary: tradeoffLandscape });
  const aiInterpretation = createAiInterpretation({ reinforcementAreas, tensionAreas, tradeoffSummary: tradeoffLandscape });
  const investorJudgment = createInvestorJudgment();
  const evidenceConfidence = createEvidenceConfidence({
    confidence: tradeoffLandscape.evidenceConfidence,
    coverage: tradeoffLandscape.evidenceCoverage,
    rationale: 'Quality–Valuation Tradeoff consumes Business Quality and Valuation summaries to describe reinforcement and tension. It does not optimize the tradeoff or recommend action.',
    evidenceItems: ['business quality summary', 'valuation summary', 'reinforcement areas', 'tension areas'],
    missingEvidence: tradeoffLandscape.highPriorityGaps.map(gap => ({ label: gap, priority: 'High', status: 'missing', sourceCount: 0 }))
  });
  const sections = Object.freeze({
    qualityValuationTradeoffHeader: createHeader(),
    businessQualityContext: createBusinessQualityContext(businessQuality),
    valuationContext: createValuationContext(valuation),
    reinforcementAreas,
    tensionAreas,
    tradeoffLandscape,
    decisionFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    decisionSupportOnly: true,
    consumesUpstreamOutputsOnly: true,
    qualityValuationTradeoffOnly: true,
    noTradeoffOptimization: true,
    investorControlledDecision: true,
    noAutomatedDecision: true,
    noRecommendation: true,
    noDecision: true,
    noExecution: true,
    noBrokerIntegration: true,
    noOrderPlacement: true,
    noPortfolioMutation: true
  });
  const futureExtensions = Object.freeze(['tradeoff matrix visualization', 'source drill-through', 'quality valuation tension history']);

  return deepFreeze({
    type: 'quality-valuation-tradeoff',
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
      facts: decisionFacts.items,
      aiInterpretation,
      investorJudgment,
      evidenceConfidence,
      guardrails,
      sections,
      metadata: { workspace: FEATURE_META.workspace, status: FEATURE_META.status, futureExtensions },
      extensions: {
        decision: {
          decisionStage: 'QualityValuationTradeoff',
          qualityContext: sections.businessQualityContext,
          valuationContext: sections.valuationContext,
          reinforcementAreas: reinforcementAreas.items,
          tensionAreas: tensionAreas.items,
          tradeoffLandscape,
          analysisOnly: true
        }
      }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      explainsTradeoffWithoutOptimizing: true,
      consumesReleasedOutputsWithoutRecalculation: true,
      avoidsRecommendationsAndDecisionLogic: true,
      userCanUnderstand: Object.freeze(['business quality context', 'valuation context', 'areas of reinforcement', 'areas of tension', 'tradeoff summary']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultQualityValuationTradeoffInput() { return Object.freeze({}); }

function validateInputs({ businessQuality, valuation }) {
  if (businessQuality?.feature?.stableId !== 'CW-BQ-008') throw new Error('Quality–Valuation Tradeoff requires Business Quality Summary output');
  if (valuation?.feature?.stableId !== 'CW-VAL-007') throw new Error('Quality–Valuation Tradeoff requires Valuation Summary output');
}

function createHeader() { return Object.freeze({ component: 'QualityValuationTradeoffHeader', investorQuestion: FEATURE_META.investorQuestion, mode: 'tradeoff-analysis' }); }
function createBusinessQualityContext(businessQuality) { return Object.freeze({ component: 'TradeoffBusinessQualityContext', sourceFeatureId: businessQuality.feature.stableId, evidenceConfidence: businessQuality.evidenceConfidence.confidence, evidenceCoverage: businessQuality.evidenceConfidence.coverage, summary: businessQuality.sections.integratedQualityProfile.summary, sourceOnly: true }); }
function createValuationContext(valuation) { return Object.freeze({ component: 'TradeoffValuationContext', sourceFeatureId: valuation.feature.stableId, evidenceConfidence: valuation.evidenceConfidence.confidence, evidenceCoverage: valuation.evidenceConfidence.coverage, summary: valuation.sections.aiInterpretation.summary, sourceOnly: true }); }

function createReinforcementAreas({ businessQuality, valuation }) {
  return Object.freeze({ component: 'ReinforcementAreas', items: deepFreeze([
    { id: 'reinforce-repeat-purchase-value', sourceFeatureIds: ['CW-BQ-008', 'CW-VAL-002'], text: 'Repeat-purchase business characteristics can support valuation assumptions when supported by evidence.', strength: 'Medium' },
    { id: 'reinforce-analysis-coverage', sourceFeatureIds: ['CW-BQ-008', 'CW-VAL-007'], text: 'Both Business Quality and Valuation have completed v1.0 analytical coverage with explicit evidence gaps.', strength: 'Medium' },
    { id: 'reinforce-assumption-transparency', sourceFeatureIds: ['CW-VAL-002', 'CW-VAL-006'], text: 'Valuation assumptions and sensitivity drivers are explicit, making quality–valuation tradeoffs easier to inspect.', strength: 'Medium' }
  ]), sourceOnly: true });
}

function createTensionAreas({ businessQuality, valuation }) {
  return Object.freeze({ component: 'TensionAreas', items: deepFreeze([
    { id: 'tension-low-evidence-quality', sourceFeatureIds: ['CW-BQ-008'], text: 'Business Quality evidence confidence is low overall, especially governance, financial quality, and resilience.', severity: 'High' },
    { id: 'tension-valuation-evidence-gaps', sourceFeatureIds: ['CW-VAL-007'], text: 'Valuation evidence confidence is low overall because model artifacts and assumption support remain incomplete.', severity: 'High' },
    { id: 'tension-price-inside-range', sourceFeatureIds: ['CW-VAL-004'], text: 'Current price sits inside the estimated range, so the price/value comparison alone does not resolve the decision context.', severity: 'Medium' }
  ]), sourceOnly: true });
}

function createTradeoffLandscape({ businessQuality, valuation, reinforcementAreas, tensionAreas }) {
  const highTensionCount = tensionAreas.items.filter(item => item.severity === 'High').length;
  const evidenceCoverage = Math.round((businessQuality.evidenceConfidence.coverage + valuation.evidenceConfidence.coverage) / 2);
  return Object.freeze({
    component: 'TradeoffLandscape',
    summary: 'Business quality and valuation are both analytically covered, but evidence gaps create important tension. The tradeoff landscape is inspectable but not resolved by this feature.',
    reinforcementCount: reinforcementAreas.items.length,
    tensionCount: tensionAreas.items.length,
    highTensionCount,
    evidenceCoverage,
    evidenceConfidence: evidenceCoverage >= 70 ? 'Medium' : evidenceCoverage >= 40 ? 'Low' : 'Unknown',
    highPriorityGaps: Object.freeze([
      ...businessQuality.evidenceConfidence.missingEvidenceChecklist.filter(item => item.priority === 'High').slice(0, 2).map(item => `Business Quality: ${item.label}`),
      ...valuation.evidenceConfidence.missingEvidenceChecklist.filter(item => item.priority === 'High').slice(0, 2).map(item => `Valuation: ${item.label}`)
    ]),
    noTradeoffOptimization: true
  });
}

function createDecisionFacts({ businessQuality, valuation, reinforcementAreas, tensionAreas, tradeoffSummary }) { return Object.freeze({ component: 'QualityValuationTradeoffFacts', items: deepFreeze([
  { id: 'business-quality-source', kind: 'fact', source: 'upstream-output', value: businessQuality.feature.stableId },
  { id: 'valuation-source', kind: 'fact', source: 'upstream-output', value: valuation.feature.stableId },
  { id: 'reinforcement-count', kind: 'fact', source: 'quality-valuation-tradeoff', value: String(reinforcementAreas.items.length) },
  { id: 'tension-count', kind: 'fact', source: 'quality-valuation-tradeoff', value: String(tensionAreas.items.length) },
  { id: 'tradeoff-evidence-coverage', kind: 'fact', source: 'quality-valuation-tradeoff', value: `${tradeoffSummary.evidenceCoverage}%` }
]), factsOnly: true }); }
function createAiInterpretation({ reinforcementAreas, tensionAreas, tradeoffSummary }) { return Object.freeze({ component: 'QualityValuationTradeoffAIInterpretation', kind: 'generated_explanation', source: 'deterministic-product-summary', basedOn: ['CW-BQ-008', 'CW-VAL-007'], summary: `The quality–valuation tradeoff is mixed. There are ${reinforcementAreas.items.length} reinforcement areas and ${tensionAreas.items.length} tension areas. Evidence gaps mean the tradeoff can be inspected but should not be optimized or resolved by the system.`, caution: 'Generated tradeoff interpretation only. It does not optimize the tradeoff, recommend action, make a decision, execute orders, or mutate a portfolio.' }); }
function createInvestorJudgment() { return Object.freeze({ component: 'QualityValuationTradeoffInvestorJudgment', status: 'Tradeoff reviewed', note: 'Investor must decide how to weigh quality evidence against valuation evidence before considering decision options.', controlledBy: 'Investor', noAutomation: true }); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
