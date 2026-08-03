export function createFeatureView({
  id,
  title,
  epic,
  feature,
  version,
  investorQuestion,
  facts = [],
  aiInterpretation,
  investorJudgment,
  evidenceConfidence,
  guardrails = {},
  sections = {},
  metadata = {},
  extensions = {}
} = {}) {
  requireText(id, 'id');
  requireText(title, 'title');
  requireText(epic, 'epic');
  requireText(feature, 'feature');
  requireText(version, 'version');
  requireText(investorQuestion, 'investorQuestion');
  if (!evidenceConfidence?.notInvestmentConfidence) throw new Error('evidenceConfidence.notInvestmentConfidence is required');
  validateExtensionNamespaces(extensions);

  return deepFreeze({
    contract: 'FeatureView',
    id,
    title,
    epic,
    feature,
    version,
    investorQuestion,
    facts: freezeList(facts),
    aiInterpretation: aiInterpretation || null,
    investorJudgment: investorJudgment || null,
    evidenceConfidence,
    guardrails: Object.freeze({
      noValuation: true,
      noScoring: true,
      noRecommendation: true,
      noExecution: true,
      ...guardrails
    }),
    sections,
    metadata: Object.freeze({ ...metadata }),
    extensions: deepFreeze({ ...extensions })
  });
}

const RESERVED_EXTENSION_NAMESPACES = Object.freeze(['quality', 'valuation', 'decision', 'risk', 'financials', 'portfolio', 'ai']);

function validateExtensionNamespaces(extensions) {
  for (const key of Object.keys(extensions || {})) {
    if (!RESERVED_EXTENSION_NAMESPACES.includes(key)) {
      throw new Error(`Unsupported FeatureView extension namespace: ${key}`);
    }
  }
}

function freezeList(value) {
  return Object.freeze([...(Array.isArray(value) ? value : [])]);
}

function requireText(value, label) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`);
}

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
