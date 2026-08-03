import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  createBusinessQualitySnapshot,
  getDefaultBusinessQualitySnapshotInput,
  createBusinessModelQuality,
  getDefaultBusinessModelQualityInput,
  createCompetitivePosition,
  getDefaultCompetitivePositionInput,
  createCapitalAllocation,
  getDefaultCapitalAllocationInput,
  createGovernanceQuality,
  getDefaultGovernanceQualityInput,
  createFinancialQuality,
  getDefaultFinancialQualityInput,
  createResilience,
  getDefaultResilienceInput,
  createBusinessQualitySummary
} from '../src/workspaces/index.js';

test('Overview v1.0 release record is concise, released, and points to Business Quality successor', () => {
  const release = readFileSync(new URL('../../../releases/COMPANY_WORKSPACE_OVERVIEW_v1.0_RELEASE.md', import.meta.url), 'utf8');

  assert.equal(release.includes('## Company Workspace → Overview'), true);
  assert.equal(release.includes('**Version:** 1.0'), true);
  assert.equal(release.includes('**Status:** Released'), true);
  assert.equal(release.includes('**Release Date:** 2026-07-23'), true);
  assert.equal(release.includes('**Features:** 8'), true);
  assert.equal(release.includes('**Presentation Contract:** OverviewFeatureView v1'), true);
  assert.equal(release.includes('**Evidence Rollup:** Enabled'), true);
  assert.equal(release.includes('**Breaking Changes:** None'), true);
  assert.equal(release.includes('**Successor:** Company Workspace → Business Quality'), true);
  assert.equal(release.includes('## Known Limitations'), true);
});


test('Business Quality v1.0 release record is concise, released, and points to Valuation successor', () => {
  const release = readFileSync(new URL('../../../releases/COMPANY_WORKSPACE_BUSINESS_QUALITY_v1.0_RELEASE.md', import.meta.url), 'utf8');

  assert.equal(release.includes('## Company Workspace → Business Quality'), true);
  assert.equal(release.includes('**Version:** 1.0'), true);
  assert.equal(release.includes('**Status:** Released'), true);
  assert.equal(release.includes('**Release Date:** 2026-07-23'), true);
  assert.equal(release.includes('**Features:** 8'), true);
  assert.equal(release.includes('**Presentation Contract:** FeatureView'), true);
  assert.equal(release.includes('**Evidence Rollup:** Enabled'), true);
  assert.equal(release.includes('**Breaking Changes:** None'), true);
  assert.equal(release.includes('**Successor:** Valuation'), true);
  assert.equal(release.includes('## Known Limitations'), true);
});

test('CW-BQ-001 Business Quality Snapshot orients before measurement', () => {
  const snapshot = createBusinessQualitySnapshot(getDefaultBusinessQualitySnapshotInput());

  assert.equal(snapshot.type, 'business-quality-snapshot');
  assert.equal(snapshot.feature.stableId, 'CW-BQ-001');
  assert.equal(snapshot.feature.status, 'Released');
  assert.equal(snapshot.feature.version, '1.0');
  assert.equal(snapshot.feature.investorQuestion, 'Is this a high-quality business?');
  assert.equal(snapshot.acceptance.orientationBeforeMeasurement, true);
  assert.equal(snapshot.acceptance.notScorecard, true);
  assert.deepEqual(snapshot.acceptance.userCanUnderstand, [
    'overall quality profile',
    'quality pillars',
    'business model quality orientation',
    'competitive position orientation',
    'profitability profile questions',
    'capital allocation questions',
    'governance overview',
    'resilience indicators'
  ]);
});

test('CW-BQ-001 exposes quality pillars without scoring the company', () => {
  const snapshot = createBusinessQualitySnapshot(getDefaultBusinessQualitySnapshotInput());

  assert.equal(snapshot.sections.qualityPillars.items.length, 6);
  assert.deepEqual(snapshot.sections.qualityPillars.items.map(item => item.pillar), [
    'Business Model',
    'Competitive Position',
    'Profitability Profile',
    'Capital Allocation',
    'Governance',
    'Resilience'
  ]);
  assert.equal(snapshot.sections.profitabilityProfile.measurementDeferred, true);
  assert.equal(snapshot.sections.capitalAllocation.measurementDeferred, true);
  assert.equal(snapshot.sections.governanceOverview.measurementDeferred, true);
});

test('CW-BQ-001 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const snapshot = createBusinessQualitySnapshot(getDefaultBusinessQualitySnapshotInput());

  assert.equal(snapshot.sections.qualityFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(snapshot.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(snapshot.sections.aiInterpretation.caution.includes('does not assign a quality score'), true);
  assert.equal(snapshot.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(snapshot.sections.investorJudgment.noAutomation, true);
  assert.equal(snapshot.evidenceConfidence.confidence, 'Medium');
  assert.equal(snapshot.evidenceConfidence.coverage, 64);
  assert.equal(snapshot.evidenceConfidence.notInvestmentConfidence, true);
  assert.equal(snapshot.evidenceConfidence.missingEvidenceChecklist.some(item => item.priority === 'High'), true);
});

test('CW-BQ-001 guardrails prevent scorecard, valuation, recommendation, and execution leakage', () => {
  const snapshot = createBusinessQualitySnapshot(getDefaultBusinessQualitySnapshotInput());
  const serialized = JSON.stringify(snapshot).toLowerCase();

  assert.equal(snapshot.boundaries.orientationNotScorecard, true);
  assert.equal(snapshot.boundaries.noQualityScore, true);
  assert.equal(snapshot.boundaries.noRanking, true);
  assert.equal(snapshot.boundaries.noValuation, true);
  assert.equal(snapshot.boundaries.noRecommendation, true);
  assert.equal(snapshot.boundaries.noExecution, true);
  assert.equal(snapshot.acceptance.noAutomatedDecision, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'intrinsic value', 'margin of safety', 'place order', 'broker connector']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('CW-BQ-001 uses canonical FeatureView with quality data under extensions', () => {
  const snapshot = createBusinessQualitySnapshot(getDefaultBusinessQualitySnapshotInput());
  const view = snapshot.featureView;

  assert.equal(view.contract, 'FeatureView');
  assert.equal(view.id, 'CW-BQ-001');
  assert.equal(view.title, 'Business Quality Snapshot');
  assert.equal(view.epic, 'Business Quality');
  assert.equal(view.feature, 'BQ.1');
  assert.equal(view.version, '1.0');
  assert.equal(view.investorQuestion, 'Is this a high-quality business?');
  assert.equal(view.evidenceConfidence.notInvestmentConfidence, true);
  assert.equal(view.guardrails.noQualityScore, true);
  assert.equal(view.guardrails.noRecommendation, true);
  assert.equal(view.guardrails.noExecution, true);
  assert.equal(view.extensions.quality.qualityPillars.length, 6);
  assert.equal(view.qualityPillars, undefined);
  assert.equal(view.metadata.workspace, 'Company Workspace');
  assert.equal(view.metadata.status, 'Released');
  assert.equal(snapshot.businessQualityFeatureView, undefined);
});

test('CW-BQ-002 Business Model Quality assesses durability without scoring', () => {
  const model = createBusinessModelQuality(getDefaultBusinessModelQualityInput());

  assert.equal(model.type, 'business-model-quality');
  assert.equal(model.feature.stableId, 'CW-BQ-002');
  assert.equal(model.feature.status, 'Released');
  assert.equal(model.feature.version, '1.0');
  assert.equal(model.feature.investorQuestion, 'Is the business model durable?');
  assert.equal(model.acceptance.assessesDurabilityNotScore, true);
  assert.deepEqual(model.acceptance.userCanUnderstand, [
    'revenue model durability',
    'customer dependence',
    'switching costs',
    'repeat purchase characteristics',
    'scalability',
    'operating leverage potential',
    'durability signals',
    'fragility signals'
  ]);
});

test('CW-BQ-002 exposes durability and fragility signals under FeatureView extensions.quality', () => {
  const model = createBusinessModelQuality(getDefaultBusinessModelQualityInput());
  const view = model.featureView;

  assert.equal(view.contract, 'FeatureView');
  assert.equal(view.id, 'CW-BQ-002');
  assert.equal(view.epic, 'Business Quality');
  assert.equal(view.feature, 'BQ.2');
  assert.equal(view.version, '1.0');
  assert.equal(view.extensions.quality.dimension, 'Business Model');
  assert.equal(view.extensions.quality.durabilitySignals.length, 4);
  assert.equal(view.extensions.quality.fragilitySignals.length, 3);
  assert.equal(view.extensions.quality.measurementDeferred, true);
  assert.equal(view.metadata.workspace, 'Company Workspace');
});

test('CW-BQ-002 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const model = createBusinessModelQuality(getDefaultBusinessModelQualityInput());

  assert.equal(model.sections.modelFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(model.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(model.sections.aiInterpretation.caution.includes('does not create a quality score'), true);
  assert.equal(model.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(model.sections.investorJudgment.noAutomation, true);
  assert.equal(model.evidenceConfidence.confidence, 'Medium');
  assert.equal(model.evidenceConfidence.coverage, 67);
  assert.equal(model.evidenceConfidence.missingEvidenceChecklist.some(item => item.priority === 'High'), true);
});

test('CW-BQ-002 guardrails prevent quality score, ranking, valuation, recommendation, and execution leakage', () => {
  const model = createBusinessModelQuality(getDefaultBusinessModelQualityInput());
  const serialized = JSON.stringify(model).toLowerCase();

  assert.equal(model.boundaries.durabilityAssessmentOnly, true);
  assert.equal(model.boundaries.noQualityScore, true);
  assert.equal(model.boundaries.noRanking, true);
  assert.equal(model.boundaries.noValuation, true);
  assert.equal(model.boundaries.noRecommendation, true);
  assert.equal(model.boundaries.noExecution, true);
  assert.equal(model.acceptance.noAutomatedDecision, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'intrinsic value', 'margin of safety', 'place order', 'broker connector']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('CW-BQ-003 Competitive Position assesses competitive durability without moat scoring', () => {
  const competitive = createCompetitivePosition(getDefaultCompetitivePositionInput());

  assert.equal(competitive.type, 'competitive-position');
  assert.equal(competitive.feature.stableId, 'CW-BQ-003');
  assert.equal(competitive.feature.status, 'Released');
  assert.equal(competitive.feature.version, '1.0');
  assert.equal(competitive.feature.investorQuestion, 'Can competitors erode this business?');
  assert.equal(competitive.acceptance.competitiveDurabilityNotMoatScore, true);
  assert.deepEqual(competitive.acceptance.userCanUnderstand, [
    'industry structure',
    'competitive landscape',
    'sources of advantage',
    'evidence of advantage',
    'threats to advantage',
    'customer switching dynamics',
    'pricing power',
    'innovation and differentiation',
    'future sustainability'
  ]);
});

test('CW-BQ-003 separates hypothesized advantage sources from observed evidence', () => {
  const competitive = createCompetitivePosition(getDefaultCompetitivePositionInput());

  assert.equal(competitive.sections.sourcesOfCompetitiveAdvantage.hypothesisOnly, true);
  assert.equal(competitive.sections.evidenceOfAdvantage.observedEvidenceOnly, true);
  assert.equal(competitive.sections.sourcesOfCompetitiveAdvantage.items.length, 4);
  assert.equal(competitive.sections.evidenceOfAdvantage.items.length, 3);
  assert.equal(competitive.sections.evidenceExpectations.actionable, true);
  assert.equal(competitive.sections.evidenceExpectations.items.some(item => item.section === 'Evidence of Advantage'), true);
});

test('CW-BQ-003 exposes competitive quality data under FeatureView extensions.quality', () => {
  const competitive = createCompetitivePosition(getDefaultCompetitivePositionInput());
  const view = competitive.featureView;

  assert.equal(view.contract, 'FeatureView');
  assert.equal(view.id, 'CW-BQ-003');
  assert.equal(view.epic, 'Business Quality');
  assert.equal(view.feature, 'BQ.3');
  assert.equal(view.version, '1.0');
  assert.equal(view.extensions.quality.dimension, 'Competitive Position');
  assert.equal(view.extensions.quality.advantageSources.length, 4);
  assert.equal(view.extensions.quality.observedEvidence.length, 3);
  assert.equal(view.extensions.quality.threats.length, 4);
  assert.equal(view.extensions.quality.measurementDeferred, true);
});

test('CW-BQ-003 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const competitive = createCompetitivePosition(getDefaultCompetitivePositionInput());

  assert.equal(competitive.sections.qualityFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(competitive.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(competitive.sections.aiInterpretation.caution.includes('does not assign a moat score'), true);
  assert.equal(competitive.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(competitive.sections.investorJudgment.noAutomation, true);
  assert.equal(competitive.evidenceConfidence.confidence, 'Medium');
  assert.equal(competitive.evidenceConfidence.coverage, 62);
  assert.equal(competitive.evidenceConfidence.missingEvidenceChecklist.some(item => item.priority === 'High'), true);
});

test('CW-BQ-003 guardrails prevent moat score, ranking, quality score, valuation, recommendation, and execution leakage', () => {
  const competitive = createCompetitivePosition(getDefaultCompetitivePositionInput());
  const serialized = JSON.stringify(competitive).toLowerCase();

  assert.equal(competitive.boundaries.competitiveAssessmentOnly, true);
  assert.equal(competitive.boundaries.noMoatScore, true);
  assert.equal(competitive.boundaries.noRanking, true);
  assert.equal(competitive.boundaries.noQualityScore, true);
  assert.equal(competitive.boundaries.noValuation, true);
  assert.equal(competitive.boundaries.noRecommendation, true);
  assert.equal(competitive.boundaries.noExecution, true);
  assert.equal(competitive.acceptance.noAutomatedDecision, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'intrinsic value', 'margin of safety', 'place order', 'broker connector']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('CW-BQ-004 Capital Allocation follows the capital allocation lifecycle', () => {
  const allocation = createCapitalAllocation(getDefaultCapitalAllocationInput());

  assert.equal(allocation.type, 'capital-allocation');
  assert.equal(allocation.feature.stableId, 'CW-BQ-004');
  assert.equal(allocation.feature.status, 'Released');
  assert.equal(allocation.feature.version, '1.0');
  assert.equal(allocation.feature.investorQuestion, 'Does management allocate capital effectively?');
  assert.equal(allocation.acceptance.lifecycleBasedAssessment, true);
  assert.deepEqual(allocation.acceptance.userCanUnderstand, [
    'capital allocation philosophy',
    'capital sources',
    'reinvestment strategy',
    'organic investment',
    'acquisitions',
    'shareholder returns',
    'balance sheet discipline',
    'working capital discipline',
    'capital allocation track record',
    'long-term value creation'
  ]);
});

test('CW-BQ-004 defines section-level evidence expectations', () => {
  const allocation = createCapitalAllocation(getDefaultCapitalAllocationInput());

  assert.equal(allocation.sections.evidenceExpectations.actionable, true);
  assert.deepEqual(allocation.sections.evidenceExpectations.items.map(item => item.section), [
    'Capital Allocation Philosophy',
    'Reinvestment Strategy',
    'Organic Investment',
    'Acquisitions',
    'Shareholder Returns',
    'Balance Sheet Discipline',
    'Working Capital Discipline',
    'Capital Allocation Track Record'
  ]);
  assert.equal(allocation.sections.evidenceExpectations.items.some(item => item.typicalEvidence.includes('ROIC trends')), true);
});

test('CW-BQ-004 exposes capital allocation data under FeatureView extensions.quality', () => {
  const allocation = createCapitalAllocation(getDefaultCapitalAllocationInput());
  const view = allocation.featureView;

  assert.equal(view.contract, 'FeatureView');
  assert.equal(view.id, 'CW-BQ-004');
  assert.equal(view.epic, 'Business Quality');
  assert.equal(view.feature, 'BQ.4');
  assert.equal(view.version, '1.0');
  assert.equal(view.extensions.quality.dimension, 'Capital Allocation');
  assert.equal(view.extensions.quality.capitalSources.length, 3);
  assert.equal(view.extensions.quality.allocationChoices.length, 4);
  assert.equal(view.extensions.quality.evidenceExpectations.length, 8);
  assert.equal(view.extensions.quality.measurementDeferred, true);
});

test('CW-BQ-004 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const allocation = createCapitalAllocation(getDefaultCapitalAllocationInput());

  assert.equal(allocation.sections.qualityFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(allocation.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(allocation.sections.aiInterpretation.caution.includes('does not create a capital allocation score'), true);
  assert.equal(allocation.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(allocation.sections.investorJudgment.noAutomation, true);
  assert.equal(allocation.evidenceConfidence.confidence, 'Medium');
  assert.equal(allocation.evidenceConfidence.coverage, 58);
  assert.equal(allocation.evidenceConfidence.missingEvidenceChecklist.some(item => item.priority === 'High'), true);
});

test('CW-BQ-004 guardrails prevent capital allocation score, ranking, quality score, valuation, recommendation, and execution leakage', () => {
  const allocation = createCapitalAllocation(getDefaultCapitalAllocationInput());
  const serialized = JSON.stringify(allocation).toLowerCase();

  assert.equal(allocation.boundaries.capitalAllocationAssessmentOnly, true);
  assert.equal(allocation.boundaries.noCapitalAllocationScore, true);
  assert.equal(allocation.boundaries.noRanking, true);
  assert.equal(allocation.boundaries.noQualityScore, true);
  assert.equal(allocation.boundaries.noValuation, true);
  assert.equal(allocation.boundaries.noRecommendation, true);
  assert.equal(allocation.boundaries.noExecution, true);
  assert.equal(allocation.acceptance.noAutomatedDecision, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'intrinsic value', 'margin of safety', 'place order', 'broker connector']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('CW-BQ-005 Governance Quality performs evidence-backed governance assessment without trust rating', () => {
  const governance = createGovernanceQuality(getDefaultGovernanceQualityInput());

  assert.equal(governance.type, 'governance-quality');
  assert.equal(governance.feature.stableId, 'CW-BQ-005');
  assert.equal(governance.feature.status, 'Released');
  assert.equal(governance.feature.version, '1.0');
  assert.equal(governance.feature.investorQuestion, 'Can management be trusted?');
  assert.equal(governance.acceptance.evidenceBackedGovernanceAssessment, true);
  assert.equal(governance.acceptance.noMoralJudgment, true);
  assert.deepEqual(governance.acceptance.userCanUnderstand, [
    'governance structure',
    'management alignment',
    'capital stewardship',
    'disclosure quality',
    'minority shareholder protection',
    'risk oversight',
    'governance track record'
  ]);
});

test('CW-BQ-005 defines governance evidence expectations', () => {
  const governance = createGovernanceQuality(getDefaultGovernanceQualityInput());

  assert.equal(governance.sections.evidenceExpectations.actionable, true);
  assert.deepEqual(governance.sections.evidenceExpectations.items.map(item => item.section), [
    'Governance Structure',
    'Management Alignment',
    'Capital Stewardship',
    'Disclosure Quality',
    'Minority Shareholder Protection',
    'Risk Oversight',
    'Governance Track Record'
  ]);
  assert.equal(governance.sections.evidenceExpectations.items.some(item => item.typicalEvidence.includes('Related-party transactions')), true);
});

test('CW-BQ-005 exposes governance quality data under FeatureView extensions.quality', () => {
  const governance = createGovernanceQuality(getDefaultGovernanceQualityInput());
  const view = governance.featureView;

  assert.equal(view.contract, 'FeatureView');
  assert.equal(view.id, 'CW-BQ-005');
  assert.equal(view.epic, 'Business Quality');
  assert.equal(view.feature, 'BQ.5');
  assert.equal(view.version, '1.0');
  assert.equal(view.extensions.quality.dimension, 'Governance Quality');
  assert.deepEqual(view.extensions.quality.governanceTopics, ['structure', 'alignment', 'stewardship', 'disclosure', 'minority protection', 'risk oversight', 'track record']);
  assert.equal(view.extensions.quality.evidenceExpectations.length, 7);
  assert.equal(view.extensions.quality.measurementDeferred, true);
});

test('CW-BQ-005 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const governance = createGovernanceQuality(getDefaultGovernanceQualityInput());

  assert.equal(governance.sections.qualityFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(governance.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(governance.sections.aiInterpretation.caution.includes('does not assign a governance score'), true);
  assert.equal(governance.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(governance.sections.investorJudgment.noAutomation, true);
  assert.equal(governance.evidenceConfidence.confidence, 'Low');
  assert.equal(governance.evidenceConfidence.coverage, 49);
  assert.equal(governance.evidenceConfidence.missingEvidenceChecklist.some(item => item.priority === 'High'), true);
});

test('CW-BQ-005 guardrails prevent governance score, trust rating, ranking, quality score, valuation, recommendation, and execution leakage', () => {
  const governance = createGovernanceQuality(getDefaultGovernanceQualityInput());
  const serialized = JSON.stringify(governance).toLowerCase();

  assert.equal(governance.boundaries.governanceAssessmentOnly, true);
  assert.equal(governance.boundaries.noGovernanceScore, true);
  assert.equal(governance.boundaries.noTrustRating, true);
  assert.equal(governance.boundaries.noRanking, true);
  assert.equal(governance.boundaries.noQualityScore, true);
  assert.equal(governance.boundaries.noValuation, true);
  assert.equal(governance.boundaries.noRecommendation, true);
  assert.equal(governance.boundaries.noExecution, true);
  assert.equal(governance.acceptance.noAutomatedDecision, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'intrinsic value', 'margin of safety', 'place order', 'broker connector']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('CW-BQ-006 Financial Quality assesses consistency and quality without valuation', () => {
  const financial = createFinancialQuality(getDefaultFinancialQualityInput());

  assert.equal(financial.type, 'financial-quality');
  assert.equal(financial.feature.stableId, 'CW-BQ-006');
  assert.equal(financial.feature.status, 'Released');
  assert.equal(financial.feature.version, '1.0');
  assert.equal(financial.feature.investorQuestion, 'Are profitability and cash generation consistently strong?');
  assert.equal(financial.acceptance.financialQualityNotValuation, true);
  assert.deepEqual(financial.acceptance.userCanUnderstand, [
    'profitability quality',
    'cash generation quality',
    'return quality',
    'earnings quality',
    'margin stability',
    'capital efficiency',
    'financial consistency'
  ]);
});

test('CW-BQ-006 defines financial quality evidence expectations', () => {
  const financial = createFinancialQuality(getDefaultFinancialQualityInput());

  assert.equal(financial.sections.evidenceExpectations.actionable, true);
  assert.deepEqual(financial.sections.evidenceExpectations.items.map(item => item.section), [
    'Profitability Profile',
    'Cash Generation',
    'Return on Capital',
    'Earnings Quality',
    'Margin Stability',
    'Capital Efficiency',
    'Financial Consistency'
  ]);
  assert.equal(financial.sections.evidenceExpectations.items.some(item => item.typicalEvidence.includes('ROIC')), true);
});

test('CW-BQ-006 exposes financial quality data under FeatureView extensions.quality', () => {
  const financial = createFinancialQuality(getDefaultFinancialQualityInput());
  const view = financial.featureView;

  assert.equal(view.contract, 'FeatureView');
  assert.equal(view.id, 'CW-BQ-006');
  assert.equal(view.epic, 'Business Quality');
  assert.equal(view.feature, 'BQ.6');
  assert.equal(view.version, '1.0');
  assert.equal(view.extensions.quality.dimension, 'Financial Quality');
  assert.equal(view.extensions.quality.financialDimensions.length, 7);
  assert.equal(view.extensions.quality.evidenceExpectations.length, 7);
  assert.equal(view.extensions.quality.measurementDeferred, true);
});

test('CW-BQ-006 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const financial = createFinancialQuality(getDefaultFinancialQualityInput());

  assert.equal(financial.sections.qualityFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(financial.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(financial.sections.aiInterpretation.caution.includes('does not calculate intrinsic value'), true);
  assert.equal(financial.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(financial.sections.investorJudgment.noAutomation, true);
  assert.equal(financial.evidenceConfidence.confidence, 'Low');
  assert.equal(financial.evidenceConfidence.coverage, 46);
  assert.equal(financial.evidenceConfidence.missingEvidenceChecklist.some(item => item.priority === 'High'), true);
});

test('CW-BQ-006 guardrails prevent financial score, intrinsic value, valuation, recommendation, and execution leakage', () => {
  const financial = createFinancialQuality(getDefaultFinancialQualityInput());
  const serialized = JSON.stringify(financial).toLowerCase();

  assert.equal(financial.boundaries.financialQualityAssessmentOnly, true);
  assert.equal(financial.boundaries.noFinancialQualityScore, true);
  assert.equal(financial.boundaries.noRanking, true);
  assert.equal(financial.boundaries.noQualityScore, true);
  assert.equal(financial.boundaries.noIntrinsicValue, true);
  assert.equal(financial.boundaries.noValuation, true);
  assert.equal(financial.boundaries.noRecommendation, true);
  assert.equal(financial.boundaries.noExecution, true);
  assert.equal(financial.acceptance.noAutomatedDecision, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'place order', 'broker connector']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('CW-BQ-007 Resilience assesses adaptability across adverse conditions without risk rating', () => {
  const resilience = createResilience(getDefaultResilienceInput());

  assert.equal(resilience.type, 'resilience');
  assert.equal(resilience.feature.stableId, 'CW-BQ-007');
  assert.equal(resilience.feature.status, 'Released');
  assert.equal(resilience.feature.version, '1.0');
  assert.equal(resilience.feature.investorQuestion, 'Can the business withstand adversity?');
  assert.equal(resilience.acceptance.resilienceNotRiskRating, true);
  assert.deepEqual(resilience.acceptance.userCanUnderstand, [
    'business dependence',
    'customer concentration',
    'supplier dependence',
    'geographic concentration',
    'balance sheet flexibility',
    'cash flow resilience',
    'pricing resilience',
    'historical recovery',
    'adaptive capacity'
  ]);
});

test('CW-BQ-007 defines resilience evidence expectations and shock scenarios', () => {
  const resilience = createResilience(getDefaultResilienceInput());

  assert.equal(resilience.sections.evidenceExpectations.actionable, true);
  assert.deepEqual(resilience.sections.evidenceExpectations.items.map(item => item.section), [
    'Business Dependence',
    'Customer Concentration',
    'Supplier Dependence',
    'Geographic Concentration',
    'Balance Sheet Flexibility',
    'Cash Flow Resilience',
    'Pricing Resilience',
    'Historical Recovery',
    'Adaptive Capacity'
  ]);
  assert.equal(resilience.sections.shockScenarios.items.length, 4);
});

test('CW-BQ-007 exposes resilience data under FeatureView extensions.quality', () => {
  const resilience = createResilience(getDefaultResilienceInput());
  const view = resilience.featureView;

  assert.equal(view.contract, 'FeatureView');
  assert.equal(view.id, 'CW-BQ-007');
  assert.equal(view.epic, 'Business Quality');
  assert.equal(view.feature, 'BQ.7');
  assert.equal(view.version, '1.0');
  assert.equal(view.extensions.quality.dimension, 'Resilience');
  assert.equal(view.extensions.quality.shockScenarios.length, 4);
  assert.equal(view.extensions.quality.evidenceExpectations.length, 9);
  assert.equal(view.extensions.quality.measurementDeferred, true);
});

test('CW-BQ-007 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const resilience = createResilience(getDefaultResilienceInput());

  assert.equal(resilience.sections.qualityFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(resilience.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(resilience.sections.aiInterpretation.caution.includes('does not assign a resilience score'), true);
  assert.equal(resilience.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(resilience.sections.investorJudgment.noAutomation, true);
  assert.equal(resilience.evidenceConfidence.confidence, 'Low');
  assert.equal(resilience.evidenceConfidence.coverage, 52);
  assert.equal(resilience.evidenceConfidence.missingEvidenceChecklist.some(item => item.priority === 'High'), true);
});

test('CW-BQ-007 guardrails prevent resilience score, risk rating, quality score, valuation, recommendation, and execution leakage', () => {
  const resilience = createResilience(getDefaultResilienceInput());
  const serialized = JSON.stringify(resilience).toLowerCase();

  assert.equal(resilience.boundaries.resilienceAssessmentOnly, true);
  assert.equal(resilience.boundaries.noResilienceScore, true);
  assert.equal(resilience.boundaries.noRanking, true);
  assert.equal(resilience.boundaries.noQualityScore, true);
  assert.equal(resilience.boundaries.noRiskRating, true);
  assert.equal(resilience.boundaries.noValuation, true);
  assert.equal(resilience.boundaries.noRecommendation, true);
  assert.equal(resilience.boundaries.noExecution, true);
  assert.equal(resilience.acceptance.noAutomatedDecision, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'intrinsic value', 'margin of safety', 'place order', 'broker connector']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('CW-BQ-008 Business Quality Summary synthesizes only completed Business Quality source features', () => {
  const summary = createBusinessQualitySummary();

  assert.equal(summary.type, 'business-quality-summary');
  assert.equal(summary.feature.stableId, 'CW-BQ-008');
  assert.equal(summary.feature.status, 'Released');
  assert.equal(summary.feature.version, '1.0');
  assert.equal(summary.feature.investorQuestion, 'What is the overall business quality profile?');
  assert.equal(summary.acceptance.synthesisOnly, true);
  assert.equal(summary.acceptance.usesOnlyCompletedBusinessQualityFeatures, true);
  assert.deepEqual(summary.featureView.extensions.quality.sourceFeatureIds, ['CW-BQ-001', 'CW-BQ-002', 'CW-BQ-003', 'CW-BQ-004', 'CW-BQ-005', 'CW-BQ-006', 'CW-BQ-007']);
  assert.deepEqual(summary.featureView.extensions.quality.dimension, 'Business Quality Summary');
});

test('CW-BQ-008 creates cross-feature evidence rollup without averaging confidence labels', () => {
  const summary = createBusinessQualitySummary();
  const rollup = summary.sections.crossFeatureEvidenceRollup;

  assert.equal(rollup.component, 'CrossFeatureEvidenceRollup');
  assert.equal(rollup.items.length, 7);
  assert.equal(rollup.overallCoverage, 57);
  assert.equal(rollup.overallEvidenceConfidence, 'Low');
  assert.deepEqual(rollup.lowConfidenceFeatures, ['CW-BQ-005', 'CW-BQ-006', 'CW-BQ-007']);
  assert.equal(rollup.highPriorityGaps.some(gap => gap.includes('CW-BQ-006')), true);
});

test('CW-BQ-008 summary sections reference source features instead of adding new analysis', () => {
  const summary = createBusinessQualitySummary();

  assert.equal(summary.sections.businessModelSummary.sourceFeatureId, 'CW-BQ-002');
  assert.equal(summary.sections.competitivePositionSummary.sourceFeatureId, 'CW-BQ-003');
  assert.equal(summary.sections.capitalAllocationSummary.sourceFeatureId, 'CW-BQ-004');
  assert.equal(summary.sections.governanceSummary.sourceFeatureId, 'CW-BQ-005');
  assert.equal(summary.sections.financialQualitySummary.sourceFeatureId, 'CW-BQ-006');
  assert.equal(summary.sections.resilienceSummary.sourceFeatureId, 'CW-BQ-007');
  assert.equal(summary.sections.integratedQualityProfile.sourceOnly, true);
});

test('CW-BQ-008 preserves Facts, AI Interpretation, Investor Judgment, and Evidence Confidence', () => {
  const summary = createBusinessQualitySummary();

  assert.equal(summary.sections.qualityFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(summary.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(summary.sections.aiInterpretation.caution.includes('introduces no new analysis'), true);
  assert.equal(summary.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(summary.sections.investorJudgment.noAutomation, true);
  assert.equal(summary.evidenceConfidence.confidence, 'Low');
  assert.equal(summary.evidenceConfidence.coverage, 57);
  assert.equal(summary.evidenceConfidence.notInvestmentConfidence, true);
});

test('CW-BQ-008 guardrails prevent new analysis, evidence, facts, score, valuation, recommendation, and execution', () => {
  const summary = createBusinessQualitySummary();
  const serialized = JSON.stringify(summary).toLowerCase();

  assert.equal(summary.boundaries.summaryOnly, true);
  assert.equal(summary.boundaries.noNewAnalysis, true);
  assert.equal(summary.boundaries.noNewEvidence, true);
  assert.equal(summary.boundaries.noNewFacts, true);
  assert.equal(summary.boundaries.noBusinessQualityScore, true);
  assert.equal(summary.boundaries.noRanking, true);
  assert.equal(summary.boundaries.noValuation, true);
  assert.equal(summary.boundaries.noRecommendation, true);
  assert.equal(summary.boundaries.noExecution, true);
  assert.equal(summary.acceptance.noAutomatedDecision, true);

  for (const forbidden of ['buy recommendation', 'sell recommendation', 'intrinsic value', 'margin of safety', 'place order', 'broker connector']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});
