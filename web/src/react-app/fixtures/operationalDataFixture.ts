import type { OperationalCockpitDTO, ResearchSnapshotDrawerDTO, HumanReviewDTO } from '../contracts';

export const governanceFixture: OperationalCockpitDTO['governanceState'] = {
  governanceVersion: 'Operational Governance v1.0',
  governanceState: 'Active',
  behaviorChangeState: 'Normal',
  currentDecision: 'Keep workflow unchanged',
  decisionConfidence: 'Moderate',
  evidenceLevel: 'E2',
  allowedActions: ['OpenReview', 'SubmitReview', 'SaveDraft', 'MarkNeedsMoreEvidence', 'CreateJournalEntry', 'ReturnToQueue'],
  restrictedActions: [],
  restrictionReason: null,
  effectiveAt: '2026-07-25T00:00:00.000Z',
  guardrail: 'Governance state is backend-owned and must not be inferred by React.'
};

const evidenceStatus = {
  quality: 'Certified',
  status: 'Certified',
  confidence: 92,
  freshness: 'Certified',
  evidenceTimestamp: '2026-07-25T00:00:00.000Z',
  sourceCount: 2,
  staleSourceCount: 0,
  missingSourceCount: 0,
  warning: null
} satisfies OperationalCockpitDTO['reviewQueue']['items'][number]['evidenceStatus'];

export const operationalDataFixture: OperationalCockpitDTO = {
  cycleId: 'Cycle #2',
  generatedAt: '2026-07-25T00:00:00.000Z',
  portfolioHealth: { holdingsCount: 66, activeReviewCount: 17, coverageLedgerCount: 49, queueHealth: 'Stressed', researchDebt: 'High', reviewCapacityMinutes: 180, estimatedWorkMinutes: 186, comparisonCoveragePercent: 100, snapshotCount: 132, comparisonCount: 66 },
  reviewQueue: {
    queueId: 'RQ_CYCLE2',
    generatedAt: '2026-07-25T00:00:00.000Z',
    dataReadiness: { component: 'PortfolioValidationDataReadiness', status: 'Ready', portfolioHoldings: 66, comparisonSnapshots: 66, holdingsWithComparisonSnapshots: 66, holdingsMissingComparisonSnapshots: 0, coveragePercent: 100, coveredTickers: ['ELECON', 'KROSS'], missingTickers: [], warning: null, guardrail: 'Data readiness reports evidence coverage only.' },
    emptyQueueReason: 'None',
    summary: { total: 2, highPriority: 2, mediumPriority: 0, lowPriority: 0, outstanding: 2, overdue: 0, estimatedReviewTimeMinutes: 16, reviewCapacityMinutes: 180, capacityUtilizationPercent: 9, capacityState: 'Available' },
    items: [
      { id: 'review-elecon', companyId: 'CMP_ELECON', ticker: 'ELECON', companyName: 'Elecon Engineering Company', sourceProfile: 'Portfolio', portfolioRole: 'Core', portfolioWeight: 1, priority: 'High', attentionReason: 'Valuation Shift', reviewObjective: 'Reconfirm valuation assumptions.', materialChangeCategory: 'Valuation', evidenceStatus, dataReadinessStatus: 'Ready', estimatedReviewTimeMinutes: 8, targetReviewBy: '2026-07-27', deadlineState: 'On Track', snapshotId: 'SS_ELECON', previousSnapshotId: 'SS_ELECON_PREV', currentSnapshotId: 'SS_ELECON_CURR', materialChangeId: 'MC_ELECON', governanceState: governanceFixture, reviewStatus: 'Needs Review', explanation: { headline: 'Valuation became less attractive.', whyNow: 'Margin of safety compressed.', chain: ['Margin of safety reduced.', 'Valuation assumptions should be reconfirmed.'], numericDeltas: ['MOS 42% → 27%'], plainLanguageFirst: true }, allowedActions: ['OpenReview', 'SubmitReview', 'SaveDraft'], restrictedActions: [], guardrail: 'Review only; no investment recommendation.' },
      { id: 'review-kross', companyId: 'CMP_KROSS', ticker: 'KROSS', companyName: 'Kross', sourceProfile: 'Portfolio', portfolioRole: 'Growth', portfolioWeight: 0.2, priority: 'High', attentionReason: 'Valuation Shift', reviewObjective: 'Reconfirm valuation assumptions.', materialChangeCategory: 'Valuation', evidenceStatus, dataReadinessStatus: 'Ready', estimatedReviewTimeMinutes: 8, targetReviewBy: '2026-07-27', deadlineState: 'On Track', snapshotId: 'SS_KROSS', previousSnapshotId: 'SS_KROSS_PREV', currentSnapshotId: 'SS_KROSS_CURR', materialChangeId: 'MC_KROSS', governanceState: governanceFixture, reviewStatus: 'Needs Review', explanation: { headline: 'Valuation became less attractive.', whyNow: 'Valuation context changed.', chain: ['Valuation read changed.'], numericDeltas: ['MOS 36% → 22%'], plainLanguageFirst: true }, allowedActions: ['OpenReview', 'SubmitReview', 'SaveDraft'], restrictedActions: [], guardrail: 'Review only; no investment recommendation.' }
    ],
    guardrail: 'Review priority is backend-owned.'
  },
  coverageLedger: { ledgerId: 'CL_CYCLE2', generatedAt: '2026-07-25T00:00:00.000Z', totalRecords: 49, routineCoverageCount: 49, stableCount: 49, scheduledReviewCount: 49, records: [] },
  evidenceHealth: { snapshotCount: 132, comparisonCount: 66, coveragePercent: 100, failedHoldings: 0 },
  governanceState: governanceFixture,
  metrics: { cycleId: 'Cycle #2', reviewItemsExamined: 9, highPriorityConfirmedRate: 100, falsePositiveRate: 0, explanationUsefulnessRate: 88.9, priorityCorrectnessRate: 100, actualReviewTimeMinutes: 29, estimatedReviewTimeMinutes: 72, guardrailViolations: 0 }
};

export function createSnapshotDrawerFixture(reviewItemId: string): ResearchSnapshotDrawerDTO | null {
  const item = operationalDataFixture.reviewQueue.items.find(candidate => candidate.id === reviewItemId);
  if (!item) return null;
  return { selectedReviewItemId: item.id, companyId: item.companyId, ticker: item.ticker, companyName: item.companyName, priority: item.priority, evidenceStatus: item.evidenceStatus, scores: { businessQuality: null, financialStrength: null, valuation: null, confidence: item.evidenceStatus.confidence }, materialChange: { category: item.materialChangeCategory, headline: item.explanation.headline, severity: item.priority, reviewRequired: true }, explanation: item.explanation, snapshotDiff: { previousSnapshotId: item.previousSnapshotId, currentSnapshotId: item.currentSnapshotId, rows: [] }, provenance: null, allowedActions: item.allowedActions, restrictedActions: item.restrictedActions };
}

export function createHumanReviewFixture(reviewItemId: string): HumanReviewDTO | null {
  const item = operationalDataFixture.reviewQueue.items.find(candidate => candidate.id === reviewItemId);
  if (!item) return null;
  return { reviewItemId: item.id, ticker: item.ticker, reviewerConfirmed: null, falsePositive: null, explanationUseful: null, templateUseful: null, priorityCorrect: null, actionTaken: null, rootCauseCategory: null, timeSpentMinutes: null, finalDisposition: null, evidenceLevel: null, notes: null, recommendedRefinement: null };
}
