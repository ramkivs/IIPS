import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';
import { createValuationSnapshot } from './ValuationSnapshot.js';
import { createIntrinsicValueDrivers } from './IntrinsicValueDrivers.js';
import { createScenarioValuation } from './ScenarioValuation.js';
import { createMarginOfSafety } from './MarginOfSafety.js';
import { createMarketExpectations } from './MarketExpectations.js';
import { createSensitivityAnalysis } from './SensitivityAnalysis.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-VAL-007',
  workspace: 'Company Workspace',
  epic: 'Valuation',
  featureId: 'VAL.7',
  featureName: 'Valuation Summary',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'What does the complete valuation analysis indicate?',
  purpose: 'Synthesize completed valuation analyses into a coherent valuation narrative without introducing new valuation calculations, recommendations, decisions, target prices, or portfolio actions.'
});

export function createValuationSummary({ features } = {}) {
  const sourceFeatures = Object.freeze(features || [
    createValuationSnapshot(),
    createIntrinsicValueDrivers(),
    createScenarioValuation(),
    createMarginOfSafety(),
    createMarketExpectations(),
    createSensitivityAnalysis()
  ]);
  validateSourceFeatures(sourceFeatures);

  const evidenceSummary = createEvidenceSummary(sourceFeatures);
  const valuationFacts = createValuationSummaryFacts(sourceFeatures, evidenceSummary);
  const aiInterpretation = createAiInterpretation(sourceFeatures, evidenceSummary);
  const investorJudgment = createInvestorJudgment();
  const evidenceConfidence = createEvidenceConfidence({
    confidence: evidenceSummary.overallEvidenceConfidence,
    coverage: evidenceSummary.overallCoverage,
    rationale: 'Valuation Summary aggregates evidence support from completed valuation features. It does not introduce new calculations or close evidence gaps.',
    evidenceItems: sourceFeatures.map(feature => feature.feature.stableId),
    missingEvidence: evidenceSummary.highPriorityGaps.map(gap => ({ label: gap, priority: 'High', status: 'missing', sourceCount: 0 }))
  });
  const sections = Object.freeze({
    valuationSummaryHeader: createHeader(),
    valuationOverview: createFeatureSummary(sourceFeatures[0]),
    intrinsicValueDriversSummary: createFeatureSummary(sourceFeatures[1]),
    scenarioSummary: createFeatureSummary(sourceFeatures[2]),
    marginOfSafetySummary: createFeatureSummary(sourceFeatures[3]),
    marketExpectationsSummary: createFeatureSummary(sourceFeatures[4]),
    sensitivitySummary: createFeatureSummary(sourceFeatures[5]),
    keyValuationInsights: createKeyValuationInsights(sourceFeatures),
    areasOfConfidence: createAreasOfConfidence(sourceFeatures),
    areasOfUncertainty: createAreasOfUncertainty(sourceFeatures, evidenceSummary),
    evidenceSummary,
    valuationFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    valuationOnly: true,
    valuationSummaryOnly: true,
    summaryOnly: true,
    noNewAnalysis: true,
    noNewCalculations: true,
    noRecommendation: true,
    noDecision: true,
    noExecution: true,
    noTargetPrice: true,
    noPositionSizing: true,
    noPortfolioAction: true
  });
  const futureExtensions = Object.freeze(['valuation feature drill-through', 'evidence gap prioritization', 'valuation release comparison']);

  return deepFreeze({
    type: 'valuation-summary',
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
          dimension: 'Valuation Summary',
          sourceFeatureIds: sourceFeatures.map(feature => feature.feature.stableId),
          evidenceSummary,
          synthesisOnly: true
        }
      }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      synthesisOnly: true,
      usesOnlyCompletedValuationFeatures: true,
      userCanUnderstand: Object.freeze(['valuation overview', 'key valuation insights', 'scenario summary', 'margin of safety summary', 'market expectations summary', 'sensitivity summary', 'areas of confidence', 'areas of uncertainty', 'evidence summary']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultValuationSummaryInput() {
  return Object.freeze({});
}

function validateSourceFeatures(features) {
  const expected = ['CW-VAL-001', 'CW-VAL-002', 'CW-VAL-003', 'CW-VAL-004', 'CW-VAL-005', 'CW-VAL-006'];
  const actual = features.map(feature => feature?.feature?.stableId);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Valuation Summary requires completed source features: ${expected.join(', ')}`);
}

function createHeader() {
  return Object.freeze({ component: 'ValuationSummaryHeader', investorQuestion: FEATURE_META.investorQuestion, source: 'completed-valuation-features' });
}

function createFeatureSummary(feature) {
  return Object.freeze({
    component: 'ValuationFeatureSummary',
    sourceFeatureId: feature.feature.stableId,
    sourceFeatureName: feature.feature.featureName,
    investorQuestion: feature.feature.investorQuestion,
    evidenceConfidence: feature.evidenceConfidence.confidence,
    evidenceCoverage: feature.evidenceConfidence.coverage,
    aiSummary: feature.sections.aiInterpretation.summary,
    investorJudgmentStatus: feature.sections.investorJudgment.status,
    sourceOnly: true
  });
}

function createKeyValuationInsights(features) {
  return Object.freeze({
    component: 'KeyValuationInsights',
    items: deepFreeze([
      { insight: 'Valuation range exists but depends heavily on assumption quality.', sourceFeatureIds: ['CW-VAL-001', 'CW-VAL-003'] },
      { insight: 'Growth, margins, reinvestment, cost of capital, and terminal assumptions remain the primary value drivers.', sourceFeatureIds: ['CW-VAL-002', 'CW-VAL-006'] },
      { insight: 'Current price is inside the provided estimated valuation range, but this is not a recommendation or target price.', sourceFeatureIds: ['CW-VAL-004'] },
      { insight: 'Current price appears closest to the base scenario assumptions, but no scenario is identified as correct.', sourceFeatureIds: ['CW-VAL-005'] }
    ]),
    sourceOnly: true
  });
}

function createAreasOfConfidence(features) {
  return Object.freeze({
    component: 'AreasOfConfidence',
    items: deepFreeze([
      { area: 'Feature boundary clarity', reason: 'All valuation features preserve no recommendation, no decision, and no execution guardrails.' },
      { area: 'Analytical coverage', reason: 'The epic covers orientation, drivers, scenarios, price/value comparison, market expectations, and sensitivity.' },
      { area: 'Evidence visibility', reason: 'Each valuation feature exposes Evidence Confidence and missing evidence.' }
    ]),
    sourceOnly: true
  });
}

function createAreasOfUncertainty(features, evidenceSummary) {
  return Object.freeze({
    component: 'AreasOfUncertainty',
    items: deepFreeze([
      { area: 'Valuation model artifacts', reason: 'DCF, scenario, reverse-valuation, and sensitivity model artifact links remain incomplete.' },
      { area: 'Assumption support', reason: 'Growth, margin, discount rate, terminal growth, and reinvestment assumptions need stronger evidence.' },
      { area: 'Market data provenance', reason: 'Source-linked market price, share count, and valuation range timestamps require improvement.' },
      { area: 'Overall evidence coverage', reason: evidenceSummary.overallCoverageLabel }
    ]),
    sourceOnly: true
  });
}

function createEvidenceSummary(features) {
  const items = features.map(feature => Object.freeze({
    featureId: feature.feature.stableId,
    featureName: feature.feature.featureName,
    confidence: feature.evidenceConfidence.confidence,
    coverage: feature.evidenceConfidence.coverage,
    missingEvidenceCount: feature.evidenceConfidence.missingEvidenceChecklist.length
  }));
  const overallCoverage = Math.round(items.reduce((sum, item) => sum + item.coverage, 0) / items.length);
  const lowConfidenceFeatures = items.filter(item => item.confidence === 'Low').map(item => item.featureId);
  const highPriorityGaps = features.flatMap(feature => feature.evidenceConfidence.missingEvidenceChecklist
    .filter(item => item.priority === 'High')
    .map(item => `${feature.feature.stableId}: ${item.label}`));
  return deepFreeze({
    component: 'ValuationEvidenceSummary',
    items,
    overallCoverage,
    overallCoverageLabel: `Overall Evidence Coverage: ${overallCoverage}%`,
    overallEvidenceConfidence: overallCoverage >= 85 ? 'High' : overallCoverage >= 60 ? 'Medium' : overallCoverage > 0 ? 'Low' : 'Unknown',
    lowConfidenceFeatures,
    highPriorityGaps,
    sourceOnly: true
  });
}

function createValuationSummaryFacts(features, evidenceSummary) {
  return Object.freeze({
    component: 'ValuationSummaryFacts',
    items: deepFreeze([
      { id: 'source-features', kind: 'fact', source: 'valuation-summary', value: features.map(feature => feature.feature.stableId).join(', ') },
      { id: 'overall-evidence-coverage', kind: 'fact', source: 'valuation-evidence-summary', value: `${evidenceSummary.overallCoverage}%` },
      { id: 'overall-evidence-confidence', kind: 'fact', source: 'valuation-evidence-summary', value: evidenceSummary.overallEvidenceConfidence },
      { id: 'low-confidence-features', kind: 'fact', source: 'valuation-evidence-summary', value: evidenceSummary.lowConfidenceFeatures.join(', ') || 'None' }
    ]),
    factsOnly: true
  });
}

function createAiInterpretation(features, evidenceSummary) {
  return Object.freeze({
    component: 'ValuationSummaryAIInterpretation',
    kind: 'generated_explanation',
    source: 'deterministic-product-summary',
    basedOn: features.map(feature => feature.feature.stableId),
    summary: `Valuation synthesis uses only completed valuation features. The current valuation view has ${evidenceSummary.overallCoverage}% evidence coverage and no low-confidence valuation features, but model artifacts and assumption support remain important evidence gaps.`,
    caution: 'Generated valuation synthesis only. It introduces no new analysis, no new calculations, no target price, no recommendation, no decision, no position sizing, and no execution.'
  });
}

function createInvestorJudgment() {
  return Object.freeze({ component: 'ValuationSummaryInvestorJudgment', status: 'Synthesis reviewed', note: 'Investor must decide whether the valuation evidence is sufficient. This summary does not recommend action or make a decision.', controlledBy: 'Investor', noAutomation: true });
}

function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
