export function createOverviewFeatureView({
  type,
  feature,
  facts = [],
  aiInterpretation,
  investorJudgment,
  evidenceConfidence,
  guardrails = {},
  futureExtensions = [],
  sections = {}
} = {}) {
  requireText(type, 'type');
  if (!feature?.stableId) throw new Error('feature.stableId is required');
  if (!feature?.featureName) throw new Error('feature.featureName is required');
  if (!feature?.investorQuestion) throw new Error('feature.investorQuestion is required');
  if (!evidenceConfidence?.notInvestmentConfidence) throw new Error('evidenceConfidence.notInvestmentConfidence is required');
  return deepFreeze({
    contract: 'OverviewFeatureView',
    type,
    id: feature.stableId,
    title: feature.featureName,
    investorQuestion: feature.investorQuestion,
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
    futureExtensions: freezeList(futureExtensions),
    sections
  });
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
