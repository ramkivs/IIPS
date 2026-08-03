import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';
import { createDecisionSnapshot } from './DecisionSnapshot.js';
import { createThesisVsEvidence } from './ThesisVsEvidence.js';
import { createQualityValuationTradeoff } from './QualityValuationTradeoff.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-ID-004',
  workspace: 'Company Workspace',
  epic: 'Investment Decision',
  featureId: 'ID.4',
  featureName: 'Decision Options',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'What decision paths are available?',
  purpose: 'Present reasonable investor-controlled decision options with supporting considerations, limiting considerations, and open questions without ranking, preferring, recommending, deciding, or executing any option.'
});

export function createDecisionOptions({ decisionSnapshotFeature, thesisVsEvidenceFeature, tradeoffFeature } = {}) {
  const decisionSnapshot = decisionSnapshotFeature || createDecisionSnapshot();
  const thesisVsEvidence = thesisVsEvidenceFeature || createThesisVsEvidence();
  const tradeoff = tradeoffFeature || createQualityValuationTradeoff();
  validateInputs({ decisionSnapshot, thesisVsEvidence, tradeoff });

  const decisionOptions = createAvailableDecisionOptions();
  const supportingConsiderations = createSupportingConsiderations({ thesisVsEvidence, tradeoff });
  const limitingConsiderations = createLimitingConsiderations({ thesisVsEvidence, tradeoff });
  const openQuestions = createOpenQuestions({ thesisVsEvidence, tradeoff });
  const optionComparison = createOptionComparison({ decisionOptions, supportingConsiderations, limitingConsiderations, openQuestions });
  const decisionFacts = createDecisionFacts({ decisionOptions, optionComparison });
  const aiInterpretation = createAiInterpretation({ decisionOptions, optionComparison });
  const investorJudgment = createInvestorJudgment();
  const evidenceConfidence = createEvidenceConfidence({
    confidence: optionComparison.evidenceConfidence,
    coverage: optionComparison.evidenceCoverage,
    rationale: 'Decision Options uses upstream decision context, thesis/evidence landscape, and quality-valuation tradeoff to describe available decision paths. It does not rank or recommend options.',
    evidenceItems: decisionOptions.items.map(option => option.optionId),
    missingEvidence: openQuestions.items.map(item => ({ label: item.question, priority: item.priority, status: 'missing', sourceCount: 0 }))
  });
  const sections = Object.freeze({
    decisionOptionsHeader: createHeader(),
    currentDecisionContext: createCurrentDecisionContext(decisionSnapshot),
    availableDecisionOptions: decisionOptions,
    supportingConsiderations,
    limitingConsiderations,
    openQuestions,
    optionComparisonMatrix: optionComparison,
    decisionFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    decisionSupportOnly: true,
    consumesUpstreamOutputsOnly: true,
    decisionOptionsOnly: true,
    noOptionRanking: true,
    noPreferredOption: true,
    investorControlledDecision: true,
    noAutomatedDecision: true,
    noRecommendation: true,
    noDecision: true,
    noExecution: true,
    noBrokerIntegration: true,
    noOrderPlacement: true,
    noPortfolioMutation: true
  });
  const futureExtensions = Object.freeze(['custom option labels', 'option evidence drill-through', 'decision option history']);

  return deepFreeze({
    type: 'decision-options',
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
          decisionStage: 'DecisionOptions',
          decisionOptions: decisionOptions.items,
          supportingConsiderations: supportingConsiderations.items,
          limitingConsiderations: limitingConsiderations.items,
          openQuestions: openQuestions.items,
          optionComparison,
          analysisOnly: true
        }
      }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      enumeratesOptionsWithoutRanking: true,
      avoidsRecommendationsAndDecisionLogic: true,
      userCanUnderstand: Object.freeze(['current decision context', 'available decision options', 'supporting considerations', 'limiting considerations', 'open questions', 'option comparison matrix']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultDecisionOptionsInput() { return Object.freeze({}); }

function validateInputs({ decisionSnapshot, thesisVsEvidence, tradeoff }) {
  if (decisionSnapshot?.feature?.stableId !== 'CW-ID-001') throw new Error('Decision Options requires Decision Snapshot output');
  if (thesisVsEvidence?.feature?.stableId !== 'CW-ID-002') throw new Error('Decision Options requires Thesis vs Evidence output');
  if (tradeoff?.feature?.stableId !== 'CW-ID-003') throw new Error('Decision Options requires Quality-Valuation Tradeoff output');
}

function createHeader() { return Object.freeze({ component: 'DecisionOptionsHeader', investorQuestion: FEATURE_META.investorQuestion, mode: 'option-enumeration' }); }
function createCurrentDecisionContext(decisionSnapshot) { return Object.freeze({ component: 'CurrentDecisionContext', sourceFeatureId: decisionSnapshot.feature.stableId, evidenceConfidence: decisionSnapshot.evidenceConfidence.confidence, evidenceCoverage: decisionSnapshot.evidenceConfidence.coverage, sourceOnly: true }); }
function createAvailableDecisionOptions() { return Object.freeze({ component: 'AvailableDecisionPaths', items: deepFreeze([
  { optionId: 'continue-research', label: 'Continue Research', description: 'Defer final decision until evidence gaps are addressed.', investorControlled: true },
  { optionId: 'consider-entry', label: 'Consider Entry', description: 'Consider whether available evidence is sufficient to support initiating or adding exposure.', investorControlled: true },
  { optionId: 'wait', label: 'Wait', description: 'Take no immediate action while monitoring valuation, evidence, or business developments.', investorControlled: true },
  { optionId: 'avoid', label: 'Avoid', description: 'Decide not to pursue ownership under current evidence and valuation context.', investorControlled: true }
]), noRanking: true, noPreferredOption: true }); }
function createSupportingConsiderations({ thesisVsEvidence, tradeoff }) { return Object.freeze({ component: 'SupportingConsiderations', items: deepFreeze([
  { id: 'support-thesis-evidence', sourceFeatureId: thesisVsEvidence.feature.stableId, text: 'Some thesis support exists in upstream evidence landscape.', appliesTo: ['continue-research', 'consider-entry'] },
  { id: 'support-repeat-purchase-quality', sourceFeatureId: tradeoff.feature.stableId, text: 'Repeat-purchase business characteristics may support valuation assumptions if evidence improves.', appliesTo: ['continue-research', 'consider-entry'] },
  { id: 'support-wait-monitor', sourceFeatureId: tradeoff.feature.stableId, text: 'Evidence gaps make monitoring and further research a reasonable path.', appliesTo: ['continue-research', 'wait'] }
]), sourceOnly: true }); }
function createLimitingConsiderations({ thesisVsEvidence, tradeoff }) { return Object.freeze({ component: 'LimitingConsiderations', items: deepFreeze([
  { id: 'limit-evidence-gaps', sourceFeatureId: thesisVsEvidence.feature.stableId, text: 'Contradicting evidence and high-priority gaps remain material.', appliesTo: ['consider-entry'] },
  { id: 'limit-tradeoff-tension', sourceFeatureId: tradeoff.feature.stableId, text: 'Quality and valuation both have evidence gaps that create unresolved tradeoff tension.', appliesTo: ['consider-entry'] },
  { id: 'limit-avoid-premature', sourceFeatureId: thesisVsEvidence.feature.stableId, text: 'Avoiding may be premature if evidence gaps are unresolved rather than negative.', appliesTo: ['avoid'] }
]), sourceOnly: true }); }
function createOpenQuestions({ thesisVsEvidence, tradeoff }) { return Object.freeze({ component: 'DecisionOpenQuestions', items: deepFreeze([
  { id: 'open-thesis-gaps', sourceFeatureId: thesisVsEvidence.feature.stableId, question: 'Which thesis evidence gaps must be closed before deciding?', priority: 'High' },
  { id: 'open-quality-gaps', sourceFeatureId: tradeoff.feature.stableId, question: 'Do quality evidence gaps materially change the decision context?', priority: 'High' },
  { id: 'open-valuation-gaps', sourceFeatureId: tradeoff.feature.stableId, question: 'Are valuation assumptions sufficiently supported to rely on the current range?', priority: 'High' },
  { id: 'open-decision-standard', sourceFeatureId: thesisVsEvidence.feature.stableId, question: 'What evidence threshold does the investor require before choosing a path?', priority: 'Medium' }
]), sourceOnly: true }); }
function createOptionComparison({ decisionOptions, supportingConsiderations, limitingConsiderations, openQuestions }) { return Object.freeze({ component: 'DecisionPathComparison', items: deepFreeze(decisionOptions.items.map(option => ({ optionId: option.optionId, label: option.label, supportingConsiderationCount: supportingConsiderations.items.filter(item => item.appliesTo.includes(option.optionId)).length, limitingConsiderationCount: limitingConsiderations.items.filter(item => item.appliesTo.includes(option.optionId)).length, openQuestionCount: openQuestions.items.length }))), noRanking: true, noPreferredOption: true, evidenceCoverage: 55, evidenceConfidence: 'Low' }); }
function createDecisionFacts({ decisionOptions, optionComparison }) { return Object.freeze({ component: 'DecisionOptionFacts', items: deepFreeze([
  { id: 'option-count', kind: 'fact', source: 'decision-options', value: String(decisionOptions.items.length) },
  { id: 'option-ids', kind: 'fact', source: 'decision-options', value: decisionOptions.items.map(option => option.optionId).join(', ') },
  { id: 'option-ranking', kind: 'fact', source: 'decision-options', value: 'No ranking provided' },
  { id: 'preferred-option', kind: 'fact', source: 'decision-options', value: 'No preferred option provided' },
  { id: 'option-evidence-coverage', kind: 'fact', source: 'decision-options', value: `${optionComparison.evidenceCoverage}%` }
]), factsOnly: true }); }
function createAiInterpretation({ decisionOptions, optionComparison }) { return Object.freeze({ component: 'DecisionOptionsAIInterpretation', kind: 'generated_explanation', source: 'deterministic-product-summary', basedOn: ['CW-ID-001', 'CW-ID-002', 'CW-ID-003'], summary: `There are ${decisionOptions.items.length} investor-controlled decision paths available. The option comparison matrix is descriptive only and provides no ranking or preferred option.`, caution: 'Generated decision-options interpretation only. It does not rank options, prefer an option, recommend action, make a decision, execute orders, integrate with brokers, or mutate a portfolio.' }); }
function createInvestorJudgment() { return Object.freeze({ component: 'DecisionOptionsInvestorJudgment', status: 'Decision options reviewed', note: 'Investor must decide which path, if any, deserves a rationale in the next step.', controlledBy: 'Investor', noAutomation: true }); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
