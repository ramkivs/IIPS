import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';
import { createBusinessQualitySnapshot } from './BusinessQualitySnapshot.js';
import { createBusinessModelQuality } from './BusinessModelQuality.js';
import { createCompetitivePosition } from './CompetitivePosition.js';
import { createCapitalAllocation } from './CapitalAllocation.js';
import { createGovernanceQuality } from './GovernanceQuality.js';
import { createFinancialQuality } from './FinancialQuality.js';
import { createResilience } from './Resilience.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-BQ-008',
  workspace: 'Company Workspace',
  epic: 'Business Quality',
  featureId: 'BQ.8',
  featureName: 'Business Quality Summary',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'What is the overall business quality profile?',
  purpose: 'Synthesize the completed Business Quality features into an integrated quality profile without adding new analysis, new evidence, or new facts.'
});

export function createBusinessQualitySummary({ features } = {}) {
  const sourceFeatures = Object.freeze(features || [
    createBusinessQualitySnapshot(),
    createBusinessModelQuality(),
    createCompetitivePosition(),
    createCapitalAllocation(),
    createGovernanceQuality(),
    createFinancialQuality(),
    createResilience()
  ]);
  validateSourceFeatures(sourceFeatures);

  const evidenceRollup = createCrossFeatureEvidenceRollup(sourceFeatures);
  const qualityFacts = createSummaryFacts(sourceFeatures, evidenceRollup);
  const aiInterpretation = createAiInterpretation(sourceFeatures, evidenceRollup);
  const investorJudgment = createInvestorJudgment();
  const evidenceConfidence = createEvidenceConfidence({
    confidence: evidenceRollup.overallEvidenceConfidence,
    coverage: evidenceRollup.overallCoverage,
    rationale: 'Business Quality Summary aggregates evidence coverage from completed Business Quality features. It does not introduce new evidence or close evidence gaps.',
    evidenceItems: sourceFeatures.map(feature => feature.feature.stableId),
    missingEvidence: evidenceRollup.highPriorityGaps.map(gap => ({ label: gap, priority: 'High', status: 'missing', sourceCount: 0 }))
  });
  const sections = Object.freeze({
    businessQualitySummaryHeader: createHeader(),
    businessModelSummary: createFeatureSummary(sourceFeatures[1]),
    competitivePositionSummary: createFeatureSummary(sourceFeatures[2]),
    capitalAllocationSummary: createFeatureSummary(sourceFeatures[3]),
    governanceSummary: createFeatureSummary(sourceFeatures[4]),
    financialQualitySummary: createFeatureSummary(sourceFeatures[5]),
    resilienceSummary: createFeatureSummary(sourceFeatures[6]),
    integratedQualityProfile: createIntegratedQualityProfile(sourceFeatures, evidenceRollup),
    crossFeatureEvidenceRollup: evidenceRollup,
    qualityFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    summaryOnly: true,
    noNewAnalysis: true,
    noNewEvidence: true,
    noNewFacts: true,
    noBusinessQualityScore: true,
    noRanking: true,
    noValuation: true,
    noRecommendation: true,
    noExecution: true
  });
  const futureExtensions = Object.freeze(['source feature drill-through', 'evidence gap prioritization', 'business quality release comparison']);

  return deepFreeze({
    type: 'business-quality-summary',
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
      facts: qualityFacts.items,
      aiInterpretation,
      investorJudgment,
      evidenceConfidence,
      guardrails,
      sections,
      metadata: { workspace: FEATURE_META.workspace, status: FEATURE_META.status, futureExtensions },
      extensions: {
        quality: {
          dimension: 'Business Quality Summary',
          sourceFeatureIds: sourceFeatures.map(feature => feature.feature.stableId),
          evidenceRollup,
          synthesisOnly: true
        }
      }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      synthesisOnly: true,
      usesOnlyCompletedBusinessQualityFeatures: true,
      userCanUnderstand: Object.freeze(['business model summary', 'competitive position summary', 'capital allocation summary', 'governance summary', 'financial quality summary', 'resilience summary', 'integrated business quality profile', 'cross-feature evidence rollup']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultBusinessQualitySummaryInput() {
  return Object.freeze({});
}

function validateSourceFeatures(features) {
  const expected = ['CW-BQ-001', 'CW-BQ-002', 'CW-BQ-003', 'CW-BQ-004', 'CW-BQ-005', 'CW-BQ-006', 'CW-BQ-007'];
  const actual = features.map(feature => feature?.feature?.stableId);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Business Quality Summary requires completed source features: ${expected.join(', ')}`);
}

function createHeader() {
  return Object.freeze({ component: 'BusinessQualitySummaryHeader', investorQuestion: FEATURE_META.investorQuestion, source: 'completed-business-quality-features' });
}

function createFeatureSummary(feature) {
  return Object.freeze({
    component: 'BusinessQualityFeatureSummary',
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

function createCrossFeatureEvidenceRollup(features) {
  const items = features.map(feature => Object.freeze({
    featureId: feature.feature.stableId,
    featureName: feature.feature.featureName,
    confidence: feature.evidenceConfidence.confidence,
    coverage: feature.evidenceConfidence.coverage,
    missingEvidenceCount: feature.evidenceConfidence.missingEvidenceChecklist.length
  }));
  const total = items.reduce((sum, item) => sum + item.coverage, 0);
  const overallCoverage = Math.round(total / items.length);
  const lowConfidenceFeatures = items.filter(item => item.confidence === 'Low').map(item => item.featureId);
  const highPriorityGaps = features.flatMap(feature => feature.evidenceConfidence.missingEvidenceChecklist
    .filter(item => item.priority === 'High')
    .map(item => `${feature.feature.stableId}: ${item.label}`));
  return deepFreeze({
    component: 'CrossFeatureEvidenceRollup',
    items,
    overallCoverage,
    overallCoverageLabel: `Overall Evidence Coverage: ${overallCoverage}%`,
    overallEvidenceConfidence: overallCoverage >= 85 ? 'High' : overallCoverage >= 60 ? 'Medium' : overallCoverage > 0 ? 'Low' : 'Unknown',
    lowConfidenceFeatures,
    highPriorityGaps,
    sourceOnly: true
  });
}

function createIntegratedQualityProfile(features, evidenceRollup) {
  return Object.freeze({
    component: 'IntegratedQualityProfile',
    summary: 'The business quality profile is directionally organized but evidence remains incomplete. Business model and competitive position have medium evidence coverage, while governance, financial quality, and resilience require significant source-linked research before a strong quality conclusion can be formed.',
    recurringStrengths: Object.freeze(['repeat-purchase business model characteristics', 'possible distribution and brand-related durability', 'structured capital allocation questions identified']),
    recurringUncertainties: Object.freeze(['governance evidence gaps', 'financial quality evidence gaps', 'resilience evidence gaps', 'pricing power evidence gaps']),
    evidenceConstraint: evidenceRollup.overallCoverageLabel,
    sourceOnly: true
  });
}

function createSummaryFacts(features, evidenceRollup) {
  return Object.freeze({
    component: 'BusinessQualitySummaryFacts',
    items: deepFreeze([
      { id: 'source-features', kind: 'fact', source: 'business-quality-summary', value: features.map(feature => feature.feature.stableId).join(', ') },
      { id: 'overall-evidence-coverage', kind: 'fact', source: 'cross-feature-evidence-rollup', value: `${evidenceRollup.overallCoverage}%` },
      { id: 'overall-evidence-confidence', kind: 'fact', source: 'cross-feature-evidence-rollup', value: evidenceRollup.overallEvidenceConfidence },
      { id: 'low-confidence-features', kind: 'fact', source: 'cross-feature-evidence-rollup', value: evidenceRollup.lowConfidenceFeatures.join(', ') }
    ]),
    factsOnly: true
  });
}

function createAiInterpretation(features, evidenceRollup) {
  const recurringEvidenceGaps = evidenceRollup.lowConfidenceFeatures.join(', ');
  return Object.freeze({
    component: 'BusinessQualitySummaryAIInterpretation',
    kind: 'generated_explanation',
    source: 'deterministic-product-summary',
    basedOn: features.map(feature => feature.feature.stableId),
    summary: `Business Quality synthesis uses only completed source features. The current profile has ${evidenceRollup.overallCoverage}% evidence coverage, with lower-confidence areas concentrated in ${recurringEvidenceGaps}. Further research should prioritize recurring evidence gaps before forming a strong quality conclusion.`,
    caution: 'Generated synthesis only. It introduces no new analysis, no new evidence, no new facts, no business quality score, no valuation, and no recommendation.'
  });
}

function createInvestorJudgment() {
  return Object.freeze({ component: 'BusinessQualitySummaryInvestorJudgment', status: 'Synthesis reviewed', note: 'Investor must decide whether the current evidence is sufficient to support a business quality conclusion. This summary does not score or recommend.', controlledBy: 'Investor', noAutomation: true });
}

function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
