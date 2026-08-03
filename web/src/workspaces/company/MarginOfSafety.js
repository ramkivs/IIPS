import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-VAL-004',
  workspace: 'Company Workspace',
  epic: 'Valuation',
  featureId: 'VAL.4',
  featureName: 'Margin of Safety',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'How much room exists between price and estimated value?',
  purpose: 'Compare current market price with the estimated valuation range and describe the valuation gap without labeling the security as undervalued/overvalued or recommending any action.'
});

const DEFAULT_MARGIN_OF_SAFETY_INPUT = Object.freeze({
  company: Object.freeze({ displayName: 'Apex Consumer Products' }),
  currentMarketPrice: Object.freeze({
    price: 1240,
    displayPrice: '₹1,240',
    currency: 'INR',
    asOf: 'FY2026 demo snapshot',
    source: 'valuation snapshot input'
  }),
  estimatedValueRange: Object.freeze({
    low: 980,
    base: 1180,
    high: 1420,
    displayLow: '₹980',
    displayBase: '₹1,180',
    displayHigh: '₹1,420',
    source: 'scenario valuation range input'
  }),
  calculationMethodology: Object.freeze({
    method: 'Compare current market price with low/base/high estimated value range.',
    relativePositionRule: 'Below range if price < low; within range if low <= price <= high; above range if price > high.',
    marginFormula: '(Estimated Value - Current Price) / Estimated Value',
    evidenceExpectation: 'Calculation methodology and assumptions'
  }),
  assumptionDependence: Object.freeze([
    Object.freeze({ assumption: 'Revenue growth', dependence: 'Higher growth can raise estimated values and widen apparent room if price is unchanged.' }),
    Object.freeze({ assumption: 'Margins', dependence: 'Higher durable margins can increase estimated values; margin pressure can reduce or eliminate room.' }),
    Object.freeze({ assumption: 'Reinvestment', dependence: 'Higher reinvestment needs can reduce free cash flow and lower estimated values.' }),
    Object.freeze({ assumption: 'Discount rate', dependence: 'Higher discount rates reduce present value and can narrow or reverse the valuation gap.' }),
    Object.freeze({ assumption: 'Terminal growth', dependence: 'Terminal assumptions can materially affect the high end of the valuation range.' })
  ]),
  investorJudgment: Object.freeze({ status: 'Margin of safety reviewed', note: 'Investor must decide whether the comparison is sufficiently evidence-supported. This feature does not recommend action.' })
});

export function createMarginOfSafety(input = DEFAULT_MARGIN_OF_SAFETY_INPUT) {
  const normalized = normalizeInput(input);
  const relativePosition = createRelativePosition(normalized);
  const marginAnalysis = createMarginOfSafetyAnalysis(normalized);
  const evidenceExpectations = createEvidenceExpectations(normalized);
  const valuationFacts = createValuationFacts(normalized, relativePosition, marginAnalysis);
  const aiInterpretation = createAiInterpretation(normalized, relativePosition, marginAnalysis);
  const investorJudgment = createInvestorJudgment(normalized);
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Medium',
    coverage: 60,
    rationale: 'Margin of Safety uses current market price, valuation range, and comparison methodology, but source-linked market price, scenario model outputs, and assumption support remain incomplete.',
    evidenceItems: ['current market price', 'estimated value range', 'relative position', 'margin calculation methodology', 'assumption dependence'],
    missingEvidence: [
      { label: 'source-linked current market price', priority: 'High', status: 'partial', sourceCount: 1 },
      { label: 'scenario valuation model output link', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'documented margin of safety calculation methodology', priority: 'High', status: 'partial', sourceCount: 1 },
      { label: 'key valuation assumption support', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'valuation range version and timestamp', priority: 'Medium', status: 'missing', sourceCount: 0 }
    ]
  });
  const sections = Object.freeze({
    marginOfSafetyHeader: createHeader(normalized),
    currentMarketPrice: createCurrentMarketPrice(normalized),
    estimatedValueRange: createEstimatedValueRange(normalized),
    relativePosition,
    marginOfSafetyAnalysis: marginAnalysis,
    assumptionDependence: createAssumptionDependence(normalized),
    evidenceExpectations,
    valuationFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    valuationOnly: true,
    marginOfSafetyOnly: true,
    comparisonOnly: true,
    noUndervaluedLabel: true,
    noOvervaluedLabel: true,
    noBuySignal: true,
    noSellSignal: true,
    noRecommendation: true,
    noDecision: true,
    noExecution: true,
    noPositionSizing: true,
    noPortfolioAction: true
  });
  const futureExtensions = Object.freeze(['live price source link', 'valuation range versioning', 'margin chart', 'assumption-driven gap explanation']);

  return deepFreeze({
    type: 'margin-of-safety',
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
          dimension: 'Margin of Safety',
          relativePosition,
          marginOfSafetyAnalysis: marginAnalysis,
          assumptionDependence: normalized.assumptionDependence,
          comparisonOnly: true
        }
      }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      comparisonOnly: true,
      descriptiveNotPrescriptive: true,
      userCanUnderstand: Object.freeze(['current market price', 'estimated value range', 'relative position', 'margin of safety analysis', 'assumption dependence', 'evidence support for comparison inputs']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultMarginOfSafetyInput() { return clone(DEFAULT_MARGIN_OF_SAFETY_INPUT); }

function createHeader(input) { return Object.freeze({ component: 'MarginOfSafetyHeader', companyName: input.company.displayName, investorQuestion: FEATURE_META.investorQuestion }); }
function createCurrentMarketPrice(input) { return Object.freeze({ component: 'CurrentMarketPrice', ...input.currentMarketPrice, factsOnly: true }); }
function createEstimatedValueRange(input) { return Object.freeze({ component: 'EstimatedValueRangeForMOS', ...input.estimatedValueRange, factsOnly: true, noTargetPrice: true }); }
function createRelativePosition(input) {
  const { price } = input.currentMarketPrice;
  const { low, high } = input.estimatedValueRange;
  const position = price < low ? 'Below estimated range' : price > high ? 'Above estimated range' : 'Within estimated range';
  return Object.freeze({
    component: 'RelativePosition',
    position,
    descriptiveOnly: true,
    noUndervaluedLabel: true,
    noOvervaluedLabel: true,
    explanation: position === 'Within estimated range'
      ? 'Current price is within the estimated valuation range.'
      : position === 'Below estimated range'
        ? 'Current price is below the estimated valuation range.'
        : 'Current price is above the estimated valuation range.'
  });
}
function createMarginOfSafetyAnalysis(input) {
  const price = input.currentMarketPrice.price;
  const values = input.estimatedValueRange;
  const lowGap = calculateGap(values.low, price);
  const baseGap = calculateGap(values.base, price);
  const highGap = calculateGap(values.high, price);
  return Object.freeze({
    component: 'MarginOfSafetyAnalysis',
    lowGap,
    baseGap,
    highGap,
    formula: input.calculationMethodology.marginFormula,
    descriptiveOnly: true,
    noBuySignal: true,
    noSellSignal: true
  });
}
function createAssumptionDependence(input) { return Object.freeze({ component: 'AssumptionDependence', items: input.assumptionDependence, factsOnly: false }); }
function createEvidenceExpectations(input) { return Object.freeze({ component: 'MarginOfSafetyEvidenceExpectations', items: deepFreeze([
  { section: 'Current Market Price', typicalEvidence: 'Source-linked live or dated market price' },
  { section: 'Estimated Value Range', typicalEvidence: 'Outputs from completed valuation scenarios' },
  { section: 'Relative Position', typicalEvidence: 'Comparison derived from documented inputs' },
  { section: 'Margin of Safety Analysis', typicalEvidence: input.calculationMethodology.evidenceExpectation },
  { section: 'Assumption Dependence', typicalEvidence: 'Sensitivity of the comparison to key valuation assumptions' }
]), actionable: true }); }
function createValuationFacts(input, relativePosition, marginAnalysis) { return Object.freeze({ component: 'MarginOfSafetyFacts', items: deepFreeze([
  { id: 'current-market-price', kind: 'fact', source: 'margin-of-safety-input', value: input.currentMarketPrice.displayPrice },
  { id: 'estimated-value-range', kind: 'fact', source: 'margin-of-safety-input', value: `${input.estimatedValueRange.displayLow} - ${input.estimatedValueRange.displayHigh}` },
  { id: 'relative-position', kind: 'fact', source: 'computed-comparison', value: relativePosition.position },
  { id: 'base-gap', kind: 'fact', source: 'computed-comparison', value: `${marginAnalysis.baseGap.percent}%` }
]), factsOnly: true }); }
function createAiInterpretation(input, relativePosition, marginAnalysis) { return Object.freeze({ component: 'MarginOfSafetyAIInterpretation', kind: 'generated_explanation', source: 'deterministic-product-summary', basedOn: Object.freeze(['current-market-price', 'estimated-value-range', 'relative-position', 'margin-of-safety-analysis', 'assumption-dependence']), summary: `${input.company.displayName}'s current price is ${relativePosition.position.toLowerCase()} based on the provided estimated value range. The base-case gap is ${marginAnalysis.baseGap.percent}%, but the comparison depends heavily on valuation assumptions and evidence support.`, caution: 'Generated margin-of-safety interpretation only. It does not label the security as undervalued or overvalued, issue buy/sell signals, recommend action, make a decision, size a position, or execute anything.' }); }
function createInvestorJudgment(input) { return Object.freeze({ component: 'MarginOfSafetyInvestorJudgment', status: input.investorJudgment.status, note: input.investorJudgment.note, controlledBy: 'Investor', noAutomation: true }); }
function calculateGap(value, price) { const raw = ((value - price) / value) * 100; return Object.freeze({ value, price, percent: Math.round(raw * 10) / 10, formula: '(Estimated Value - Current Price) / Estimated Value' }); }
function normalizeInput(input) { const company = input.company || {}; requireText(company.displayName, 'company.displayName'); return Object.freeze({ company: Object.freeze({ displayName: company.displayName }), currentMarketPrice: normalizeObject(input.currentMarketPrice, ['price', 'displayPrice', 'currency', 'asOf', 'source']), estimatedValueRange: normalizeObject(input.estimatedValueRange, ['low', 'base', 'high', 'displayLow', 'displayBase', 'displayHigh', 'source']), calculationMethodology: normalizeObject(input.calculationMethodology, ['method', 'relativePositionRule', 'marginFormula', 'evidenceExpectation']), assumptionDependence: normalizeItems(input.assumptionDependence, ['assumption', 'dependence']), investorJudgment: Object.freeze({ status: valueOrUnknown(input.investorJudgment?.status), note: valueOrUnknown(input.investorJudgment?.note) }) }); }
function normalizeObject(item, requiredFields) { const source = item || {}; for (const field of requiredFields) if (source[field] === undefined || source[field] === null || source[field] === '') throw new Error(`${field} is required`); return Object.freeze({ ...source }); }
function normalizeItems(items, requiredFields) { return deepFreeze(freezeList(items).map((item, index) => { for (const field of requiredFields) requireText(item?.[field], `items[${index}].${field}`); return Object.freeze({ ...item }); })); }
function freezeList(value) { return Object.freeze([...(Array.isArray(value) ? value : [])]); }
function valueOrUnknown(value) { return value === undefined || value === null || value === '' ? 'Unknown' : value; }
function requireText(value, label) { if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
