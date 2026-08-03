import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';
import { createBusinessSnapshot } from './BusinessSnapshot.js';
import { createBusinessQualitySummary } from './BusinessQualitySummary.js';
import { createValuationSummary } from './ValuationSummary.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-ID-001',
  workspace: 'Company Workspace',
  epic: 'Investment Decision',
  featureId: 'ID.1',
  featureName: 'Decision Snapshot',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'What is the current decision context?',
  purpose: 'Orient the investor by consolidating released Overview, Business Quality, and Valuation outputs without recomputation, evaluation, recommendation, or decision automation.'
});

export function createDecisionSnapshot({ overviewFeature, businessQualityFeature, valuationFeature } = {}) {
  const overview = overviewFeature || createBusinessSnapshot();
  const businessQuality = businessQualityFeature || createBusinessQualitySummary();
  const valuation = valuationFeature || createValuationSummary();
  validateInputs({ overview, businessQuality, valuation });

  const upstreamEvidence = createUpstreamEvidence({ overview, businessQuality, valuation });
  const decisionFacts = createDecisionFacts({ overview, businessQuality, valuation, upstreamEvidence });
  const aiInterpretation = createAiInterpretation({ overview, businessQuality, valuation, upstreamEvidence });
  const investorJudgment = createInvestorJudgment();
  const evidenceConfidence = createEvidenceConfidence({
    confidence: upstreamEvidence.overallEvidenceConfidence,
    coverage: upstreamEvidence.overallCoverage,
    rationale: 'Decision Snapshot consolidates evidence confidence from released upstream outputs. It does not reinterpret evidence, recompute analysis, or change evidence confidence semantics.',
    evidenceItems: ['overview output', 'business quality output', 'valuation output'],
    missingEvidence: upstreamEvidence.highPriorityGaps.map(gap => ({ label: gap, priority: 'High', status: 'missing', sourceCount: 0 }))
  });
  const sections = Object.freeze({
    decisionSnapshotHeader: createHeader(),
    upstreamOutputs: createUpstreamOutputs({ overview, businessQuality, valuation }),
    overviewContext: createOverviewContext(overview),
    businessQualityContext: createBusinessQualityContext(businessQuality),
    valuationContext: createValuationContext(valuation),
    evidenceConfidenceContext: upstreamEvidence,
    decisionFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    decisionSupportOnly: true,
    consumesUpstreamOutputsOnly: true,
    investorControlledDecision: true,
    noAutomatedDecision: true,
    noExecution: true,
    noBrokerIntegration: true,
    noOrderPlacement: true,
    noPortfolioMutation: true,
    noRecommendation: true,
    noDecisionLogic: true,
    noAlternativeComparison: true
  });
  const futureExtensions = Object.freeze(['decision context source links', 'upstream freshness indicators', 'decision readiness checklist']);

  return deepFreeze({
    type: 'decision-snapshot',
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
          decisionStage: 'Snapshot',
          consumedOutputIds: [overview.feature.stableId, businessQuality.feature.stableId, valuation.feature.stableId],
          consumesUpstreamOutputsOnly: true,
          orientationOnly: true
        }
      }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      descriptiveNotEvaluative: true,
      consumesReleasedOutputsWithoutRecalculation: true,
      avoidsRecommendationsComparisonsAndDecisionLogic: true,
      userCanUnderstand: Object.freeze(['overview context', 'business quality context', 'valuation context', 'upstream evidence confidence', 'current decision context']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultDecisionSnapshotInput() { return Object.freeze({}); }

function validateInputs({ overview, businessQuality, valuation }) {
  if (!overview?.feature?.stableId?.startsWith('CW-OV-')) throw new Error('Decision Snapshot requires a released Overview output');
  if (businessQuality?.feature?.stableId !== 'CW-BQ-008') throw new Error('Decision Snapshot requires Business Quality Summary output');
  if (valuation?.feature?.stableId !== 'CW-VAL-007') throw new Error('Decision Snapshot requires Valuation Summary output');
}

function createHeader() { return Object.freeze({ component: 'DecisionSnapshotHeader', investorQuestion: FEATURE_META.investorQuestion, mode: 'orientation' }); }
function createUpstreamOutputs({ overview, businessQuality, valuation }) { return Object.freeze({ component: 'UpstreamOutputs', items: Object.freeze([
  { epic: 'Overview', featureId: overview.feature.stableId, featureName: overview.feature.featureName, role: 'Understand the business' },
  { epic: 'Business Quality', featureId: businessQuality.feature.stableId, featureName: businessQuality.feature.featureName, role: 'Assess the business' },
  { epic: 'Valuation', featureId: valuation.feature.stableId, featureName: valuation.feature.featureName, role: 'Estimate and explain worth' }
]), consumesOnly: true }); }
function createOverviewContext(overview) { return Object.freeze({ component: 'OverviewContext', sourceFeatureId: overview.feature.stableId, title: overview.feature.featureName, investorQuestion: overview.feature.investorQuestion, evidenceConfidence: overview.evidenceConfidence.confidence, evidenceCoverage: overview.evidenceConfidence.coverage, sourceOnly: true }); }
function createBusinessQualityContext(businessQuality) { return Object.freeze({ component: 'BusinessQualityContext', sourceFeatureId: businessQuality.feature.stableId, evidenceConfidence: businessQuality.evidenceConfidence.confidence, evidenceCoverage: businessQuality.evidenceConfidence.coverage, summary: businessQuality.sections.integratedQualityProfile.summary, sourceOnly: true }); }
function createValuationContext(valuation) { return Object.freeze({ component: 'ValuationContext', sourceFeatureId: valuation.feature.stableId, evidenceConfidence: valuation.evidenceConfidence.confidence, evidenceCoverage: valuation.evidenceConfidence.coverage, summary: valuation.sections.aiInterpretation.summary, sourceOnly: true }); }
function createUpstreamEvidence({ overview, businessQuality, valuation }) { const features = [overview, businessQuality, valuation]; const items = features.map(feature => Object.freeze({ featureId: feature.feature.stableId, confidence: feature.evidenceConfidence.confidence, coverage: feature.evidenceConfidence.coverage })); const overallCoverage = Math.round(items.reduce((sum, item) => sum + item.coverage, 0) / items.length); return deepFreeze({ component: 'DecisionSnapshotEvidenceContext', items, overallCoverage, overallEvidenceConfidence: overallCoverage >= 85 ? 'High' : overallCoverage >= 60 ? 'Medium' : overallCoverage > 0 ? 'Low' : 'Unknown', highPriorityGaps: features.flatMap(feature => feature.evidenceConfidence.missingEvidenceChecklist.filter(item => item.priority === 'High').map(item => `${feature.feature.stableId}: ${item.label}`)), sourceOnly: true }); }
function createDecisionFacts({ overview, businessQuality, valuation, upstreamEvidence }) { return Object.freeze({ component: 'DecisionSnapshotFacts', items: deepFreeze([
  { id: 'overview-source', kind: 'fact', source: 'upstream-output', value: overview.feature.stableId },
  { id: 'business-quality-source', kind: 'fact', source: 'upstream-output', value: businessQuality.feature.stableId },
  { id: 'valuation-source', kind: 'fact', source: 'upstream-output', value: valuation.feature.stableId },
  { id: 'upstream-evidence-coverage', kind: 'fact', source: 'upstream-evidence-context', value: `${upstreamEvidence.overallCoverage}%` },
  { id: 'upstream-evidence-confidence', kind: 'fact', source: 'upstream-evidence-context', value: upstreamEvidence.overallEvidenceConfidence }
]), factsOnly: true }); }
function createAiInterpretation({ overview, businessQuality, valuation, upstreamEvidence }) { return Object.freeze({ component: 'DecisionSnapshotAIInterpretation', kind: 'generated_explanation', source: 'deterministic-product-summary', basedOn: [overview.feature.stableId, businessQuality.feature.stableId, valuation.feature.stableId], summary: `Decision context is assembled from released Overview, Business Quality, and Valuation outputs. Upstream evidence coverage is ${upstreamEvidence.overallCoverage}% with ${upstreamEvidence.overallEvidenceConfidence.toLowerCase()} evidence confidence. This snapshot orients the investor but does not evaluate alternatives or recommend a decision.`, caution: 'Generated decision-context interpretation only. It does not recompute upstream outputs, compare decision options, recommend action, automate a decision, mutate a portfolio, or execute anything.' }); }
function createInvestorJudgment() { return Object.freeze({ component: 'DecisionSnapshotInvestorJudgment', status: 'Decision context reviewed', note: 'Investor should use this snapshot as orientation before evaluating thesis, trade-offs, options, and rationale.', controlledBy: 'Investor', noAutomation: true }); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
