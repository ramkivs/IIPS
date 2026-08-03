import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';
import { createDecisionSnapshot } from './DecisionSnapshot.js';
import { createThesisVsEvidence } from './ThesisVsEvidence.js';
import { createQualityValuationTradeoff } from './QualityValuationTradeoff.js';
import { createDecisionOptions } from './DecisionOptions.js';
import { createDecisionRationale } from './DecisionRationale.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-ID-006',
  workspace: 'Company Workspace',
  epic: 'Investment Decision',
  featureId: 'ID.6',
  featureName: 'Decision Summary',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'What decision is supported by the available evidence?',
  purpose: 'Summarize the completed decision-support process and produce an investor-owned decision record without introducing new evidence, new analysis, recommendation, decision automation, or execution.'
});

export function createDecisionSummary({ decisionSnapshotFeature, thesisVsEvidenceFeature, tradeoffFeature, decisionOptionsFeature, decisionRationaleFeature } = {}) {
  const decisionSnapshot = decisionSnapshotFeature || createDecisionSnapshot();
  const thesisVsEvidence = thesisVsEvidenceFeature || createThesisVsEvidence();
  const tradeoff = tradeoffFeature || createQualityValuationTradeoff();
  const decisionOptions = decisionOptionsFeature || createDecisionOptions();
  const decisionRationale = decisionRationaleFeature || createDecisionRationale();
  validateInputs({ decisionSnapshot, thesisVsEvidence, tradeoff, decisionOptions, decisionRationale });

  const decisionContextSummary = createDecisionContextSummary(decisionSnapshot);
  const evidenceLandscapeSummary = createEvidenceLandscapeSummary(thesisVsEvidence);
  const tradeoffLandscapeSummary = createTradeoffLandscapeSummary(tradeoff);
  const selectedDecisionPath = createSelectedDecisionPath(decisionRationale);
  const decisionRationaleSummary = createDecisionRationaleSummary(decisionRationale);
  const outstandingQuestions = createOutstandingQuestions(decisionRationale);
  const decisionRecord = createDecisionRecord({ decisionSnapshot, thesisVsEvidence, tradeoff, decisionOptions, decisionRationale, selectedDecisionPath, decisionRationaleSummary, outstandingQuestions });
  const decisionFacts = createDecisionFacts({ decisionContextSummary, evidenceLandscapeSummary, tradeoffLandscapeSummary, selectedDecisionPath, decisionRecord });
  const aiInterpretation = createAiInterpretation({ selectedDecisionPath, evidenceLandscapeSummary, tradeoffLandscapeSummary, outstandingQuestions });
  const investorJudgment = createInvestorJudgment();
  const evidenceConfidence = createEvidenceConfidence({
    confidence: decisionRecord.evidenceContext.overallEvidenceConfidence,
    coverage: decisionRecord.evidenceContext.overallEvidenceCoverage,
    rationale: 'Decision Summary aggregates completed Investment Decision features into an investor-owned decision record. It introduces no new evidence and does not reinterpret upstream evidence confidence.',
    evidenceItems: decisionRecord.sourceFeatureIds,
    missingEvidence: outstandingQuestions.items.map(item => ({ label: item.text, priority: item.priority, status: 'missing', sourceCount: 0 }))
  });
  const sections = Object.freeze({
    decisionSummaryHeader: createHeader(),
    decisionContextSummary,
    evidenceLandscapeSummary,
    tradeoffLandscapeSummary,
    selectedDecisionPath,
    decisionRationaleSummary,
    outstandingQuestions,
    decisionRecord,
    decisionFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    decisionSupportOnly: true,
    consumesUpstreamOutputsOnly: true,
    decisionSummaryOnly: true,
    investorOwnedDecisionRecord: true,
    noNewAnalysis: true,
    noNewEvidence: true,
    noRecommendation: true,
    noDecisionAutomation: true,
    noExecution: true,
    noBrokerIntegration: true,
    noOrderPlacement: true,
    noPortfolioMutation: true
  });
  const futureExtensions = Object.freeze(['decision record export', 'decision record signing', 'decision version comparison', 'evidence version locking']);

  return deepFreeze({
    type: 'decision-summary',
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
          decisionStage: 'DecisionSummary',
          decisionContextSummary,
          evidenceLandscapeSummary,
          tradeoffLandscapeSummary,
          selectedDecisionPath,
          decisionRationaleSummary,
          decisionRecord,
          summaryOnly: true
        }
      }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      twoLayerSummaryAndRecord: true,
      investorOwnedDecisionRecord: true,
      noNewAnalysisOrEvidence: true,
      userCanUnderstand: Object.freeze(['decision context summary', 'evidence landscape summary', 'tradeoff landscape summary', 'selected decision path', 'decision rationale summary', 'outstanding questions', 'decision record']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultDecisionSummaryInput() { return Object.freeze({}); }

function validateInputs({ decisionSnapshot, thesisVsEvidence, tradeoff, decisionOptions, decisionRationale }) {
  if (decisionSnapshot?.feature?.stableId !== 'CW-ID-001') throw new Error('Decision Summary requires Decision Snapshot output');
  if (thesisVsEvidence?.feature?.stableId !== 'CW-ID-002') throw new Error('Decision Summary requires Thesis vs Evidence output');
  if (tradeoff?.feature?.stableId !== 'CW-ID-003') throw new Error('Decision Summary requires Quality-Valuation Tradeoff output');
  if (decisionOptions?.feature?.stableId !== 'CW-ID-004') throw new Error('Decision Summary requires Decision Options output');
  if (decisionRationale?.feature?.stableId !== 'CW-ID-005') throw new Error('Decision Summary requires Decision Rationale output');
}

function createHeader() { return Object.freeze({ component: 'DecisionSummaryHeader', investorQuestion: FEATURE_META.investorQuestion, mode: 'summary-and-record' }); }
function createDecisionContextSummary(decisionSnapshot) { return Object.freeze({ component: 'DecisionContextSummary', sourceFeatureId: decisionSnapshot.feature.stableId, upstreamOutputs: decisionSnapshot.sections.upstreamOutputs.items, evidenceConfidence: decisionSnapshot.evidenceConfidence.confidence, evidenceCoverage: decisionSnapshot.evidenceConfidence.coverage, sourceOnly: true }); }
function createEvidenceLandscapeSummary(thesisVsEvidence) { return Object.freeze({ component: 'EvidenceLandscapeSummary', sourceFeatureId: thesisVsEvidence.feature.stableId, landscapeRead: thesisVsEvidence.sections.evidenceLandscape.landscapeRead, supportCount: thesisVsEvidence.sections.evidenceLandscape.supportCount, contradictionCount: thesisVsEvidence.sections.evidenceLandscape.contradictionCount, highPriorityGapCount: thesisVsEvidence.sections.evidenceLandscape.highPriorityGapCount, sourceOnly: true }); }
function createTradeoffLandscapeSummary(tradeoff) { return Object.freeze({ component: 'TradeoffLandscapeSummary', sourceFeatureId: tradeoff.feature.stableId, reinforcementCount: tradeoff.sections.tradeoffLandscape.reinforcementCount, tensionCount: tradeoff.sections.tradeoffLandscape.tensionCount, highTensionCount: tradeoff.sections.tradeoffLandscape.highTensionCount, evidenceCoverage: tradeoff.sections.tradeoffLandscape.evidenceCoverage, sourceOnly: true }); }
function createSelectedDecisionPath(decisionRationale) { return Object.freeze({ component: 'SummarySelectedDecisionPath', ...decisionRationale.sections.selectedDecisionPath, sourceFeatureId: decisionRationale.feature.stableId, sourceOnly: true }); }
function createDecisionRationaleSummary(decisionRationale) { return Object.freeze({ component: 'DecisionRationaleSummary', sourceFeatureId: decisionRationale.feature.stableId, supportingReasonCount: decisionRationale.sections.supportingReasons.items.length, reservationCount: decisionRationale.sections.reservationsAndRisks.items.length, keyAssumptionCount: decisionRationale.sections.keyAssumptions.items.length, decisionBasis: decisionRationale.sections.decisionBasis.text, sourceOnly: true }); }
function createOutstandingQuestions(decisionRationale) { return Object.freeze({ component: 'SummaryOutstandingQuestions', sourceFeatureId: decisionRationale.feature.stableId, items: decisionRationale.sections.outstandingQuestions.items, sourceOnly: true }); }

function createDecisionRecord({ decisionSnapshot, thesisVsEvidence, tradeoff, decisionOptions, decisionRationale, selectedDecisionPath, decisionRationaleSummary, outstandingQuestions }) {
  const evidenceCoverages = [decisionSnapshot.evidenceConfidence.coverage, thesisVsEvidence.evidenceConfidence.coverage, tradeoff.evidenceConfidence.coverage, decisionOptions.evidenceConfidence.coverage, decisionRationale.evidenceConfidence.coverage];
  const overallEvidenceCoverage = Math.round(evidenceCoverages.reduce((sum, value) => sum + value, 0) / evidenceCoverages.length);
  return deepFreeze({
    component: 'DecisionRecord',
    recordId: 'DREC-CW-ID-001',
    recordVersion: '1.0',
    timestamp: '2026-07-23T00:00:00.000+05:30',
    investorOwned: true,
    immutable: true,
    selectedDecisionPath: selectedDecisionPath.optionId,
    selectedDecisionPathLabel: selectedDecisionPath.label,
    rationaleSnapshot: decisionRationaleSummary,
    outstandingQuestions: outstandingQuestions.items,
    sourceFeatureIds: [decisionSnapshot.feature.stableId, thesisVsEvidence.feature.stableId, tradeoff.feature.stableId, decisionOptions.feature.stableId, decisionRationale.feature.stableId],
    upstreamFeatureVersions: Object.freeze({
      overview: 'v1.0',
      businessQuality: 'v1.0',
      valuation: 'v1.0',
      investmentDecisionFeatures: 'CW-ID-001..CW-ID-005'
    }),
    evidenceContext: Object.freeze({
      overallEvidenceCoverage,
      overallEvidenceConfidence: overallEvidenceCoverage >= 85 ? 'High' : overallEvidenceCoverage >= 60 ? 'Medium' : overallEvidenceCoverage > 0 ? 'Low' : 'Unknown',
      sourceOnly: true
    }),
    noExecution: true,
    noBrokerIntegration: true,
    noPortfolioMutation: true
  });
}

function createDecisionFacts({ decisionContextSummary, evidenceLandscapeSummary, tradeoffLandscapeSummary, selectedDecisionPath, decisionRecord }) { return Object.freeze({ component: 'DecisionSummaryFacts', items: deepFreeze([
  { id: 'decision-record-id', kind: 'fact', source: 'decision-summary', value: decisionRecord.recordId },
  { id: 'selected-decision-path', kind: 'fact', source: 'decision-rationale', value: selectedDecisionPath.optionId },
  { id: 'evidence-landscape', kind: 'fact', source: 'thesis-vs-evidence', value: evidenceLandscapeSummary.landscapeRead },
  { id: 'tradeoff-tension-count', kind: 'fact', source: 'quality-valuation-tradeoff', value: String(tradeoffLandscapeSummary.tensionCount) },
  { id: 'record-evidence-coverage', kind: 'fact', source: 'decision-record', value: `${decisionRecord.evidenceContext.overallEvidenceCoverage}%` }
]), factsOnly: true }); }
function createAiInterpretation({ selectedDecisionPath, evidenceLandscapeSummary, tradeoffLandscapeSummary, outstandingQuestions }) { return Object.freeze({ component: 'DecisionSummaryAIInterpretation', kind: 'generated_explanation', source: 'deterministic-product-summary', basedOn: ['CW-ID-001', 'CW-ID-002', 'CW-ID-003', 'CW-ID-004', 'CW-ID-005'], summary: `Decision process record shows investor-selected path '${selectedDecisionPath.label}' with ${evidenceLandscapeSummary.landscapeRead.toLowerCase()}, ${tradeoffLandscapeSummary.tensionCount} tradeoff tension areas, and ${outstandingQuestions.items.length} outstanding questions. This is a record of the investor-controlled decision process, not a recommendation.`, caution: 'Generated decision summary interpretation only. It introduces no new evidence, no new analysis, no recommendation, no automated decision, no execution, no broker integration, and no portfolio mutation.' }); }
function createInvestorJudgment() { return Object.freeze({ component: 'DecisionSummaryInvestorJudgment', status: 'Decision record reviewed', note: 'Investor owns the final decision record and may revise rationale before acting outside the system.', controlledBy: 'Investor', noAutomation: true }); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
