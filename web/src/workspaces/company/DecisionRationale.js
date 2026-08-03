import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';
import { createDecisionSnapshot } from './DecisionSnapshot.js';
import { createThesisVsEvidence } from './ThesisVsEvidence.js';
import { createQualityValuationTradeoff } from './QualityValuationTradeoff.js';
import { createDecisionOptions } from './DecisionOptions.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-ID-005',
  workspace: 'Company Workspace',
  epic: 'Investment Decision',
  featureId: 'ID.5',
  featureName: 'Decision Rationale',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'Why would I choose one path over another?',
  purpose: 'Help the investor document the reasoning behind a selected decision path, including supporting reasons, reservations, assumptions, and outstanding questions, without scoring the rationale, recommending, deciding, or executing.'
});

const DEFAULT_INVESTOR_RATIONALE = Object.freeze({
  selectedDecisionPath: Object.freeze({ optionId: 'continue-research', label: 'Continue Research', selectedBy: 'Investor' }),
  supportingReasons: Object.freeze([
    Object.freeze({ id: 'reason-thesis-potential', text: 'The thesis has some support from repeat-purchase business characteristics.', sourceFeatureId: 'CW-ID-002' }),
    Object.freeze({ id: 'reason-tradeoff-visible', text: 'The quality–valuation tradeoff is explicit and inspectable.', sourceFeatureId: 'CW-ID-003' })
  ]),
  reservations: Object.freeze([
    Object.freeze({ id: 'reservation-evidence-gaps', text: 'Governance, financial quality, valuation model artifacts, and resilience evidence remain incomplete.', sourceFeatureId: 'CW-ID-003' }),
    Object.freeze({ id: 'reservation-valuation-support', text: 'Valuation assumptions require stronger source-linked support before a high-conviction decision.', sourceFeatureId: 'CW-ID-003' })
  ]),
  keyAssumptions: Object.freeze([
    Object.freeze({ id: 'assumption-evidence-can-improve', text: 'Further research can materially improve evidence confidence.' }),
    Object.freeze({ id: 'assumption-no-urgent-action', text: 'There is no need to force a decision before closing high-priority gaps.' })
  ]),
  outstandingQuestions: Object.freeze([
    Object.freeze({ id: 'question-governance', text: 'Do governance documents support confidence in management alignment?', priority: 'High' }),
    Object.freeze({ id: 'question-financial-quality', text: 'Do multi-year financials support durable profitability and cash generation?', priority: 'High' }),
    Object.freeze({ id: 'question-valuation-model', text: 'Are valuation model artifacts and assumptions sufficiently source-backed?', priority: 'High' })
  ]),
  decisionBasis: Object.freeze({ text: 'Continue research until high-priority evidence gaps are closed.', recordedBy: 'Investor', status: 'Draft rationale' })
});

export function createDecisionRationale({ decisionSnapshotFeature, thesisVsEvidenceFeature, tradeoffFeature, decisionOptionsFeature, investorRationale = DEFAULT_INVESTOR_RATIONALE } = {}) {
  const decisionSnapshot = decisionSnapshotFeature || createDecisionSnapshot();
  const thesisVsEvidence = thesisVsEvidenceFeature || createThesisVsEvidence();
  const tradeoff = tradeoffFeature || createQualityValuationTradeoff();
  const decisionOptions = decisionOptionsFeature || createDecisionOptions();
  validateInputs({ decisionSnapshot, thesisVsEvidence, tradeoff, decisionOptions });
  const rationale = normalizeRationale(investorRationale);

  const selectedDecisionPath = createSelectedDecisionPath(rationale);
  const supportingReasons = createSupportingReasons(rationale);
  const reservations = createReservations(rationale);
  const keyAssumptions = createKeyAssumptions(rationale);
  const outstandingQuestions = createOutstandingQuestions(rationale);
  const decisionBasis = createDecisionBasis(rationale);
  const decisionFacts = createDecisionFacts({ selectedDecisionPath, supportingReasons, reservations, outstandingQuestions, decisionBasis });
  const aiInterpretation = createAiInterpretation({ selectedDecisionPath, supportingReasons, reservations, outstandingQuestions });
  const investorJudgment = createInvestorJudgment();
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Medium',
    coverage: 63,
    rationale: 'Decision Rationale records investor-owned reasoning and links it to prior decision-support outputs. Confidence reflects documentation completeness, not correctness of the rationale.',
    evidenceItems: ['selected decision path', 'supporting reasons', 'reservations', 'key assumptions', 'outstanding questions', 'decision basis'],
    missingEvidence: outstandingQuestions.items.map(item => ({ label: item.text, priority: item.priority, status: 'missing', sourceCount: 0 }))
  });
  const sections = Object.freeze({
    decisionRationaleHeader: createHeader(),
    selectedDecisionPath,
    supportingReasons,
    reservationsAndRisks: reservations,
    keyAssumptions,
    outstandingQuestions,
    decisionBasis,
    decisionFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    decisionSupportOnly: true,
    consumesUpstreamOutputsOnly: true,
    decisionRationaleOnly: true,
    investorOwnedRationale: true,
    noRationaleScoring: true,
    investorControlledDecision: true,
    noAutomatedDecision: true,
    noRecommendation: true,
    noDecision: true,
    noExecution: true,
    noBrokerIntegration: true,
    noOrderPlacement: true,
    noPortfolioMutation: true
  });
  const futureExtensions = Object.freeze(['rationale version history', 'evidence link attachments', 'rationale templates', 'investor signature workflow']);

  return deepFreeze({
    type: 'decision-rationale',
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
          decisionStage: 'DecisionRationale',
          selectedDecisionPath,
          supportingReasons: supportingReasons.items,
          reservations: reservations.items,
          keyAssumptions: keyAssumptions.items,
          outstandingQuestions: outstandingQuestions.items,
          decisionBasis,
          analysisOnly: true
        }
      }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      investorOwnedRationale: true,
      avoidsRationaleScoringRecommendationsAndDecisionLogic: true,
      userCanUnderstand: Object.freeze(['selected decision path', 'supporting reasons', 'reservations and risks', 'key assumptions', 'outstanding questions', 'decision basis']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultDecisionRationaleInput() { return Object.freeze({ investorRationale: DEFAULT_INVESTOR_RATIONALE }); }

function validateInputs({ decisionSnapshot, thesisVsEvidence, tradeoff, decisionOptions }) {
  if (decisionSnapshot?.feature?.stableId !== 'CW-ID-001') throw new Error('Decision Rationale requires Decision Snapshot output');
  if (thesisVsEvidence?.feature?.stableId !== 'CW-ID-002') throw new Error('Decision Rationale requires Thesis vs Evidence output');
  if (tradeoff?.feature?.stableId !== 'CW-ID-003') throw new Error('Decision Rationale requires Quality-Valuation Tradeoff output');
  if (decisionOptions?.feature?.stableId !== 'CW-ID-004') throw new Error('Decision Rationale requires Decision Options output');
}

function createHeader() { return Object.freeze({ component: 'DecisionRationaleHeader', investorQuestion: FEATURE_META.investorQuestion, mode: 'investor-owned-rationale' }); }
function createSelectedDecisionPath(rationale) { return Object.freeze({ component: 'SelectedDecisionPath', ...rationale.selectedDecisionPath, investorSelected: true }); }
function createSupportingReasons(rationale) { return Object.freeze({ component: 'SupportingReasons', items: rationale.supportingReasons, sourceLinked: true }); }
function createReservations(rationale) { return Object.freeze({ component: 'ReservationsAndRisks', items: rationale.reservations, sourceLinked: true }); }
function createKeyAssumptions(rationale) { return Object.freeze({ component: 'DecisionKeyAssumptions', items: rationale.keyAssumptions, investorOwned: true }); }
function createOutstandingQuestions(rationale) { return Object.freeze({ component: 'OutstandingQuestions', items: rationale.outstandingQuestions, sourceLinked: false }); }
function createDecisionBasis(rationale) { return Object.freeze({ component: 'DecisionBasis', ...rationale.decisionBasis, investorOwned: true, noAutomation: true }); }
function createDecisionFacts({ selectedDecisionPath, supportingReasons, reservations, outstandingQuestions, decisionBasis }) { return Object.freeze({ component: 'DecisionRationaleFacts', items: deepFreeze([
  { id: 'selected-decision-path', kind: 'fact', source: 'investor-rationale', value: selectedDecisionPath.optionId },
  { id: 'supporting-reason-count', kind: 'fact', source: 'investor-rationale', value: String(supportingReasons.items.length) },
  { id: 'reservation-count', kind: 'fact', source: 'investor-rationale', value: String(reservations.items.length) },
  { id: 'outstanding-question-count', kind: 'fact', source: 'investor-rationale', value: String(outstandingQuestions.items.length) },
  { id: 'decision-basis-status', kind: 'fact', source: 'investor-rationale', value: decisionBasis.status }
]), factsOnly: true }); }
function createAiInterpretation({ selectedDecisionPath, supportingReasons, reservations, outstandingQuestions }) { return Object.freeze({ component: 'DecisionRationaleAIInterpretation', kind: 'generated_explanation', source: 'deterministic-product-summary', basedOn: ['CW-ID-001', 'CW-ID-002', 'CW-ID-003', 'CW-ID-004'], summary: `Investor-selected path is ${selectedDecisionPath.label}. The rationale includes ${supportingReasons.items.length} supporting reasons, ${reservations.items.length} reservations, and ${outstandingQuestions.items.length} outstanding questions. This feature records reasoning without judging whether it is correct.`, caution: 'Generated rationale interpretation only. It does not score the rationale, recommend a decision, automate a decision, execute orders, integrate with brokers, or mutate a portfolio.' }); }
function createInvestorJudgment() { return Object.freeze({ component: 'DecisionRationaleInvestorJudgment', status: 'Rationale documented', note: 'Investor owns the rationale and may revise it before final decision summary.', controlledBy: 'Investor', noAutomation: true }); }

function normalizeRationale(input) {
  return deepFreeze({
    selectedDecisionPath: normalizeObject(input.selectedDecisionPath, ['optionId', 'label', 'selectedBy']),
    supportingReasons: normalizeItems(input.supportingReasons, ['id', 'text', 'sourceFeatureId']),
    reservations: normalizeItems(input.reservations, ['id', 'text', 'sourceFeatureId']),
    keyAssumptions: normalizeItems(input.keyAssumptions, ['id', 'text']),
    outstandingQuestions: normalizeItems(input.outstandingQuestions, ['id', 'text', 'priority']),
    decisionBasis: normalizeObject(input.decisionBasis, ['text', 'recordedBy', 'status'])
  });
}
function normalizeObject(item, fields) { const source = item || {}; for (const field of fields) if (source[field] === undefined || source[field] === null || source[field] === '') throw new Error(`${field} is required`); return Object.freeze({ ...source }); }
function normalizeItems(items, fields) { return deepFreeze([...(Array.isArray(items) ? items : [])].map((item, index) => { for (const field of fields) if (item?.[field] === undefined || item?.[field] === null || item?.[field] === '') throw new Error(`items[${index}].${field} is required`); return Object.freeze({ ...item }); })); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
