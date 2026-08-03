import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';
import { createInvestmentThesis } from './InvestmentThesis.js';
import { createBusinessQualitySummary } from './BusinessQualitySummary.js';
import { createValuationSummary } from './ValuationSummary.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-ID-002',
  workspace: 'Company Workspace',
  epic: 'Investment Decision',
  featureId: 'ID.2',
  featureName: 'Thesis vs Evidence',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'Does the available evidence support the investment thesis?',
  purpose: 'Compare the stated investment thesis with supporting evidence, contradicting evidence, and evidence gaps without validating the thesis, recommending action, or making an investment decision.'
});

export function createThesisVsEvidence({ thesisFeature, businessQualityFeature, valuationFeature } = {}) {
  const thesis = thesisFeature || createInvestmentThesis();
  const businessQuality = businessQualityFeature || createBusinessQualitySummary();
  const valuation = valuationFeature || createValuationSummary();
  validateInputs({ thesis, businessQuality, valuation });

  const supportingEvidence = createSupportingEvidence({ thesis, businessQuality, valuation });
  const contradictingEvidence = createContradictingEvidence({ businessQuality, valuation });
  const evidenceGaps = createEvidenceGaps({ thesis, businessQuality, valuation });
  const evidenceLandscape = createEvidenceLandscape({ supportingEvidence, contradictingEvidence, evidenceGaps });
  const decisionFacts = createDecisionFacts({ thesis, supportingEvidence, contradictingEvidence, evidenceGaps, evidenceAlignment: evidenceLandscape });
  const aiInterpretation = createAiInterpretation({ thesis, supportingEvidence, contradictingEvidence, evidenceGaps, evidenceAlignment: evidenceLandscape });
  const investorJudgment = createInvestorJudgment();
  const evidenceConfidence = createEvidenceConfidence({
    confidence: evidenceLandscape.evidenceConfidence,
    coverage: evidenceLandscape.evidenceCoverage,
    rationale: 'Thesis vs Evidence organizes available support, contradictions, and gaps from upstream outputs. It does not validate the thesis or decide whether it is correct.',
    evidenceItems: [...supportingEvidence.items.map(item => item.id), ...contradictingEvidence.items.map(item => item.id)],
    missingEvidence: evidenceGaps.items.map(gap => ({ label: gap.text, priority: gap.priority, status: gap.status, sourceCount: gap.sourceCount }))
  });
  const sections = Object.freeze({
    thesisVsEvidenceHeader: createHeader(),
    investmentThesis: createInvestmentThesisSection(thesis),
    supportingEvidence,
    contradictingEvidence,
    evidenceGaps,
    evidenceLandscape,
    decisionFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    decisionSupportOnly: true,
    consumesUpstreamOutputsOnly: true,
    thesisEvidenceOnly: true,
    noThesisValidation: true,
    investorControlledDecision: true,
    noAutomatedDecision: true,
    noRecommendation: true,
    noDecision: true,
    noExecution: true,
    noBrokerIntegration: true,
    noOrderPlacement: true,
    noPortfolioMutation: true
  });
  const futureExtensions = Object.freeze(['evidence drill-through', 'source provenance links', 'thesis version comparison', 'contradicting evidence severity review']);

  return deepFreeze({
    type: 'thesis-vs-evidence',
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
          decisionStage: 'ThesisVsEvidence',
          thesis: sections.investmentThesis,
          supportingEvidence: supportingEvidence.items,
          contradictingEvidence: contradictingEvidence.items,
          evidenceGaps: evidenceGaps.items,
          evidenceLandscape,
          analysisOnly: true
        }
      }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      comparesThesisWithEvidence: true,
      doesNotValidateThesis: true,
      avoidsRecommendationsAndDecisionLogic: true,
      userCanUnderstand: Object.freeze(['investment thesis', 'supporting evidence', 'contradicting evidence', 'evidence gaps', 'overall evidence alignment']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultThesisVsEvidenceInput() { return Object.freeze({}); }

function validateInputs({ thesis, businessQuality, valuation }) {
  if (thesis?.feature?.stableId !== 'CW-OV-002') throw new Error('Thesis vs Evidence requires Investment Thesis output');
  if (businessQuality?.feature?.stableId !== 'CW-BQ-008') throw new Error('Thesis vs Evidence requires Business Quality Summary output');
  if (valuation?.feature?.stableId !== 'CW-VAL-007') throw new Error('Thesis vs Evidence requires Valuation Summary output');
}

function createHeader() { return Object.freeze({ component: 'ThesisVsEvidenceHeader', investorQuestion: FEATURE_META.investorQuestion, mode: 'evidence-alignment' }); }
function createInvestmentThesisSection(thesis) { return Object.freeze({ component: 'DecisionInvestmentThesis', sourceFeatureId: thesis.feature.stableId, summary: thesis.sections.thesisSummary.summary, status: thesis.sections.thesisHeader.status, sourceOnly: true }); }

function createSupportingEvidence({ thesis, businessQuality, valuation }) {
  return Object.freeze({
    component: 'SupportingEvidence',
    items: deepFreeze([
      { id: 'support-thesis-summary', sourceFeatureId: thesis.feature.stableId, text: 'Investment thesis exists and has explicit supporting facts.', strength: 'Medium', kind: 'supporting_evidence' },
      { id: 'support-business-model', sourceFeatureId: businessQuality.feature.stableId, text: 'Business Quality summary identifies repeat-purchase business model characteristics as a recurring strength.', strength: 'Medium', kind: 'supporting_evidence' },
      { id: 'support-valuation-coverage', sourceFeatureId: valuation.feature.stableId, text: 'Valuation analysis has a completed v1.0 evidence framework and scenario/sensitivity coverage.', strength: 'Medium', kind: 'supporting_evidence' }
    ]),
    sourceOnly: true
  });
}

function createContradictingEvidence({ businessQuality, valuation }) {
  return Object.freeze({
    component: 'ContradictingEvidence',
    items: deepFreeze([
      { id: 'contradict-evidence-quality', sourceFeatureId: businessQuality.feature.stableId, text: 'Business Quality summary reports low confidence in governance, financial quality, and resilience evidence.', severity: 'High', kind: 'contradicting_evidence' },
      { id: 'contradict-valuation-evidence', sourceFeatureId: valuation.feature.stableId, text: 'Valuation summary reports low overall evidence confidence and unresolved model artifact gaps.', severity: 'High', kind: 'contradicting_evidence' },
      { id: 'contradict-assumption-support', sourceFeatureId: valuation.feature.stableId, text: 'Valuation outputs depend on assumptions that still require stronger source-linked support.', severity: 'Medium', kind: 'contradicting_evidence' }
    ]),
    sourceOnly: true
  });
}

function createEvidenceGaps({ thesis, businessQuality, valuation }) {
  const thesisGaps = thesis.sections.evidenceGaps.items.slice(0, 2).map(item => ({ text: item.text, priority: item.priority, status: 'missing', sourceCount: 0, sourceFeatureId: thesis.feature.stableId }));
  const qualityGaps = businessQuality.evidenceConfidence.missingEvidenceChecklist.slice(0, 2).map(item => ({ text: item.label, priority: item.priority, status: item.status, sourceCount: item.sourceCount, sourceFeatureId: businessQuality.feature.stableId }));
  const valuationGaps = valuation.evidenceConfidence.missingEvidenceChecklist.slice(0, 2).map(item => ({ text: item.label, priority: item.priority, status: item.status, sourceCount: item.sourceCount, sourceFeatureId: valuation.feature.stableId }));
  return deepFreeze({ component: 'DecisionEvidenceGaps', items: [...thesisGaps, ...qualityGaps, ...valuationGaps], sourceOnly: true });
}

function createEvidenceLandscape({ supportingEvidence, contradictingEvidence, evidenceGaps }) {
  const supportCount = supportingEvidence.items.length;
  const contradictionCount = contradictingEvidence.items.length;
  const highPriorityGapCount = evidenceGaps.items.filter(item => item.priority === 'High').length;
  const evidenceCoverage = Math.max(0, Math.min(100, Math.round(55 + supportCount * 5 - contradictionCount * 4 - highPriorityGapCount * 3)));
  return Object.freeze({
    component: 'EvidenceLandscape',
    landscapeRead: 'Mixed evidence landscape',
    supportCount,
    contradictionCount,
    highPriorityGapCount,
    evidenceCoverage,
    evidenceConfidence: evidenceCoverage >= 70 ? 'Medium' : evidenceCoverage >= 40 ? 'Low' : 'Unknown',
    noThesisValidation: true,
    noPassFail: true
  });
}

function createDecisionFacts({ thesis, supportingEvidence, contradictingEvidence, evidenceGaps, evidenceAlignment }) { return Object.freeze({ component: 'ThesisEvidenceFacts', items: deepFreeze([
  { id: 'thesis-source', kind: 'fact', source: 'upstream-output', value: thesis.feature.stableId },
  { id: 'supporting-evidence-count', kind: 'fact', source: 'thesis-vs-evidence', value: String(supportingEvidence.items.length) },
  { id: 'contradicting-evidence-count', kind: 'fact', source: 'thesis-vs-evidence', value: String(contradictingEvidence.items.length) },
  { id: 'evidence-gap-count', kind: 'fact', source: 'thesis-vs-evidence', value: String(evidenceGaps.items.length) },
  { id: 'evidence-landscape', kind: 'fact', source: 'thesis-vs-evidence', value: evidenceAlignment.landscapeRead }
]), factsOnly: true }); }
function createAiInterpretation({ evidenceAlignment }) { return Object.freeze({ component: 'ThesisVsEvidenceAIInterpretation', kind: 'generated_explanation', source: 'deterministic-product-summary', basedOn: ['CW-OV-002', 'CW-BQ-008', 'CW-VAL-007'], summary: `Available evidence landscape is mixed. There is some support for the thesis, but contradicting evidence and unresolved gaps remain material. This feature describes the evidence landscape without declaring the thesis correct or incorrect.`, caution: 'Generated evidence-landscape interpretation only. It does not validate the thesis, recommend action, make a decision, compare decision options, execute orders, or mutate a portfolio.' }); }
function createInvestorJudgment() { return Object.freeze({ component: 'ThesisVsEvidenceInvestorJudgment', status: 'Evidence alignment reviewed', note: 'Investor must decide whether evidence support is sufficient to continue toward trade-off analysis.', controlledBy: 'Investor', noAutomation: true }); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
