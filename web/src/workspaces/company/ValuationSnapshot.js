import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-VAL-001',
  workspace: 'Company Workspace',
  epic: 'Valuation',
  featureId: 'VAL.1',
  featureName: 'Valuation Snapshot',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'What is the current valuation picture?',
  purpose: 'Orient the investor to the current market price, valuation range, represented methods, key assumptions, and evidence confidence without selecting a preferred method, issuing a target price, or recommending action.'
});

const DEFAULT_VALUATION_SNAPSHOT_INPUT = Object.freeze({
  company: Object.freeze({ displayName: 'Apex Consumer Products' }),
  marketContext: Object.freeze({
    currentMarketPrice: '₹1,240',
    marketCapitalization: '₹48,000 Cr',
    sharesOutstanding: '38.7 Cr',
    priceAsOf: 'FY2026 demo snapshot',
    currency: 'INR'
  }),
  estimatedValuationRange: Object.freeze({
    low: '₹980',
    base: '₹1,180',
    high: '₹1,420',
    rangeType: 'illustrative per-share value range',
    source: 'valuation snapshot input'
  }),
  methodsRepresented: Object.freeze([
    Object.freeze({ method: 'DCF', status: 'Represented', role: 'Intrinsic value orientation', confidence: 'Medium' }),
    Object.freeze({ method: 'Relative Valuation', status: 'Represented', role: 'Market comparison orientation', confidence: 'Medium' }),
    Object.freeze({ method: 'Historical Range', status: 'Placeholder', role: 'Historical context to be added later', confidence: 'Low' })
  ]),
  keyAssumptions: Object.freeze([
    Object.freeze({ assumption: 'Revenue growth', value: 'Mid-single digit to low-double digit range', evidenceStatus: 'partial' }),
    Object.freeze({ assumption: 'Operating margin', value: 'Stable to modest improvement', evidenceStatus: 'missing' }),
    Object.freeze({ assumption: 'Reinvestment need', value: 'Moderate', evidenceStatus: 'missing' }),
    Object.freeze({ assumption: 'Discount rate', value: 'Requires explicit assumption support', evidenceStatus: 'missing' }),
    Object.freeze({ assumption: 'Terminal growth', value: 'Requires explicit assumption support', evidenceStatus: 'missing' })
  ]),
  rangeInterpretation: Object.freeze({
    currentRead: 'Current price sits inside the illustrative valuation range, but the range is not a recommendation and not a target price.',
    interpretationLimits: Object.freeze(['range depends on assumptions', 'methods are not equally evidenced', 'valuation uncertainty remains high'])
  }),
  investorJudgment: Object.freeze({ status: 'Valuation snapshot reviewed', note: 'Investor must decide whether assumptions are sufficiently supported before relying on the valuation range.' })
});

export function createValuationSnapshot(input = DEFAULT_VALUATION_SNAPSHOT_INPUT) {
  const normalized = normalizeInput(input);
  const valuationFacts = createValuationFacts(normalized);
  const aiInterpretation = createAiInterpretation(normalized);
  const investorJudgment = createInvestorJudgment(normalized);
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Medium',
    coverage: 61,
    rationale: 'Valuation Snapshot includes market context, an illustrative valuation range, methods represented, and key assumptions, but assumption support and source-linked valuation artifacts remain incomplete.',
    evidenceItems: ['market price', 'market capitalization', 'share count', 'valuation range', 'methods represented', 'key assumptions'],
    missingEvidence: [
      { label: 'source-linked current market price and share count', priority: 'High', status: 'partial', sourceCount: 1 },
      { label: 'DCF model artifact link', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'relative valuation peer input source', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'discount rate assumption support', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'terminal growth assumption support', priority: 'Medium', status: 'missing', sourceCount: 0 },
      { label: 'historical performance evidence used in valuation', priority: 'Medium', status: 'missing', sourceCount: 0 }
    ]
  });
  const sections = Object.freeze({
    valuationSnapshotHeader: createValuationSnapshotHeader(normalized),
    currentMarketContext: createCurrentMarketContext(normalized),
    estimatedValuationRange: createEstimatedValuationRange(normalized),
    valuationMethodsRepresented: createValuationMethodsRepresented(normalized),
    keyAssumptions: createKeyAssumptions(normalized),
    rangeInterpretation: createRangeInterpretation(normalized),
    valuationFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    valuationOnly: true,
    noPreferredMethod: true,
    noTargetPrice: true,
    noRecommendation: true,
    noDecision: true,
    noExecution: true,
    noPositionSizing: true,
    noPortfolioAction: true
  });
  const futureExtensions = Object.freeze(['valuation artifact links', 'live market price source', 'method-specific confidence', 'valuation range chart']);

  return deepFreeze({
    type: 'valuation-snapshot',
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
          methodsRepresented: normalized.methodsRepresented,
          estimatedValuationRange: normalized.estimatedValuationRange,
          keyAssumptions: normalized.keyAssumptions,
          snapshotOnly: true
        }
      }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      orientationOnly: true,
      noPreferredMethod: true,
      noTargetPrice: true,
      userCanUnderstand: Object.freeze(['current market context', 'estimated valuation range', 'methods represented', 'key assumptions', 'range interpretation', 'evidence support for valuation inputs']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultValuationSnapshotInput() { return clone(DEFAULT_VALUATION_SNAPSHOT_INPUT); }

function createValuationSnapshotHeader(input) { return Object.freeze({ component: 'ValuationSnapshotHeader', companyName: input.company.displayName, investorQuestion: FEATURE_META.investorQuestion }); }
function createCurrentMarketContext(input) { return Object.freeze({ component: 'CurrentMarketContext', ...input.marketContext, factsOnly: true }); }
function createEstimatedValuationRange(input) { return Object.freeze({ component: 'EstimatedValuationRange', ...input.estimatedValuationRange, illustrativeOnly: true, noTargetPrice: true }); }
function createValuationMethodsRepresented(input) { return Object.freeze({ component: 'ValuationMethodsRepresented', items: input.methodsRepresented, noPreferredMethod: true }); }
function createKeyAssumptions(input) { return Object.freeze({ component: 'KeyAssumptions', items: input.keyAssumptions, factsOnly: false }); }
function createRangeInterpretation(input) { return Object.freeze({ component: 'RangeInterpretation', ...input.rangeInterpretation, noRecommendation: true }); }
function createValuationFacts(input) { return Object.freeze({ component: 'ValuationFacts', items: deepFreeze([
  { id: 'current-market-price', kind: 'fact', source: 'valuation-snapshot-input', value: input.marketContext.currentMarketPrice },
  { id: 'market-capitalization', kind: 'fact', source: 'valuation-snapshot-input', value: input.marketContext.marketCapitalization },
  { id: 'shares-outstanding', kind: 'fact', source: 'valuation-snapshot-input', value: input.marketContext.sharesOutstanding },
  { id: 'valuation-range', kind: 'fact', source: 'valuation-snapshot-input', value: `${input.estimatedValuationRange.low} - ${input.estimatedValuationRange.high}` },
  { id: 'methods-represented', kind: 'fact', source: 'valuation-snapshot-input', value: input.methodsRepresented.map(item => item.method).join(', ') }
]), factsOnly: true }); }
function createAiInterpretation(input) { return Object.freeze({ component: 'ValuationSnapshotAIInterpretation', kind: 'generated_explanation', source: 'deterministic-product-summary', basedOn: Object.freeze(['current-market-context', 'valuation-range', 'methods-represented', 'key-assumptions']), summary: `${input.company.displayName}'s valuation snapshot shows the current market price against an illustrative valuation range using represented methods such as ${input.methodsRepresented.map(item => item.method).join(', ')}. The snapshot orients the investor to valuation context but does not select a preferred method or issue a target price.`, caution: 'Generated valuation interpretation only. It does not recommend action, make a decision, size a position, choose a preferred method, issue a target price, or execute anything.' }); }
function createInvestorJudgment(input) { return Object.freeze({ component: 'ValuationSnapshotInvestorJudgment', status: input.investorJudgment.status, note: input.investorJudgment.note, controlledBy: 'Investor', noAutomation: true }); }
function normalizeInput(input) { const company = input.company || {}; requireText(company.displayName, 'company.displayName'); return Object.freeze({ company: Object.freeze({ displayName: company.displayName }), marketContext: normalizeObject(input.marketContext, ['currentMarketPrice', 'marketCapitalization', 'sharesOutstanding', 'priceAsOf', 'currency']), estimatedValuationRange: normalizeObject(input.estimatedValuationRange, ['low', 'base', 'high', 'rangeType', 'source']), methodsRepresented: normalizeItems(input.methodsRepresented, ['method', 'status', 'role', 'confidence']), keyAssumptions: normalizeItems(input.keyAssumptions, ['assumption', 'value', 'evidenceStatus']), rangeInterpretation: normalizeListObject(input.rangeInterpretation, ['currentRead'], ['interpretationLimits']), investorJudgment: Object.freeze({ status: valueOrUnknown(input.investorJudgment?.status), note: valueOrUnknown(input.investorJudgment?.note) }) }); }
function normalizeObject(item, requiredFields) { const source = item || {}; for (const field of requiredFields) requireText(source[field], field); return Object.freeze({ ...source }); }
function normalizeListObject(item, requiredFields, listFields) { const source = normalizeObject(item, requiredFields); const lists = Object.fromEntries(listFields.map(field => [field, freezeList(item?.[field])])); return Object.freeze({ ...source, ...lists }); }
function normalizeItems(items, requiredFields) { return deepFreeze(freezeList(items).map((item, index) => { for (const field of requiredFields) requireText(item?.[field], `items[${index}].${field}`); return Object.freeze({ ...item }); })); }
function freezeList(value) { return Object.freeze([...(Array.isArray(value) ? value : [])]); }
function valueOrUnknown(value) { return value === undefined || value === null || value === '' ? 'Unknown' : value; }
function requireText(value, label) { if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
