import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createValuationSnapshot,
  getDefaultValuationSnapshotInput,
  createIntrinsicValueDrivers,
  getDefaultIntrinsicValueDriversInput,
  createScenarioValuation,
  getDefaultScenarioValuationInput,
  createMarginOfSafety,
  getDefaultMarginOfSafetyInput,
  createMarketExpectations,
  getDefaultMarketExpectationsInput,
  createSensitivityAnalysis,
  getDefaultSensitivityAnalysisInput,
  createValuationSummary
} from '../src/workspaces/index.js';

test('CW-VAL-001 Valuation Snapshot orients to current valuation picture without recommendation', () => {
  const snapshot = createValuationSnapshot(getDefaultValuationSnapshotInput());

  assert.equal(snapshot.type, 'valuation-snapshot');
  assert.equal(snapshot.feature.stableId, 'CW-VAL-001');
  assert.equal(snapshot.feature.status, 'Released');
  assert.equal(snapshot.feature.version, '1.0');
  assert.equal(snapshot.feature.investorQuestion, 'What is the current valuation picture?');
  assert.equal(snapshot.acceptance.orientationOnly, true);
  assert.deepEqual(snapshot.acceptance.userCanUnderstand, [
    'current market context',
    'estimated valuation range',
    'methods represented',
    'key assumptions',
    'range interpretation',
    'evidence support for valuation inputs'
  ]);
});

test('CW-VAL-001 shows current market context, valuation range, methods, and assumptions', () => {
  const snapshot = createValuationSnapshot(getDefaultValuationSnapshotInput());

  assert.equal(snapshot.sections.currentMarketContext.currentMarketPrice, '₹1,240');
  assert.equal(snapshot.sections.estimatedValuationRange.low, '₹980');
  assert.equal(snapshot.sections.estimatedValuationRange.high, '₹1,420');
  assert.equal(snapshot.sections.estimatedValuationRange.noTargetPrice, true);
  assert.equal(snapshot.sections.valuationMethodsRepresented.noPreferredMethod, true);
  assert.deepEqual(snapshot.sections.valuationMethodsRepresented.items.map(item => item.method), ['DCF', 'Relative Valuation', 'Historical Range']);
  assert.equal(snapshot.sections.keyAssumptions.items.length, 5);
});

test('CW-VAL-001 uses canonical FeatureView with valuation extension data', () => {
  const snapshot = createValuationSnapshot(getDefaultValuationSnapshotInput());
  const view = snapshot.featureView;

  assert.equal(view.contract, 'FeatureView');
  assert.equal(view.id, 'CW-VAL-001');
  assert.equal(view.epic, 'Valuation');
  assert.equal(view.feature, 'VAL.1');
  assert.equal(view.version, '1.0');
  assert.equal(view.extensions.valuation.snapshotOnly, true);
  assert.equal(view.extensions.valuation.methodsRepresented.length, 3);
  assert.equal(view.extensions.valuation.keyAssumptions.length, 5);
});

test('CW-VAL-001 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const snapshot = createValuationSnapshot(getDefaultValuationSnapshotInput());

  assert.equal(snapshot.sections.valuationFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(snapshot.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(snapshot.sections.aiInterpretation.caution.includes('does not recommend action'), true);
  assert.equal(snapshot.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(snapshot.sections.investorJudgment.noAutomation, true);
  assert.equal(snapshot.evidenceConfidence.confidence, 'Medium');
  assert.equal(snapshot.evidenceConfidence.coverage, 61);
  assert.equal(snapshot.evidenceConfidence.missingEvidenceChecklist.some(item => item.priority === 'High'), true);
});

test('CW-VAL-001 guardrails prevent preferred method, target price, recommendation, decision, execution, and portfolio action leakage', () => {
  const snapshot = createValuationSnapshot(getDefaultValuationSnapshotInput());
  const serialized = JSON.stringify(snapshot).toLowerCase();

  assert.equal(snapshot.boundaries.valuationOnly, true);
  assert.equal(snapshot.boundaries.noPreferredMethod, true);
  assert.equal(snapshot.boundaries.noTargetPrice, true);
  assert.equal(snapshot.boundaries.noRecommendation, true);
  assert.equal(snapshot.boundaries.noDecision, true);
  assert.equal(snapshot.boundaries.noExecution, true);
  assert.equal(snapshot.boundaries.noPositionSizing, true);
  assert.equal(snapshot.boundaries.noPortfolioAction, true);
  assert.equal(snapshot.acceptance.noAutomatedDecision, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'place order', 'broker connector', 'position size']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('CW-VAL-002 Intrinsic Value Drivers explains value drivers without calculating intrinsic value', () => {
  const drivers = createIntrinsicValueDrivers(getDefaultIntrinsicValueDriversInput());

  assert.equal(drivers.type, 'intrinsic-value-drivers');
  assert.equal(drivers.feature.stableId, 'CW-VAL-002');
  assert.equal(drivers.feature.status, 'Released');
  assert.equal(drivers.feature.version, '1.0');
  assert.equal(drivers.feature.investorQuestion, 'What assumptions drive intrinsic value?');
  assert.equal(drivers.acceptance.explanatoryNotComputational, true);
  assert.equal(drivers.acceptance.noIntrinsicValueConclusion, true);
  assert.deepEqual(drivers.acceptance.userCanUnderstand, [
    'revenue growth drivers',
    'profitability drivers',
    'reinvestment drivers',
    'cash flow drivers',
    'cost of capital assumptions',
    'terminal value assumptions',
    'driver interactions'
  ]);
});

test('CW-VAL-002 separates valuation drivers and driver interactions', () => {
  const drivers = createIntrinsicValueDrivers(getDefaultIntrinsicValueDriversInput());

  assert.equal(drivers.sections.revenueGrowthDrivers.component, 'RevenueGrowthDrivers');
  assert.equal(drivers.sections.profitabilityDrivers.component, 'ProfitabilityDrivers');
  assert.equal(drivers.sections.reinvestmentDrivers.component, 'ReinvestmentDrivers');
  assert.equal(drivers.sections.cashFlowDrivers.component, 'CashFlowDrivers');
  assert.equal(drivers.sections.costOfCapitalAssumptions.component, 'CostOfCapitalAssumptions');
  assert.equal(drivers.sections.terminalValueAssumptions.component, 'TerminalValueAssumptions');
  assert.equal(drivers.sections.driverInteraction.relationshipFocused, true);
  assert.equal(drivers.sections.driverInteraction.noNumericSensitivity, true);
  assert.equal(drivers.sections.driverInteraction.items.length, 4);
});

test('CW-VAL-002 defines evidence expectations for each intrinsic value driver', () => {
  const drivers = createIntrinsicValueDrivers(getDefaultIntrinsicValueDriversInput());

  assert.equal(drivers.sections.evidenceExpectations.actionable, true);
  assert.deepEqual(drivers.sections.evidenceExpectations.items.map(item => item.section), [
    'Revenue Growth Drivers',
    'Profitability Drivers',
    'Reinvestment Drivers',
    'Cash Flow Drivers',
    'Cost of Capital Assumptions',
    'Terminal Value Assumptions',
    'Driver Interaction'
  ]);
  assert.equal(drivers.sections.evidenceExpectations.items.some(item => item.typicalEvidence.includes('Risk-free rate')), true);
});

test('CW-VAL-002 uses canonical FeatureView with valuation extension data', () => {
  const drivers = createIntrinsicValueDrivers(getDefaultIntrinsicValueDriversInput());
  const view = drivers.featureView;

  assert.equal(view.contract, 'FeatureView');
  assert.equal(view.id, 'CW-VAL-002');
  assert.equal(view.epic, 'Valuation');
  assert.equal(view.feature, 'VAL.2');
  assert.equal(view.version, '1.0');
  assert.equal(view.extensions.valuation.dimension, 'Intrinsic Value Drivers');
  assert.equal(view.extensions.valuation.driverInteractions.length, 4);
  assert.equal(view.extensions.valuation.evidenceExpectations.length, 7);
  assert.equal(view.extensions.valuation.explanatoryOnly, true);
});

test('CW-VAL-002 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const drivers = createIntrinsicValueDrivers(getDefaultIntrinsicValueDriversInput());

  assert.equal(drivers.sections.valuationFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(drivers.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(drivers.sections.aiInterpretation.caution.includes('does not calculate intrinsic value'), true);
  assert.equal(drivers.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(drivers.sections.investorJudgment.noAutomation, true);
  assert.equal(drivers.evidenceConfidence.confidence, 'Medium');
  assert.equal(drivers.evidenceConfidence.coverage, 59);
  assert.equal(drivers.evidenceConfidence.missingEvidenceChecklist.some(item => item.priority === 'High'), true);
});

test('CW-VAL-002 guardrails prevent intrinsic value conclusion, preferred method, target price, recommendation, decision, and execution', () => {
  const drivers = createIntrinsicValueDrivers(getDefaultIntrinsicValueDriversInput());
  const serialized = JSON.stringify(drivers).toLowerCase();

  assert.equal(drivers.boundaries.valuationOnly, true);
  assert.equal(drivers.boundaries.intrinsicValueDriversOnly, true);
  assert.equal(drivers.boundaries.noIntrinsicValueConclusion, true);
  assert.equal(drivers.boundaries.noPreferredMethod, true);
  assert.equal(drivers.boundaries.noTargetPrice, true);
  assert.equal(drivers.boundaries.noRecommendation, true);
  assert.equal(drivers.boundaries.noDecision, true);
  assert.equal(drivers.boundaries.noExecution, true);
  assert.equal(drivers.boundaries.noPositionSizing, true);
  assert.equal(drivers.boundaries.noPortfolioAction, true);
  assert.equal(drivers.acceptance.noAutomatedDecision, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'place order', 'broker connector', 'position size']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('CW-VAL-003 Scenario Valuation estimates conditional values across coherent scenarios', () => {
  const scenario = createScenarioValuation(getDefaultScenarioValuationInput());

  assert.equal(scenario.type, 'scenario-valuation');
  assert.equal(scenario.feature.stableId, 'CW-VAL-003');
  assert.equal(scenario.feature.status, 'Released');
  assert.equal(scenario.feature.version, '1.0');
  assert.equal(scenario.feature.investorQuestion, 'How does estimated value change across scenarios?');
  assert.equal(scenario.acceptance.conditionalValuationOnly, true);
  assert.deepEqual(scenario.acceptance.userCanUnderstand, [
    'scenario definitions',
    'bear scenario',
    'base scenario',
    'bull scenario',
    'scenario comparison',
    'key assumption differences',
    'evidence support for scenarios'
  ]);
});

test('CW-VAL-003 exposes bear, base, and bull scenarios without probability assignment', () => {
  const scenario = createScenarioValuation(getDefaultScenarioValuationInput());

  assert.equal(scenario.sections.scenarioDefinitions.noProbabilityAssigned, true);
  assert.equal(scenario.sections.bearScenario.estimatedValue, '₹920');
  assert.equal(scenario.sections.baseScenario.estimatedValue, '₹1,180');
  assert.equal(scenario.sections.bullScenario.estimatedValue, '₹1,520');
  assert.equal(scenario.sections.bearScenario.noProbabilityAssigned, true);
  assert.equal(scenario.sections.scenarioComparison.noPreferredScenario, true);
  assert.equal(scenario.sections.keyAssumptionDifferences.items.length, 5);
});

test('CW-VAL-003 defines scenario evidence expectations', () => {
  const scenario = createScenarioValuation(getDefaultScenarioValuationInput());

  assert.equal(scenario.sections.evidenceExpectations.actionable, true);
  assert.deepEqual(scenario.sections.evidenceExpectations.items.map(item => item.section), [
    'Scenario Definitions',
    'Bear Scenario',
    'Base Scenario',
    'Bull Scenario',
    'Key Assumption Differences',
    'Scenario Comparison'
  ]);
  assert.equal(scenario.sections.evidenceExpectations.items.some(item => item.typicalEvidence.includes('Model outputs')), true);
});

test('CW-VAL-003 uses canonical FeatureView with valuation scenario extension data', () => {
  const scenario = createScenarioValuation(getDefaultScenarioValuationInput());
  const view = scenario.featureView;

  assert.equal(view.contract, 'FeatureView');
  assert.equal(view.id, 'CW-VAL-003');
  assert.equal(view.epic, 'Valuation');
  assert.equal(view.feature, 'VAL.3');
  assert.equal(view.version, '1.0');
  assert.equal(view.extensions.valuation.dimension, 'Scenario Valuation');
  assert.equal(view.extensions.valuation.scenarios.length, 3);
  assert.equal(view.extensions.valuation.keyAssumptionDifferences.length, 5);
  assert.equal(view.extensions.valuation.noProbabilityAssigned, true);
});

test('CW-VAL-003 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const scenario = createScenarioValuation(getDefaultScenarioValuationInput());

  assert.equal(scenario.sections.valuationFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(scenario.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(scenario.sections.aiInterpretation.caution.includes('assigns no probabilities'), true);
  assert.equal(scenario.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(scenario.sections.investorJudgment.noAutomation, true);
  assert.equal(scenario.evidenceConfidence.confidence, 'Medium');
  assert.equal(scenario.evidenceConfidence.coverage, 56);
});

test('CW-VAL-003 guardrails prevent probability assignment, preferred scenario, target price, recommendation, decision, and execution', () => {
  const scenario = createScenarioValuation(getDefaultScenarioValuationInput());
  const serialized = JSON.stringify(scenario).toLowerCase();

  assert.equal(scenario.boundaries.valuationOnly, true);
  assert.equal(scenario.boundaries.scenarioValuationOnly, true);
  assert.equal(scenario.boundaries.noProbabilityAssignment, true);
  assert.equal(scenario.boundaries.noPreferredScenario, true);
  assert.equal(scenario.boundaries.noTargetPrice, true);
  assert.equal(scenario.boundaries.noRecommendation, true);
  assert.equal(scenario.boundaries.noDecision, true);
  assert.equal(scenario.boundaries.noExecution, true);
  assert.equal(scenario.boundaries.noPositionSizing, true);
  assert.equal(scenario.boundaries.noPortfolioAction, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'place order', 'broker connector', 'position size']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('CW-VAL-004 Margin of Safety compares price and estimated value without recommendation', () => {
  const mos = createMarginOfSafety(getDefaultMarginOfSafetyInput());

  assert.equal(mos.type, 'margin-of-safety');
  assert.equal(mos.feature.stableId, 'CW-VAL-004');
  assert.equal(mos.feature.status, 'Released');
  assert.equal(mos.feature.version, '1.0');
  assert.equal(mos.feature.investorQuestion, 'How much room exists between price and estimated value?');
  assert.equal(mos.acceptance.comparisonOnly, true);
  assert.equal(mos.acceptance.descriptiveNotPrescriptive, true);
  assert.deepEqual(mos.acceptance.userCanUnderstand, [
    'current market price',
    'estimated value range',
    'relative position',
    'margin of safety analysis',
    'assumption dependence',
    'evidence support for comparison inputs'
  ]);
});

test('CW-VAL-004 exposes relative position and margin analysis descriptively', () => {
  const mos = createMarginOfSafety(getDefaultMarginOfSafetyInput());

  assert.equal(mos.sections.currentMarketPrice.displayPrice, '₹1,240');
  assert.equal(mos.sections.estimatedValueRange.displayLow, '₹980');
  assert.equal(mos.sections.estimatedValueRange.displayHigh, '₹1,420');
  assert.equal(mos.sections.relativePosition.position, 'Within estimated range');
  assert.equal(mos.sections.relativePosition.noUndervaluedLabel, true);
  assert.equal(mos.sections.relativePosition.noOvervaluedLabel, true);
  assert.equal(mos.sections.marginOfSafetyAnalysis.noBuySignal, true);
  assert.equal(mos.sections.marginOfSafetyAnalysis.noSellSignal, true);
  assert.equal(mos.sections.marginOfSafetyAnalysis.baseGap.percent, -5.1);
});

test('CW-VAL-004 defines margin of safety evidence expectations and assumption dependence', () => {
  const mos = createMarginOfSafety(getDefaultMarginOfSafetyInput());

  assert.equal(mos.sections.evidenceExpectations.actionable, true);
  assert.deepEqual(mos.sections.evidenceExpectations.items.map(item => item.section), [
    'Current Market Price',
    'Estimated Value Range',
    'Relative Position',
    'Margin of Safety Analysis',
    'Assumption Dependence'
  ]);
  assert.equal(mos.sections.assumptionDependence.items.length, 5);
  assert.equal(mos.sections.evidenceExpectations.items.some(item => item.typicalEvidence.includes('Source-linked')), true);
});

test('CW-VAL-004 uses canonical FeatureView with valuation comparison extension data', () => {
  const mos = createMarginOfSafety(getDefaultMarginOfSafetyInput());
  const view = mos.featureView;

  assert.equal(view.contract, 'FeatureView');
  assert.equal(view.id, 'CW-VAL-004');
  assert.equal(view.epic, 'Valuation');
  assert.equal(view.feature, 'VAL.4');
  assert.equal(view.version, '1.0');
  assert.equal(view.extensions.valuation.dimension, 'Margin of Safety');
  assert.equal(view.extensions.valuation.relativePosition.position, 'Within estimated range');
  assert.equal(view.extensions.valuation.assumptionDependence.length, 5);
  assert.equal(view.extensions.valuation.comparisonOnly, true);
});

test('CW-VAL-004 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const mos = createMarginOfSafety(getDefaultMarginOfSafetyInput());

  assert.equal(mos.sections.valuationFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(mos.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(mos.sections.aiInterpretation.caution.includes('does not label the security as undervalued or overvalued'), true);
  assert.equal(mos.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(mos.sections.investorJudgment.noAutomation, true);
  assert.equal(mos.evidenceConfidence.confidence, 'Medium');
  assert.equal(mos.evidenceConfidence.coverage, 60);
});

test('CW-VAL-004 guardrails prevent undervalued labels, overvalued labels, buy/sell signals, recommendation, decision, and execution', () => {
  const mos = createMarginOfSafety(getDefaultMarginOfSafetyInput());
  const serialized = JSON.stringify(mos).toLowerCase();

  assert.equal(mos.boundaries.valuationOnly, true);
  assert.equal(mos.boundaries.marginOfSafetyOnly, true);
  assert.equal(mos.boundaries.comparisonOnly, true);
  assert.equal(mos.boundaries.noUndervaluedLabel, true);
  assert.equal(mos.boundaries.noOvervaluedLabel, true);
  assert.equal(mos.boundaries.noBuySignal, true);
  assert.equal(mos.boundaries.noSellSignal, true);
  assert.equal(mos.boundaries.noRecommendation, true);
  assert.equal(mos.boundaries.noDecision, true);
  assert.equal(mos.boundaries.noExecution, true);
  assert.equal(mos.boundaries.noPositionSizing, true);
  assert.equal(mos.boundaries.noPortfolioAction, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'place order', 'broker connector', 'position size']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('CW-VAL-005 Market Expectations infers assumptions embedded in price without mispricing conclusion', () => {
  const expectations = createMarketExpectations(getDefaultMarketExpectationsInput());

  assert.equal(expectations.type, 'market-expectations');
  assert.equal(expectations.feature.stableId, 'CW-VAL-005');
  assert.equal(expectations.feature.status, 'Released');
  assert.equal(expectations.feature.version, '1.0');
  assert.equal(expectations.feature.investorQuestion, 'What expectations appear to be embedded in the current price?');
  assert.equal(expectations.acceptance.expectationInferenceOnly, true);
  assert.equal(expectations.acceptance.noMarketMispricingConclusion, true);
  assert.deepEqual(expectations.acceptance.userCanUnderstand, [
    'current market price',
    'implied growth expectations',
    'implied profitability expectations',
    'implied reinvestment expectations',
    'scenario consistency',
    'expectation summary',
    'evidence support for inferred expectations'
  ]);
});

test('CW-VAL-005 exposes implied expectations and scenario consistency without choosing correct scenario', () => {
  const expectations = createMarketExpectations(getDefaultMarketExpectationsInput());

  assert.equal(expectations.sections.currentMarketPrice.displayPrice, '₹1,240');
  assert.equal(expectations.sections.impliedGrowthExpectations.inferenceOnly, true);
  assert.equal(expectations.sections.impliedProfitabilityExpectations.inferenceOnly, true);
  assert.equal(expectations.sections.impliedReinvestmentExpectations.inferenceOnly, true);
  assert.equal(expectations.sections.scenarioConsistency.closestScenario, 'Base Scenario');
  assert.equal(expectations.sections.scenarioConsistency.noCorrectScenario, true);
  assert.equal(expectations.sections.expectationSummary.noMispricingConclusion, true);
});

test('CW-VAL-005 defines market expectation evidence expectations', () => {
  const expectations = createMarketExpectations(getDefaultMarketExpectationsInput());

  assert.equal(expectations.sections.evidenceExpectations.actionable, true);
  assert.deepEqual(expectations.sections.evidenceExpectations.items.map(item => item.section), [
    'Current Market Price',
    'Implied Growth Expectations',
    'Implied Profitability Expectations',
    'Implied Reinvestment Expectations',
    'Scenario Consistency',
    'Expectation Summary'
  ]);
  assert.equal(expectations.sections.evidenceExpectations.items.some(item => item.typicalEvidence.includes('Reverse-valuation')), true);
});

test('CW-VAL-005 uses canonical FeatureView with valuation expectation extension data', () => {
  const expectations = createMarketExpectations(getDefaultMarketExpectationsInput());
  const view = expectations.featureView;

  assert.equal(view.contract, 'FeatureView');
  assert.equal(view.id, 'CW-VAL-005');
  assert.equal(view.epic, 'Valuation');
  assert.equal(view.feature, 'VAL.5');
  assert.equal(view.version, '1.0');
  assert.equal(view.extensions.valuation.dimension, 'Market Expectations');
  assert.equal(view.extensions.valuation.expectationInferenceOnly, true);
  assert.equal(view.extensions.valuation.scenarioConsistency.closestScenario, 'Base Scenario');
});

test('CW-VAL-005 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const expectations = createMarketExpectations(getDefaultMarketExpectationsInput());

  assert.equal(expectations.sections.valuationFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(expectations.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(expectations.sections.aiInterpretation.caution.includes('does not conclude mispricing'), true);
  assert.equal(expectations.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(expectations.sections.investorJudgment.noAutomation, true);
  assert.equal(expectations.evidenceConfidence.confidence, 'Medium');
  assert.equal(expectations.evidenceConfidence.coverage, 54);
});

test('CW-VAL-005 guardrails prevent mispricing conclusion, correct scenario, target price, recommendation, decision, and execution', () => {
  const expectations = createMarketExpectations(getDefaultMarketExpectationsInput());
  const serialized = JSON.stringify(expectations).toLowerCase();

  assert.equal(expectations.boundaries.valuationOnly, true);
  assert.equal(expectations.boundaries.marketExpectationsOnly, true);
  assert.equal(expectations.boundaries.expectationInferenceOnly, true);
  assert.equal(expectations.boundaries.noMarketMispricingConclusion, true);
  assert.equal(expectations.boundaries.noCorrectScenario, true);
  assert.equal(expectations.boundaries.noTargetPrice, true);
  assert.equal(expectations.boundaries.noRecommendation, true);
  assert.equal(expectations.boundaries.noDecision, true);
  assert.equal(expectations.boundaries.noExecution, true);
  assert.equal(expectations.boundaries.noPositionSizing, true);
  assert.equal(expectations.boundaries.noPortfolioAction, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'place order', 'broker connector', 'position size']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('CW-VAL-006 Sensitivity Analysis identifies assumptions with greatest valuation influence', () => {
  const sensitivity = createSensitivityAnalysis(getDefaultSensitivityAnalysisInput());

  assert.equal(sensitivity.type, 'sensitivity-analysis');
  assert.equal(sensitivity.feature.stableId, 'CW-VAL-006');
  assert.equal(sensitivity.feature.status, 'Released');
  assert.equal(sensitivity.feature.version, '1.0');
  assert.equal(sensitivity.feature.investorQuestion, 'Which assumptions most influence valuation?');
  assert.equal(sensitivity.acceptance.analyzesUncertainty, true);
  assert.equal(sensitivity.acceptance.ranksRelativeInfluence, true);
  assert.deepEqual(sensitivity.acceptance.userCanUnderstand, [
    'baseline assumptions',
    'individual assumption changes',
    'directional impact',
    'relative sensitivity',
    'sensitivity ranking',
    'interaction limitations'
  ]);
});

test('CW-VAL-006 ranks assumptions by relative influence without model optimization', () => {
  const sensitivity = createSensitivityAnalysis(getDefaultSensitivityAnalysisInput());

  assert.equal(sensitivity.sections.sensitivityRanking.relativeInfluenceOnly, true);
  assert.equal(sensitivity.sections.sensitivityRanking.noModelOptimization, true);
  assert.deepEqual(sensitivity.sections.sensitivityRanking.items.map(item => item.assumption), [
    'Discount Rate',
    'Revenue Growth',
    'Operating Margin',
    'Terminal Growth',
    'Reinvestment Needs'
  ]);
  assert.equal(sensitivity.sections.sensitivityRanking.items[0].relativeInfluence, 'Very High');
});

test('CW-VAL-006 exposes single-variable sensitivity sections and interaction notes', () => {
  const sensitivity = createSensitivityAnalysis(getDefaultSensitivityAnalysisInput());

  assert.equal(sensitivity.sections.baselineAssumptions.heldConstantForPrimaryAnalysis, true);
  assert.equal(sensitivity.sections.baselineAssumptions.scenarioComparison.includes('CW-VAL-003'), true);
  assert.equal(sensitivity.sections.revenueGrowthSensitivity.singleVariableOnly, true);
  assert.equal(sensitivity.sections.marginSensitivity.singleVariableOnly, true);
  assert.equal(sensitivity.sections.reinvestmentSensitivity.singleVariableOnly, true);
  assert.equal(sensitivity.sections.discountRateSensitivity.singleVariableOnly, true);
  assert.equal(sensitivity.sections.terminalGrowthSensitivity.singleVariableOnly, true);
  assert.equal(sensitivity.sections.interactionNotes.acknowledgesLimitations, true);
  assert.equal(sensitivity.sections.interactionNotes.primaryMethod.includes('one assumption at a time'), true);
  assert.equal(sensitivity.sections.interactionNotes.scenarioCrossReference.includes('CW-VAL-003'), true);
});

test('CW-VAL-006 defines sensitivity evidence expectations', () => {
  const sensitivity = createSensitivityAnalysis(getDefaultSensitivityAnalysisInput());

  assert.equal(sensitivity.sections.evidenceExpectations.actionable, true);
  assert.deepEqual(sensitivity.sections.evidenceExpectations.items.map(item => item.section), [
    'Key Assumptions Tested',
    'Revenue Growth Sensitivity',
    'Margin Sensitivity',
    'Reinvestment Sensitivity',
    'Discount Rate Sensitivity',
    'Terminal Growth Sensitivity',
    'Sensitivity Ranking',
    'Interaction Notes'
  ]);
  assert.equal(sensitivity.sections.evidenceExpectations.items.some(item => item.typicalEvidence.includes('Documented model outputs')), true);
});

test('CW-VAL-006 uses canonical FeatureView with valuation sensitivity extension data', () => {
  const sensitivity = createSensitivityAnalysis(getDefaultSensitivityAnalysisInput());
  const view = sensitivity.featureView;

  assert.equal(view.contract, 'FeatureView');
  assert.equal(view.id, 'CW-VAL-006');
  assert.equal(view.epic, 'Valuation');
  assert.equal(view.feature, 'VAL.6');
  assert.equal(view.version, '1.0');
  assert.equal(view.extensions.valuation.dimension, 'Sensitivity Analysis');
  assert.equal(view.extensions.valuation.sensitivities.length, 5);
  assert.equal(view.extensions.valuation.sensitivityRanking.length, 5);
  assert.equal(view.extensions.valuation.singleVariableSensitivity, true);
});

test('CW-VAL-006 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const sensitivity = createSensitivityAnalysis(getDefaultSensitivityAnalysisInput());

  assert.equal(sensitivity.sections.valuationFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(sensitivity.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(sensitivity.sections.aiInterpretation.caution.includes('does not identify a correct assumption'), true);
  assert.equal(sensitivity.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(sensitivity.sections.investorJudgment.noAutomation, true);
  assert.equal(sensitivity.evidenceConfidence.confidence, 'Medium');
  assert.equal(sensitivity.evidenceConfidence.coverage, 57);
});

test('CW-VAL-006 guardrails prevent correct assumption, model optimization, target price, recommendation, decision, and execution', () => {
  const sensitivity = createSensitivityAnalysis(getDefaultSensitivityAnalysisInput());
  const serialized = JSON.stringify(sensitivity).toLowerCase();

  assert.equal(sensitivity.boundaries.valuationOnly, true);
  assert.equal(sensitivity.boundaries.sensitivityAnalysisOnly, true);
  assert.equal(sensitivity.boundaries.singleVariableSensitivity, true);
  assert.equal(sensitivity.boundaries.baselineAssumptionsFixed, true);
  assert.equal(sensitivity.boundaries.noCorrectAssumption, true);
  assert.equal(sensitivity.boundaries.noModelOptimization, true);
  assert.equal(sensitivity.boundaries.noTargetPrice, true);
  assert.equal(sensitivity.boundaries.noRecommendation, true);
  assert.equal(sensitivity.boundaries.noDecision, true);
  assert.equal(sensitivity.boundaries.noExecution, true);
  assert.equal(sensitivity.boundaries.noPositionSizing, true);
  assert.equal(sensitivity.boundaries.noPortfolioAction, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'place order', 'broker connector', 'position size']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('CW-VAL-007 Valuation Summary synthesizes only completed valuation source features', () => {
  const summary = createValuationSummary();

  assert.equal(summary.type, 'valuation-summary');
  assert.equal(summary.feature.stableId, 'CW-VAL-007');
  assert.equal(summary.feature.status, 'Released');
  assert.equal(summary.feature.version, '1.0');
  assert.equal(summary.feature.investorQuestion, 'What does the complete valuation analysis indicate?');
  assert.equal(summary.acceptance.synthesisOnly, true);
  assert.equal(summary.acceptance.usesOnlyCompletedValuationFeatures, true);
  assert.deepEqual(summary.featureView.extensions.valuation.sourceFeatureIds, ['CW-VAL-001', 'CW-VAL-002', 'CW-VAL-003', 'CW-VAL-004', 'CW-VAL-005', 'CW-VAL-006']);
});

test('CW-VAL-007 summarizes source valuation features without new analysis', () => {
  const summary = createValuationSummary();

  assert.equal(summary.sections.valuationOverview.sourceFeatureId, 'CW-VAL-001');
  assert.equal(summary.sections.intrinsicValueDriversSummary.sourceFeatureId, 'CW-VAL-002');
  assert.equal(summary.sections.scenarioSummary.sourceFeatureId, 'CW-VAL-003');
  assert.equal(summary.sections.marginOfSafetySummary.sourceFeatureId, 'CW-VAL-004');
  assert.equal(summary.sections.marketExpectationsSummary.sourceFeatureId, 'CW-VAL-005');
  assert.equal(summary.sections.sensitivitySummary.sourceFeatureId, 'CW-VAL-006');
  assert.equal(summary.sections.keyValuationInsights.sourceOnly, true);
  assert.equal(summary.sections.areasOfConfidence.sourceOnly, true);
  assert.equal(summary.sections.areasOfUncertainty.sourceOnly, true);
});

test('CW-VAL-007 creates valuation evidence summary from completed features', () => {
  const summary = createValuationSummary();
  const evidence = summary.sections.evidenceSummary;

  assert.equal(evidence.component, 'ValuationEvidenceSummary');
  assert.equal(evidence.items.length, 6);
  assert.equal(evidence.overallCoverage, 58);
  assert.equal(evidence.overallEvidenceConfidence, 'Low');
  assert.deepEqual(evidence.lowConfidenceFeatures, []);
  assert.equal(evidence.highPriorityGaps.some(gap => gap.includes('CW-VAL-003')), true);
});

test('CW-VAL-007 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const summary = createValuationSummary();

  assert.equal(summary.sections.valuationFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(summary.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(summary.sections.aiInterpretation.caution.includes('introduces no new analysis'), true);
  assert.equal(summary.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(summary.sections.investorJudgment.noAutomation, true);
  assert.equal(summary.evidenceConfidence.confidence, 'Low');
  assert.equal(summary.evidenceConfidence.coverage, 58);
});

test('CW-VAL-007 guardrails prevent new analysis, new calculations, target price, recommendation, decision, and execution', () => {
  const summary = createValuationSummary();
  const serialized = JSON.stringify(summary).toLowerCase();

  assert.equal(summary.boundaries.valuationOnly, true);
  assert.equal(summary.boundaries.valuationSummaryOnly, true);
  assert.equal(summary.boundaries.summaryOnly, true);
  assert.equal(summary.boundaries.noNewAnalysis, true);
  assert.equal(summary.boundaries.noNewCalculations, true);
  assert.equal(summary.boundaries.noRecommendation, true);
  assert.equal(summary.boundaries.noDecision, true);
  assert.equal(summary.boundaries.noExecution, true);
  assert.equal(summary.boundaries.noTargetPrice, true);
  assert.equal(summary.boundaries.noPositionSizing, true);
  assert.equal(summary.boundaries.noPortfolioAction, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'place order', 'broker connector', 'position size']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});
