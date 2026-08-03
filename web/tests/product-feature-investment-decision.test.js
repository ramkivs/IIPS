import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDecisionSnapshot,
  getDefaultDecisionSnapshotInput,
  createThesisVsEvidence,
  getDefaultThesisVsEvidenceInput,
  createQualityValuationTradeoff,
  getDefaultQualityValuationTradeoffInput,
  createDecisionOptions,
  getDefaultDecisionOptionsInput,
  createDecisionRationale,
  getDefaultDecisionRationaleInput,
  createDecisionSummary,
  getDefaultDecisionSummaryInput
} from '../src/workspaces/index.js';

test('CW-ID-001 Decision Snapshot orients investor to current decision context', () => {
  const snapshot = createDecisionSnapshot(getDefaultDecisionSnapshotInput());

  assert.equal(snapshot.type, 'decision-snapshot');
  assert.equal(snapshot.feature.stableId, 'CW-ID-001');
  assert.equal(snapshot.feature.status, 'Released');
  assert.equal(snapshot.feature.version, '1.0');
  assert.equal(snapshot.feature.investorQuestion, 'What is the current decision context?');
  assert.equal(snapshot.acceptance.descriptiveNotEvaluative, true);
  assert.deepEqual(snapshot.acceptance.userCanUnderstand, [
    'overview context',
    'business quality context',
    'valuation context',
    'upstream evidence confidence',
    'current decision context'
  ]);
});

test('CW-ID-001 consumes released upstream outputs without recomputation', () => {
  const snapshot = createDecisionSnapshot();

  assert.equal(snapshot.sections.upstreamOutputs.consumesOnly, true);
  assert.deepEqual(snapshot.sections.upstreamOutputs.items.map(item => item.epic), ['Overview', 'Business Quality', 'Valuation']);
  assert.equal(snapshot.sections.overviewContext.sourceOnly, true);
  assert.equal(snapshot.sections.businessQualityContext.sourceOnly, true);
  assert.equal(snapshot.sections.valuationContext.sourceOnly, true);
  assert.equal(snapshot.acceptance.consumesReleasedOutputsWithoutRecalculation, true);
});

test('CW-ID-001 uses canonical FeatureView with decision context extension data', () => {
  const snapshot = createDecisionSnapshot();
  const view = snapshot.featureView;

  assert.equal(view.contract, 'FeatureView');
  assert.equal(view.id, 'CW-ID-001');
  assert.equal(view.epic, 'Investment Decision');
  assert.equal(view.feature, 'ID.1');
  assert.equal(view.version, '1.0');
  assert.equal(view.extensions.decision.decisionStage, 'Snapshot');
  assert.equal(view.extensions.decision.consumesUpstreamOutputsOnly, true);
  assert.equal(view.extensions.decision.orientationOnly, true);
  assert.deepEqual(view.extensions.decision.consumedOutputIds, ['CW-OV-001', 'CW-BQ-008', 'CW-VAL-007']);
  assert.equal(view.extensions.portfolio, undefined);
});

test('CW-ID-001 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const snapshot = createDecisionSnapshot();

  assert.equal(snapshot.sections.decisionFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(snapshot.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(snapshot.sections.aiInterpretation.caution.includes('does not recompute upstream outputs'), true);
  assert.equal(snapshot.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(snapshot.sections.investorJudgment.noAutomation, true);
  assert.equal(snapshot.evidenceConfidence.notInvestmentConfidence, true);
});

test('CW-ID-001 guardrails prevent evaluation, recommendations, automated decisions, execution, broker integration, and portfolio mutation', () => {
  const snapshot = createDecisionSnapshot();
  const serialized = JSON.stringify(snapshot).toLowerCase();

  assert.equal(snapshot.boundaries.decisionSupportOnly, true);
  assert.equal(snapshot.boundaries.consumesUpstreamOutputsOnly, true);
  assert.equal(snapshot.boundaries.investorControlledDecision, true);
  assert.equal(snapshot.boundaries.noAutomatedDecision, true);
  assert.equal(snapshot.boundaries.noExecution, true);
  assert.equal(snapshot.boundaries.noBrokerIntegration, true);
  assert.equal(snapshot.boundaries.noOrderPlacement, true);
  assert.equal(snapshot.boundaries.noPortfolioMutation, true);
  assert.equal(snapshot.boundaries.noRecommendation, true);
  assert.equal(snapshot.boundaries.noDecisionLogic, true);
  assert.equal(snapshot.boundaries.noAlternativeComparison, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'place order', 'broker connector', 'automated decision']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('CW-ID-002 Thesis vs Evidence compares thesis with supporting and contradicting evidence', () => {
  const feature = createThesisVsEvidence(getDefaultThesisVsEvidenceInput());

  assert.equal(feature.type, 'thesis-vs-evidence');
  assert.equal(feature.feature.stableId, 'CW-ID-002');
  assert.equal(feature.feature.status, 'Released');
  assert.equal(feature.feature.version, '1.0');
  assert.equal(feature.feature.investorQuestion, 'Does the available evidence support the investment thesis?');
  assert.equal(feature.acceptance.comparesThesisWithEvidence, true);
  assert.equal(feature.acceptance.doesNotValidateThesis, true);
  assert.deepEqual(feature.acceptance.userCanUnderstand, [
    'investment thesis',
    'supporting evidence',
    'contradicting evidence',
    'evidence gaps',
    'overall evidence alignment'
  ]);
});

test('CW-ID-002 consumes upstream thesis, business quality, and valuation outputs only', () => {
  const feature = createThesisVsEvidence();

  assert.equal(feature.sections.investmentThesis.sourceFeatureId, 'CW-OV-002');
  assert.equal(feature.sections.supportingEvidence.sourceOnly, true);
  assert.equal(feature.sections.contradictingEvidence.sourceOnly, true);
  assert.equal(feature.sections.evidenceGaps.sourceOnly, true);
  assert.equal(feature.sections.supportingEvidence.items.length, 3);
  assert.equal(feature.sections.contradictingEvidence.items.length, 3);
  assert.equal(feature.sections.evidenceGaps.items.length, 6);
});

test('CW-ID-002 exposes evidence landscape without validating thesis', () => {
  const feature = createThesisVsEvidence();
  const landscape = feature.sections.evidenceLandscape;

  assert.equal(landscape.component, 'EvidenceLandscape');
  assert.equal(landscape.landscapeRead, 'Mixed evidence landscape');
  assert.equal(landscape.supportCount, 3);
  assert.equal(landscape.contradictionCount, 3);
  assert.equal(landscape.noThesisValidation, true);
  assert.equal(landscape.noPassFail, true);
});

test('CW-ID-002 uses canonical FeatureView with decision extension data', () => {
  const feature = createThesisVsEvidence();
  const view = feature.featureView;

  assert.equal(view.contract, 'FeatureView');
  assert.equal(view.id, 'CW-ID-002');
  assert.equal(view.epic, 'Investment Decision');
  assert.equal(view.feature, 'ID.2');
  assert.equal(view.version, '1.0');
  assert.equal(view.extensions.decision.decisionStage, 'ThesisVsEvidence');
  assert.equal(view.extensions.decision.analysisOnly, true);
  assert.equal(view.extensions.decision.supportingEvidence.length, 3);
  assert.equal(view.extensions.decision.contradictingEvidence.length, 3);
  assert.equal(view.extensions.decision.evidenceGaps.length, 6);
});

test('CW-ID-002 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const feature = createThesisVsEvidence();

  assert.equal(feature.sections.decisionFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(feature.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(feature.sections.aiInterpretation.caution.includes('does not validate the thesis'), true);
  assert.equal(feature.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(feature.sections.investorJudgment.noAutomation, true);
  assert.equal(feature.evidenceConfidence.notInvestmentConfidence, true);
});

test('CW-ID-002 guardrails prevent thesis validation, recommendation, decision, execution, broker integration, and portfolio mutation', () => {
  const feature = createThesisVsEvidence();
  const serialized = JSON.stringify(feature).toLowerCase();

  assert.equal(feature.boundaries.decisionSupportOnly, true);
  assert.equal(feature.boundaries.consumesUpstreamOutputsOnly, true);
  assert.equal(feature.boundaries.thesisEvidenceOnly, true);
  assert.equal(feature.boundaries.noThesisValidation, true);
  assert.equal(feature.boundaries.investorControlledDecision, true);
  assert.equal(feature.boundaries.noAutomatedDecision, true);
  assert.equal(feature.boundaries.noRecommendation, true);
  assert.equal(feature.boundaries.noDecision, true);
  assert.equal(feature.boundaries.noExecution, true);
  assert.equal(feature.boundaries.noBrokerIntegration, true);
  assert.equal(feature.boundaries.noOrderPlacement, true);
  assert.equal(feature.boundaries.noPortfolioMutation, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'place order', 'broker connector']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('CW-ID-003 Quality-Valuation Tradeoff integrates quality and valuation without optimizing', () => {
  const feature = createQualityValuationTradeoff(getDefaultQualityValuationTradeoffInput());

  assert.equal(feature.type, 'quality-valuation-tradeoff');
  assert.equal(feature.feature.stableId, 'CW-ID-003');
  assert.equal(feature.feature.status, 'Released');
  assert.equal(feature.feature.version, '1.0');
  assert.equal(feature.feature.investorQuestion, 'Is the quality worth the valuation?');
  assert.equal(feature.acceptance.explainsTradeoffWithoutOptimizing, true);
  assert.deepEqual(feature.acceptance.userCanUnderstand, [
    'business quality context',
    'valuation context',
    'areas of reinforcement',
    'areas of tension',
    'tradeoff summary'
  ]);
});

test('CW-ID-003 consumes Business Quality and Valuation summaries without recomputation', () => {
  const feature = createQualityValuationTradeoff();

  assert.equal(feature.sections.businessQualityContext.sourceFeatureId, 'CW-BQ-008');
  assert.equal(feature.sections.valuationContext.sourceFeatureId, 'CW-VAL-007');
  assert.equal(feature.sections.businessQualityContext.sourceOnly, true);
  assert.equal(feature.sections.valuationContext.sourceOnly, true);
  assert.equal(feature.acceptance.consumesReleasedOutputsWithoutRecalculation, true);
});

test('CW-ID-003 exposes reinforcement areas, tension areas, and tradeoff landscape', () => {
  const feature = createQualityValuationTradeoff();

  assert.equal(feature.sections.reinforcementAreas.sourceOnly, true);
  assert.equal(feature.sections.tensionAreas.sourceOnly, true);
  assert.equal(feature.sections.reinforcementAreas.items.length, 3);
  assert.equal(feature.sections.tensionAreas.items.length, 3);
  assert.equal(feature.sections.tradeoffLandscape.component, 'TradeoffLandscape');
  assert.equal(feature.sections.tradeoffLandscape.noTradeoffOptimization, true);
  assert.equal(feature.sections.tradeoffLandscape.highTensionCount, 2);
});

test('CW-ID-003 uses canonical FeatureView with decision tradeoff extension data', () => {
  const feature = createQualityValuationTradeoff();
  const view = feature.featureView;

  assert.equal(view.contract, 'FeatureView');
  assert.equal(view.id, 'CW-ID-003');
  assert.equal(view.epic, 'Investment Decision');
  assert.equal(view.feature, 'ID.3');
  assert.equal(view.version, '1.0');
  assert.equal(view.extensions.decision.decisionStage, 'QualityValuationTradeoff');
  assert.equal(view.extensions.decision.analysisOnly, true);
  assert.equal(view.extensions.decision.reinforcementAreas.length, 3);
  assert.equal(view.extensions.decision.tensionAreas.length, 3);
  assert.equal(view.extensions.decision.tradeoffLandscape.component, 'TradeoffLandscape');
});

test('CW-ID-003 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const feature = createQualityValuationTradeoff();

  assert.equal(feature.sections.decisionFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(feature.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(feature.sections.aiInterpretation.caution.includes('does not optimize the tradeoff'), true);
  assert.equal(feature.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(feature.sections.investorJudgment.noAutomation, true);
  assert.equal(feature.evidenceConfidence.notInvestmentConfidence, true);
});

test('CW-ID-003 guardrails prevent tradeoff optimization, recommendation, decision, execution, broker integration, and portfolio mutation', () => {
  const feature = createQualityValuationTradeoff();
  const serialized = JSON.stringify(feature).toLowerCase();

  assert.equal(feature.boundaries.decisionSupportOnly, true);
  assert.equal(feature.boundaries.consumesUpstreamOutputsOnly, true);
  assert.equal(feature.boundaries.qualityValuationTradeoffOnly, true);
  assert.equal(feature.boundaries.noTradeoffOptimization, true);
  assert.equal(feature.boundaries.investorControlledDecision, true);
  assert.equal(feature.boundaries.noAutomatedDecision, true);
  assert.equal(feature.boundaries.noRecommendation, true);
  assert.equal(feature.boundaries.noDecision, true);
  assert.equal(feature.boundaries.noExecution, true);
  assert.equal(feature.boundaries.noBrokerIntegration, true);
  assert.equal(feature.boundaries.noOrderPlacement, true);
  assert.equal(feature.boundaries.noPortfolioMutation, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'place order', 'broker connector']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('CW-ID-004 Decision Options presents investor-controlled options without ranking or preference', () => {
  const feature = createDecisionOptions(getDefaultDecisionOptionsInput());

  assert.equal(feature.type, 'decision-options');
  assert.equal(feature.feature.stableId, 'CW-ID-004');
  assert.equal(feature.feature.status, 'Released');
  assert.equal(feature.feature.version, '1.0');
  assert.equal(feature.feature.investorQuestion, 'What decision paths are available?');
  assert.equal(feature.acceptance.enumeratesOptionsWithoutRanking, true);
  assert.deepEqual(feature.acceptance.userCanUnderstand, [
    'current decision context',
    'available decision options',
    'supporting considerations',
    'limiting considerations',
    'open questions',
    'option comparison matrix'
  ]);
});

test('CW-ID-004 exposes available options and descriptive option comparison matrix', () => {
  const feature = createDecisionOptions();

  assert.equal(feature.sections.availableDecisionOptions.component, 'AvailableDecisionPaths');
  assert.equal(feature.sections.availableDecisionOptions.noRanking, true);
  assert.equal(feature.sections.availableDecisionOptions.noPreferredOption, true);
  assert.deepEqual(feature.sections.availableDecisionOptions.items.map(item => item.optionId), [
    'continue-research',
    'consider-entry',
    'wait',
    'avoid'
  ]);
  assert.equal(feature.sections.optionComparisonMatrix.component, 'DecisionPathComparison');
  assert.equal(feature.sections.optionComparisonMatrix.noRanking, true);
  assert.equal(feature.sections.optionComparisonMatrix.noPreferredOption, true);
  assert.equal(feature.sections.optionComparisonMatrix.items.length, 4);
});

test('CW-ID-004 consumes prior decision features and preserves source-only considerations', () => {
  const feature = createDecisionOptions();

  assert.equal(feature.sections.currentDecisionContext.sourceFeatureId, 'CW-ID-001');
  assert.equal(feature.sections.supportingConsiderations.sourceOnly, true);
  assert.equal(feature.sections.limitingConsiderations.sourceOnly, true);
  assert.equal(feature.sections.openQuestions.sourceOnly, true);
  assert.equal(feature.sections.supportingConsiderations.items.length, 3);
  assert.equal(feature.sections.limitingConsiderations.items.length, 3);
  assert.equal(feature.sections.openQuestions.items.length, 4);
});

test('CW-ID-004 uses canonical FeatureView with decision option extension data', () => {
  const feature = createDecisionOptions();
  const view = feature.featureView;

  assert.equal(view.contract, 'FeatureView');
  assert.equal(view.id, 'CW-ID-004');
  assert.equal(view.epic, 'Investment Decision');
  assert.equal(view.feature, 'ID.4');
  assert.equal(view.version, '1.0');
  assert.equal(view.extensions.decision.decisionStage, 'DecisionOptions');
  assert.equal(view.extensions.decision.analysisOnly, true);
  assert.equal(view.extensions.decision.decisionOptions.length, 4);
  assert.equal(view.extensions.decision.optionComparison.noPreferredOption, true);
});

test('CW-ID-004 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const feature = createDecisionOptions();

  assert.equal(feature.sections.decisionFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(feature.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(feature.sections.aiInterpretation.caution.includes('does not rank options'), true);
  assert.equal(feature.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(feature.sections.investorJudgment.noAutomation, true);
  assert.equal(feature.evidenceConfidence.notInvestmentConfidence, true);
});

test('CW-ID-004 guardrails prevent option ranking, preferred option, recommendation, decision, execution, broker integration, and portfolio mutation', () => {
  const feature = createDecisionOptions();
  const serialized = JSON.stringify(feature).toLowerCase();

  assert.equal(feature.boundaries.decisionSupportOnly, true);
  assert.equal(feature.boundaries.consumesUpstreamOutputsOnly, true);
  assert.equal(feature.boundaries.decisionOptionsOnly, true);
  assert.equal(feature.boundaries.noOptionRanking, true);
  assert.equal(feature.boundaries.noPreferredOption, true);
  assert.equal(feature.boundaries.investorControlledDecision, true);
  assert.equal(feature.boundaries.noAutomatedDecision, true);
  assert.equal(feature.boundaries.noRecommendation, true);
  assert.equal(feature.boundaries.noDecision, true);
  assert.equal(feature.boundaries.noExecution, true);
  assert.equal(feature.boundaries.noBrokerIntegration, true);
  assert.equal(feature.boundaries.noOrderPlacement, true);
  assert.equal(feature.boundaries.noPortfolioMutation, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'place order', 'broker connector']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('CW-ID-005 Decision Rationale captures investor-owned reasoning for a selected path', () => {
  const feature = createDecisionRationale(getDefaultDecisionRationaleInput());

  assert.equal(feature.type, 'decision-rationale');
  assert.equal(feature.feature.stableId, 'CW-ID-005');
  assert.equal(feature.feature.status, 'Released');
  assert.equal(feature.feature.version, '1.0');
  assert.equal(feature.feature.investorQuestion, 'Why would I choose one path over another?');
  assert.equal(feature.acceptance.investorOwnedRationale, true);
  assert.deepEqual(feature.acceptance.userCanUnderstand, [
    'selected decision path',
    'supporting reasons',
    'reservations and risks',
    'key assumptions',
    'outstanding questions',
    'decision basis'
  ]);
});

test('CW-ID-005 exposes selected path, reasons, reservations, assumptions, questions, and basis', () => {
  const feature = createDecisionRationale();

  assert.equal(feature.sections.selectedDecisionPath.investorSelected, true);
  assert.equal(feature.sections.selectedDecisionPath.optionId, 'continue-research');
  assert.equal(feature.sections.supportingReasons.items.length, 2);
  assert.equal(feature.sections.reservationsAndRisks.items.length, 2);
  assert.equal(feature.sections.keyAssumptions.items.length, 2);
  assert.equal(feature.sections.outstandingQuestions.items.length, 3);
  assert.equal(feature.sections.decisionBasis.investorOwned, true);
  assert.equal(feature.sections.decisionBasis.noAutomation, true);
});

test('CW-ID-005 uses canonical FeatureView with decision rationale extension data', () => {
  const feature = createDecisionRationale();
  const view = feature.featureView;

  assert.equal(view.contract, 'FeatureView');
  assert.equal(view.id, 'CW-ID-005');
  assert.equal(view.epic, 'Investment Decision');
  assert.equal(view.feature, 'ID.5');
  assert.equal(view.version, '1.0');
  assert.equal(view.extensions.decision.decisionStage, 'DecisionRationale');
  assert.equal(view.extensions.decision.selectedDecisionPath.optionId, 'continue-research');
  assert.equal(view.extensions.decision.supportingReasons.length, 2);
  assert.equal(view.extensions.decision.reservations.length, 2);
  assert.equal(view.extensions.decision.analysisOnly, true);
});

test('CW-ID-005 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const feature = createDecisionRationale();

  assert.equal(feature.sections.decisionFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(feature.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(feature.sections.aiInterpretation.caution.includes('does not score the rationale'), true);
  assert.equal(feature.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(feature.sections.investorJudgment.noAutomation, true);
  assert.equal(feature.evidenceConfidence.notInvestmentConfidence, true);
});

test('CW-ID-005 guardrails prevent rationale scoring, recommendation, decision, execution, broker integration, and portfolio mutation', () => {
  const feature = createDecisionRationale();
  const serialized = JSON.stringify(feature).toLowerCase();

  assert.equal(feature.boundaries.decisionSupportOnly, true);
  assert.equal(feature.boundaries.consumesUpstreamOutputsOnly, true);
  assert.equal(feature.boundaries.decisionRationaleOnly, true);
  assert.equal(feature.boundaries.investorOwnedRationale, true);
  assert.equal(feature.boundaries.noRationaleScoring, true);
  assert.equal(feature.boundaries.investorControlledDecision, true);
  assert.equal(feature.boundaries.noAutomatedDecision, true);
  assert.equal(feature.boundaries.noRecommendation, true);
  assert.equal(feature.boundaries.noDecision, true);
  assert.equal(feature.boundaries.noExecution, true);
  assert.equal(feature.boundaries.noBrokerIntegration, true);
  assert.equal(feature.boundaries.noOrderPlacement, true);
  assert.equal(feature.boundaries.noPortfolioMutation, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'place order', 'broker connector']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('CW-ID-006 Decision Summary creates synthesis and investor-owned decision record', () => {
  const feature = createDecisionSummary(getDefaultDecisionSummaryInput());

  assert.equal(feature.type, 'decision-summary');
  assert.equal(feature.feature.stableId, 'CW-ID-006');
  assert.equal(feature.feature.status, 'Released');
  assert.equal(feature.feature.version, '1.0');
  assert.equal(feature.feature.investorQuestion, 'What decision is supported by the available evidence?');
  assert.equal(feature.acceptance.twoLayerSummaryAndRecord, true);
  assert.equal(feature.acceptance.investorOwnedDecisionRecord, true);
  assert.deepEqual(feature.acceptance.userCanUnderstand, [
    'decision context summary',
    'evidence landscape summary',
    'tradeoff landscape summary',
    'selected decision path',
    'decision rationale summary',
    'outstanding questions',
    'decision record'
  ]);
});

test('CW-ID-006 decision record captures investor path, rationale snapshot, timestamp, versions, and assumptions context', () => {
  const feature = createDecisionSummary();
  const record = feature.sections.decisionRecord;

  assert.equal(record.component, 'DecisionRecord');
  assert.equal(record.investorOwned, true);
  assert.equal(record.immutable, true);
  assert.equal(record.selectedDecisionPath, 'continue-research');
  assert.equal(record.timestamp, '2026-07-23T00:00:00.000+05:30');
  assert.deepEqual(record.sourceFeatureIds, ['CW-ID-001', 'CW-ID-002', 'CW-ID-003', 'CW-ID-004', 'CW-ID-005']);
  assert.equal(record.upstreamFeatureVersions.overview, 'v1.0');
  assert.equal(record.upstreamFeatureVersions.businessQuality, 'v1.0');
  assert.equal(record.upstreamFeatureVersions.valuation, 'v1.0');
  assert.equal(record.noExecution, true);
  assert.equal(record.noBrokerIntegration, true);
  assert.equal(record.noPortfolioMutation, true);
});

test('CW-ID-006 summarizes prior decision features without new analysis or evidence', () => {
  const feature = createDecisionSummary();

  assert.equal(feature.sections.decisionContextSummary.sourceOnly, true);
  assert.equal(feature.sections.evidenceLandscapeSummary.sourceFeatureId, 'CW-ID-002');
  assert.equal(feature.sections.tradeoffLandscapeSummary.sourceFeatureId, 'CW-ID-003');
  assert.equal(feature.sections.selectedDecisionPath.sourceFeatureId, 'CW-ID-005');
  assert.equal(feature.sections.decisionRationaleSummary.sourceFeatureId, 'CW-ID-005');
  assert.equal(feature.sections.outstandingQuestions.sourceOnly, true);
  assert.equal(feature.acceptance.noNewAnalysisOrEvidence, true);
});

test('CW-ID-006 uses canonical FeatureView with decision summary extension data', () => {
  const feature = createDecisionSummary();
  const view = feature.featureView;

  assert.equal(view.contract, 'FeatureView');
  assert.equal(view.id, 'CW-ID-006');
  assert.equal(view.epic, 'Investment Decision');
  assert.equal(view.feature, 'ID.6');
  assert.equal(view.version, '1.0');
  assert.equal(view.extensions.decision.decisionStage, 'DecisionSummary');
  assert.equal(view.extensions.decision.summaryOnly, true);
  assert.equal(view.extensions.decision.selectedDecisionPath.optionId, 'continue-research');
  assert.equal(view.extensions.decision.decisionRecord.investorOwned, true);
});

test('CW-ID-006 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const feature = createDecisionSummary();

  assert.equal(feature.sections.decisionFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(feature.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(feature.sections.aiInterpretation.caution.includes('introduces no new evidence'), true);
  assert.equal(feature.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(feature.sections.investorJudgment.noAutomation, true);
  assert.equal(feature.evidenceConfidence.notInvestmentConfidence, true);
});

test('CW-ID-006 guardrails prevent new evidence, new analysis, recommendation, automation, execution, broker integration, and portfolio mutation', () => {
  const feature = createDecisionSummary();
  const serialized = JSON.stringify(feature).toLowerCase();

  assert.equal(feature.boundaries.decisionSupportOnly, true);
  assert.equal(feature.boundaries.consumesUpstreamOutputsOnly, true);
  assert.equal(feature.boundaries.decisionSummaryOnly, true);
  assert.equal(feature.boundaries.investorOwnedDecisionRecord, true);
  assert.equal(feature.boundaries.noNewAnalysis, true);
  assert.equal(feature.boundaries.noNewEvidence, true);
  assert.equal(feature.boundaries.noRecommendation, true);
  assert.equal(feature.boundaries.noDecisionAutomation, true);
  assert.equal(feature.boundaries.noExecution, true);
  assert.equal(feature.boundaries.noBrokerIntegration, true);
  assert.equal(feature.boundaries.noOrderPlacement, true);
  assert.equal(feature.boundaries.noPortfolioMutation, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'place order', 'broker connector']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});
