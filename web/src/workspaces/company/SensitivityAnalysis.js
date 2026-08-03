import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-VAL-006',
  workspace: 'Company Workspace',
  epic: 'Valuation',
  featureId: 'VAL.6',
  featureName: 'Sensitivity Analysis',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'Which assumptions most influence valuation?',
  purpose: 'Identify which valuation assumptions have the greatest effect on estimated value using single-variable sensitivity, directional impact, and relative influence ranking while holding all other baseline assumptions constant, without choosing correct assumptions or optimizing the model.'
});

const DEFAULT_SENSITIVITY_ANALYSIS_INPUT = Object.freeze({
  company: Object.freeze({ displayName: 'Apex Consumer Products' }),
  baselineAssumptions: Object.freeze({
    sourceFeatureId: 'CW-VAL-003',
    scenario: 'Base Scenario',
    baselineValue: '₹1,180',
    methodology: 'Single-variable sensitivity around base scenario assumptions; all other assumptions held constant.',
    evidenceExpectation: 'Baseline assumptions inherited from CW-VAL-003'
  }),
  sensitivities: Object.freeze([
    Object.freeze({
      assumption: 'Revenue Growth',
      testedRange: 'Base growth ± 2 percentage points',
      directionalImpact: 'Higher growth increases estimated value if reinvestment efficiency remains adequate; lower growth reduces estimated value.',
      relativeInfluence: 'High',
      illustrativeImpact: '±₹170',
      evidenceExpectation: 'Historical growth ranges, analyst estimates'
    }),
    Object.freeze({
      assumption: 'Operating Margin',
      testedRange: 'Base margin ± 150 basis points',
      directionalImpact: 'Higher durable margins increase estimated value through higher operating cash generation; lower margins reduce estimated value.',
      relativeInfluence: 'High',
      illustrativeImpact: '±₹150',
      evidenceExpectation: 'Margin history, operating leverage, peer comparisons'
    }),
    Object.freeze({
      assumption: 'Reinvestment Needs',
      testedRange: 'Moderate reinvestment ± efficiency adjustment',
      directionalImpact: 'Higher reinvestment requirements reduce free cash flow unless offset by higher returns; lower reinvestment needs can increase estimated value.',
      relativeInfluence: 'Medium',
      illustrativeImpact: '±₹95',
      evidenceExpectation: 'Capex, R&D, working capital history'
    }),
    Object.freeze({
      assumption: 'Discount Rate',
      testedRange: 'Base discount rate ± 100 basis points',
      directionalImpact: 'Higher discount rates lower present value; lower discount rates raise present value.',
      relativeInfluence: 'Very High',
      illustrativeImpact: '±₹220',
      evidenceExpectation: 'Risk-free rate, equity risk premium, beta, debt costs'
    }),
    Object.freeze({
      assumption: 'Terminal Growth',
      testedRange: 'Base terminal growth ± 50 basis points',
      directionalImpact: 'Higher terminal growth increases terminal value if sustainable; lower terminal growth reduces terminal value.',
      relativeInfluence: 'High',
      illustrativeImpact: '±₹140',
      evidenceExpectation: 'Long-term economic assumptions'
    })
  ]),
  interactionNotes: Object.freeze({
    primaryMethod: 'Single-variable sensitivity isolates one assumption at a time.',
    limitation: 'Real-world assumptions interact. For example, higher growth may require higher reinvestment, and higher margins may not be sustainable under stronger competition.',
    evidenceExpectation: 'Documentation of assumptions held constant and analytical limitations'
  }),
  investorJudgment: Object.freeze({ status: 'Sensitivity analysis reviewed', note: 'Investor must judge which assumptions require more evidence. This feature identifies influence, not correct assumptions or actions.' })
});

export function createSensitivityAnalysis(input = DEFAULT_SENSITIVITY_ANALYSIS_INPUT) {
  const normalized = normalizeInput(input);
  const sensitivityRanking = createSensitivityRanking(normalized);
  const evidenceExpectations = createEvidenceExpectations(normalized);
  const valuationFacts = createValuationFacts(normalized, sensitivityRanking);
  const aiInterpretation = createAiInterpretation(normalized, sensitivityRanking);
  const investorJudgment = createInvestorJudgment(normalized);
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Medium',
    coverage: 57,
    rationale: 'Sensitivity Analysis identifies major assumption sensitivities and relative influence, but model documentation, parameter ranges, and source-linked historical support remain incomplete.',
    evidenceItems: ['baseline assumptions', 'revenue growth sensitivity', 'margin sensitivity', 'reinvestment sensitivity', 'discount rate sensitivity', 'terminal growth sensitivity', 'sensitivity ranking', 'interaction notes'],
    missingEvidence: [
      { label: 'documented sensitivity model output', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'baseline assumption source from scenario model', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'historical range support for tested parameters', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'discount rate sensitivity support', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'terminal growth economic support', priority: 'Medium', status: 'missing', sourceCount: 0 }
    ]
  });
  const sections = Object.freeze({
    sensitivityAnalysisHeader: createHeader(normalized),
    baselineAssumptions: createBaselineAssumptions(normalized),
    keyAssumptionsTested: createKeyAssumptionsTested(normalized),
    revenueGrowthSensitivity: createSensitivitySection('RevenueGrowthSensitivity', normalized.sensitivities[0]),
    marginSensitivity: createSensitivitySection('MarginSensitivity', normalized.sensitivities[1]),
    reinvestmentSensitivity: createSensitivitySection('ReinvestmentSensitivity', normalized.sensitivities[2]),
    discountRateSensitivity: createSensitivitySection('DiscountRateSensitivity', normalized.sensitivities[3]),
    terminalGrowthSensitivity: createSensitivitySection('TerminalGrowthSensitivity', normalized.sensitivities[4]),
    sensitivityRanking,
    interactionNotes: createInteractionNotes(normalized),
    evidenceExpectations,
    valuationFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    valuationOnly: true,
    sensitivityAnalysisOnly: true,
    singleVariableSensitivity: true,
    baselineAssumptionsFixed: true,
    noCorrectAssumption: true,
    noModelOptimization: true,
    noTargetPrice: true,
    noRecommendation: true,
    noDecision: true,
    noExecution: true,
    noPositionSizing: true,
    noPortfolioAction: true
  });
  const futureExtensions = Object.freeze(['sensitivity tornado chart', 'model artifact links', 'multi-variable sensitivity', 'assumption range provenance']);

  return deepFreeze({
    type: 'sensitivity-analysis',
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
          dimension: 'Sensitivity Analysis',
          baselineAssumptions: normalized.baselineAssumptions,
          sensitivities: normalized.sensitivities,
          sensitivityRanking: sensitivityRanking.items,
          singleVariableSensitivity: true,
          baselineAssumptionsFixed: true
        }
      }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      analyzesUncertainty: true,
      ranksRelativeInfluence: true,
      userCanUnderstand: Object.freeze(['baseline assumptions', 'individual assumption changes', 'directional impact', 'relative sensitivity', 'sensitivity ranking', 'interaction limitations']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultSensitivityAnalysisInput() { return clone(DEFAULT_SENSITIVITY_ANALYSIS_INPUT); }

function createHeader(input) { return Object.freeze({ component: 'SensitivityAnalysisHeader', companyName: input.company.displayName, investorQuestion: FEATURE_META.investorQuestion }); }
function createBaselineAssumptions(input) { return Object.freeze({ component: 'BaselineAssumptions', ...input.baselineAssumptions, heldConstantForPrimaryAnalysis: true, scenarioComparison: 'CW-VAL-003 moves multiple assumptions together; CW-VAL-006 changes one assumption at a time.' }); }
function createKeyAssumptionsTested(input) { return Object.freeze({ component: 'KeyAssumptionsTested', baseline: input.baselineAssumptions, assumptions: input.sensitivities.map(item => item.assumption), factsOnly: false }); }
function createSensitivitySection(component, input) { return Object.freeze({ component, ...input, singleVariableOnly: true, noCorrectAssumption: true }); }
function createSensitivityRanking(input) {
  const order = Object.freeze({ 'Very High': 4, High: 3, Medium: 2, Low: 1 });
  const items = [...input.sensitivities].sort((a, b) => order[b.relativeInfluence] - order[a.relativeInfluence]).map((item, index) => Object.freeze({ rank: index + 1, assumption: item.assumption, relativeInfluence: item.relativeInfluence, illustrativeImpact: item.illustrativeImpact }));
  return Object.freeze({ component: 'SensitivityRanking', items: Object.freeze(items), relativeInfluenceOnly: true, noModelOptimization: true });
}
function createInteractionNotes(input) { return Object.freeze({ component: 'InteractionNotes', ...input.interactionNotes, acknowledgesLimitations: true, scenarioCrossReference: 'Combined assumption changes are analyzed in CW-VAL-003 — Scenario Valuation.' }); }
function createEvidenceExpectations(input) { return Object.freeze({ component: 'SensitivityEvidenceExpectations', items: deepFreeze([
  { section: 'Key Assumptions Tested', typicalEvidence: input.baselineAssumptions.evidenceExpectation },
  { section: 'Revenue Growth Sensitivity', typicalEvidence: input.sensitivities[0].evidenceExpectation },
  { section: 'Margin Sensitivity', typicalEvidence: input.sensitivities[1].evidenceExpectation },
  { section: 'Reinvestment Sensitivity', typicalEvidence: input.sensitivities[2].evidenceExpectation },
  { section: 'Discount Rate Sensitivity', typicalEvidence: input.sensitivities[3].evidenceExpectation },
  { section: 'Terminal Growth Sensitivity', typicalEvidence: input.sensitivities[4].evidenceExpectation },
  { section: 'Sensitivity Ranking', typicalEvidence: 'Documented model outputs showing isolated impacts' },
  { section: 'Interaction Notes', typicalEvidence: input.interactionNotes.evidenceExpectation }
]), actionable: true }); }
function createValuationFacts(input, ranking) { return Object.freeze({ component: 'SensitivityFacts', items: deepFreeze([
  { id: 'baseline-scenario', kind: 'fact', source: 'sensitivity-analysis-input', value: input.baselineAssumptions.scenario },
  { id: 'baseline-value', kind: 'fact', source: 'sensitivity-analysis-input', value: input.baselineAssumptions.baselineValue },
  { id: 'most-sensitive-assumption', kind: 'fact', source: 'sensitivity-ranking', value: ranking.items[0].assumption },
  { id: 'sensitivity-methodology', kind: 'fact', source: 'sensitivity-analysis-input', value: input.baselineAssumptions.methodology }
]), factsOnly: true }); }
function createAiInterpretation(input, ranking) { return Object.freeze({ component: 'SensitivityAnalysisAIInterpretation', kind: 'generated_explanation', source: 'deterministic-product-summary', basedOn: Object.freeze(['baseline-assumptions', 'individual-sensitivities', 'sensitivity-ranking', 'interaction-notes']), summary: `${input.company.displayName}'s valuation appears most sensitive to ${ranking.items[0].assumption.toLowerCase()}, followed by ${ranking.items[1].assumption.toLowerCase()} and ${ranking.items[2].assumption.toLowerCase()}. This ranking explains relative influence, not which assumption is correct.`, caution: 'Generated sensitivity interpretation only. It does not identify a correct assumption, optimize the model, issue a target price, recommend action, make a decision, size a position, or execute anything.' }); }
function createInvestorJudgment(input) { return Object.freeze({ component: 'SensitivityAnalysisInvestorJudgment', status: input.investorJudgment.status, note: input.investorJudgment.note, controlledBy: 'Investor', noAutomation: true }); }
function normalizeInput(input) { const company = input.company || {}; requireText(company.displayName, 'company.displayName'); const sensitivities = normalizeItems(input.sensitivities, ['assumption', 'testedRange', 'directionalImpact', 'relativeInfluence', 'illustrativeImpact', 'evidenceExpectation']); if (sensitivities.length !== 5) throw new Error('Sensitivity Analysis requires exactly five assumption sensitivities'); return Object.freeze({ company: Object.freeze({ displayName: company.displayName }), baselineAssumptions: normalizeObject(input.baselineAssumptions, ['sourceFeatureId', 'scenario', 'baselineValue', 'methodology', 'evidenceExpectation']), sensitivities, interactionNotes: normalizeObject(input.interactionNotes, ['primaryMethod', 'limitation', 'evidenceExpectation']), investorJudgment: Object.freeze({ status: valueOrUnknown(input.investorJudgment?.status), note: valueOrUnknown(input.investorJudgment?.note) }) }); }
function normalizeObject(item, requiredFields) { const source = item || {}; for (const field of requiredFields) requireText(source[field], field); return Object.freeze({ ...source }); }
function normalizeItems(items, requiredFields) { return deepFreeze(freezeList(items).map((item, index) => { for (const field of requiredFields) requireText(item?.[field], `items[${index}].${field}`); return Object.freeze({ ...item }); })); }
function freezeList(value) { return Object.freeze([...(Array.isArray(value) ? value : [])]); }
function valueOrUnknown(value) { return value === undefined || value === null || value === '' ? 'Unknown' : value; }
function requireText(value, label) { if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
