export const DTO_CONTRACT_VERSION = 'Operational Data Contract v1.0';

const requiredTopLevel = ['cycleId', 'generatedAt', 'portfolioHealth', 'reviewQueue', 'coverageLedger', 'evidenceHealth', 'governanceState', 'metrics'];
const requiredReviewItem = ['id', 'companyId', 'ticker', 'companyName', 'priority', 'attentionReason', 'reviewObjective', 'evidenceStatus', 'estimatedReviewTimeMinutes', 'governanceState', 'reviewStatus', 'explanation', 'allowedActions', 'restrictedActions', 'guardrail'];

export function validateOperationalCockpitDTO(dto) {
  assertObject(dto, 'OperationalCockpitDTO');
  assertRequired(dto, requiredTopLevel, 'OperationalCockpitDTO');
  validatePortfolioHealthDTO(dto.portfolioHealth);
  validateReviewQueueDTO(dto.reviewQueue);
  validateGovernanceStateDTO(dto.governanceState);
  return true;
}

export function validatePortfolioHealthDTO(dto) {
  assertRequired(dto, ['holdingsCount', 'activeReviewCount', 'coverageLedgerCount', 'queueHealth', 'researchDebt', 'reviewCapacityMinutes', 'estimatedWorkMinutes', 'comparisonCoveragePercent', 'snapshotCount', 'comparisonCount'], 'PortfolioHealthDTO');
  return true;
}

export function validateReviewQueueDTO(dto) {
  assertRequired(dto, ['queueId', 'generatedAt', 'dataReadiness', 'emptyQueueReason', 'summary', 'items', 'guardrail'], 'OperationalReviewQueueDTO');
  if (!Array.isArray(dto.items)) throw new Error('OperationalReviewQueueDTO.items must be an array');
  dto.items.forEach(validateOperationalReviewItemDTO);
  return true;
}

export function validateOperationalReviewItemDTO(item) {
  assertRequired(item, requiredReviewItem, `OperationalReviewItemDTO:${item?.id ?? 'unknown'}`);
  validateEvidenceStatusDTO(item.evidenceStatus);
  validateGovernanceStateDTO(item.governanceState);
  if (item.guardrail.toLowerCase().includes('buy') || item.guardrail.toLowerCase().includes('sell')) throw new Error('Review item guardrail must not include recommendation behavior');
  return true;
}

export function validateEvidenceStatusDTO(dto) {
  assertRequired(dto, ['quality', 'status', 'confidence', 'freshness', 'sourceCount', 'staleSourceCount', 'missingSourceCount'], 'EvidenceStatusDTO');
  return true;
}

export function validateGovernanceStateDTO(dto) {
  assertRequired(dto, ['governanceVersion', 'governanceState', 'behaviorChangeState', 'currentDecision', 'decisionConfidence', 'evidenceLevel', 'allowedActions', 'restrictedActions', 'effectiveAt', 'guardrail'], 'GovernanceStateDTO');
  if (!Array.isArray(dto.allowedActions)) throw new Error('GovernanceStateDTO.allowedActions must be an array');
  if (!Array.isArray(dto.restrictedActions)) throw new Error('GovernanceStateDTO.restrictedActions must be an array');
  return true;
}

function assertObject(value, label) {
  if (!value || typeof value !== 'object') throw new Error(`${label} must be an object`);
}

function assertRequired(value, fields, label) {
  assertObject(value, label);
  for (const field of fields) if (value[field] === undefined || value[field] === null) throw new Error(`${label}.${field} is required`);
}
