import { describe, expect, it } from 'vitest';
import type { OperationalCockpitDTO, OperationalEventEnvelope, EvidenceRefreshStartedPayload } from './index';
import { acceptOperationalEvent, asOperationalCockpitDTO, asOperationalEvent, isOperationalEventType, selectReviewItem } from './index';

const governanceState = {
  governanceVersion: 'Operational Governance v1.0',
  governanceState: 'Active',
  behaviorChangeState: 'Normal',
  currentDecision: 'Keep workflow unchanged',
  decisionConfidence: 'Moderate',
  evidenceLevel: 'E2',
  allowedActions: ['OpenReview', 'SubmitReview'],
  restrictedActions: [],
  restrictionReason: null,
  effectiveAt: '2026-07-25T00:00:00.000Z',
  guardrail: 'Backend-owned governance state.'
} satisfies OperationalCockpitDTO['governanceState'];

const evidenceStatus = {
  quality: 'Verified',
  status: 'Verified',
  confidence: 90,
  freshness: 'Verified',
  evidenceTimestamp: '2026-07-25T00:00:00.000Z',
  sourceCount: 2,
  staleSourceCount: 0,
  missingSourceCount: 0,
  warning: null
} satisfies OperationalCockpitDTO['reviewQueue']['items'][number]['evidenceStatus'];

const dto = {
  cycleId: 'Cycle #2',
  generatedAt: '2026-07-25T00:00:00.000Z',
  portfolioHealth: { holdingsCount: 66, activeReviewCount: 17, coverageLedgerCount: 49, queueHealth: 'Stressed', researchDebt: 'High', reviewCapacityMinutes: 180, estimatedWorkMinutes: 186, comparisonCoveragePercent: 100, snapshotCount: 132, comparisonCount: 66 },
  reviewQueue: {
    queueId: 'RQ_1',
    generatedAt: '2026-07-25T00:00:00.000Z',
    dataReadiness: { component: 'PortfolioValidationDataReadiness', status: 'Ready', portfolioHoldings: 66, comparisonSnapshots: 66, holdingsWithComparisonSnapshots: 66, holdingsMissingComparisonSnapshots: 0, coveragePercent: 100, coveredTickers: ['ELECON'], missingTickers: [], warning: null, guardrail: 'Data readiness reports evidence coverage only.' },
    emptyQueueReason: 'None',
    summary: { total: 1, highPriority: 1, mediumPriority: 0, lowPriority: 0, outstanding: 1, overdue: 0, estimatedReviewTimeMinutes: 8, reviewCapacityMinutes: 180, capacityUtilizationPercent: 5, capacityState: 'Available' },
    items: [{ id: 'review-elecon', companyId: 'CMP_ELECON', ticker: 'ELECON', companyName: 'Elecon Engineering Company', sourceProfile: 'Portfolio', portfolioRole: 'Core', portfolioWeight: 1, priority: 'High', attentionReason: 'Valuation Shift', reviewObjective: 'Reconfirm valuation assumptions.', materialChangeCategory: 'Valuation', evidenceStatus, dataReadinessStatus: 'Ready', estimatedReviewTimeMinutes: 8, targetReviewBy: '2026-07-27', deadlineState: 'On Track', snapshotId: 'SS_ELECON', previousSnapshotId: 'SS_PREV', currentSnapshotId: 'SS_CURR', materialChangeId: 'MC_ELECON', governanceState, reviewStatus: 'Needs Review', explanation: { headline: 'Valuation became less attractive.', whyNow: 'MOS changed.', chain: ['MOS changed'], numericDeltas: ['MOS 42 → 27'], plainLanguageFirst: true }, allowedActions: ['OpenReview'], restrictedActions: [], guardrail: 'Review only.' }],
    guardrail: 'Review priority is backend-owned.'
  },
  coverageLedger: { ledgerId: 'CL_1', generatedAt: '2026-07-25T00:00:00.000Z', totalRecords: 49, routineCoverageCount: 49, stableCount: 49, scheduledReviewCount: 49, records: [] },
  evidenceHealth: { snapshotCount: 132, comparisonCount: 66, coveragePercent: 100, failedHoldings: 0 },
  governanceState,
  metrics: { cycleId: 'Cycle #2', reviewItemsExamined: 9, highPriorityConfirmedRate: 100, falsePositiveRate: 0, explanationUsefulnessRate: 88.9, priorityCorrectnessRate: 100, actualReviewTimeMinutes: 29, estimatedReviewTimeMinutes: 72, guardrailViolations: 0 }
} satisfies OperationalCockpitDTO;

describe('React contract bindings', () => {
  it('accepts DTOs that satisfy the approved Operational Data Contract shape', () => {
    const bound = asOperationalCockpitDTO(dto);
    expect(bound.reviewQueue.items[0].ticker).toBe('ELECON');
    expect(selectReviewItem(bound, 'review-elecon')?.priority).toBe('High');
  });

  it('accepts event envelopes matching the approved Event Catalog shape', () => {
    const event = {
      eventId: 'EVT_1',
      eventType: 'EvidenceRefreshStarted',
      eventVersion: '1.0',
      producer: 'Backend',
      producedAt: '2026-07-25T00:00:00.000Z',
      sequence: 1,
      correlationId: null,
      causationId: null,
      idempotencyKey: 'IDEMP_1',
      payload: { refreshId: 'REF_1', startedAt: '2026-07-25T00:00:00.000Z', affectedReviewItemIds: ['review-elecon'], affectedTickers: ['ELECON'], previousRefreshState: 'Idle', refreshState: 'Refreshing', staleDataVisible: true, message: 'Refreshing evidence.' }
    } satisfies OperationalEventEnvelope<EvidenceRefreshStartedPayload>;

    expect(isOperationalEventType(event.eventType)).toBe(true);
    expect(asOperationalEvent(event).payload.refreshState).toBe('Refreshing');
    expect(acceptOperationalEvent(event).businessEvent).toBe(false);
  });
});
