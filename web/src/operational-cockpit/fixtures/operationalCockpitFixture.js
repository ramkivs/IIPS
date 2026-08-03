export function createOperationalCockpitFixture() {
  const governanceState = Object.freeze({
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
    guardrail: 'Governance state is backend-owned and must not be inferred by the UI.'
  });
  const evidenceStatus = quality => Object.freeze({ quality, status: quality, confidence: 90, freshness: quality, evidenceTimestamp: '2026-07-25T00:00:00.000Z', sourceCount: 2, staleSourceCount: 0, missingSourceCount: 0, warning: null });
  const item = (ticker, priority = 'High', quality = 'Certified') => Object.freeze({
    id: `review-${ticker.toLowerCase()}`,
    companyId: `CMP_${ticker}`,
    ticker,
    companyName: ticker === 'ELECON' ? 'Elecon Engineering Company' : `${ticker} Ltd`,
    sourceProfile: 'Portfolio',
    portfolioRole: ticker === 'ELECON' ? 'Core' : 'Growth',
    portfolioWeight: ticker === 'ELECON' ? 1 : 2,
    priority,
    attentionReason: 'Valuation Shift',
    reviewObjective: 'Reconfirm valuation assumptions after margin-of-safety compression.',
    materialChangeCategory: 'Valuation',
    evidenceStatus: evidenceStatus(quality),
    dataReadinessStatus: 'Ready',
    estimatedReviewTimeMinutes: priority === 'High' ? 8 : 2,
    targetReviewBy: '2026-07-27',
    deadlineState: 'On Track',
    snapshotId: `SS_${ticker}_CURRENT`,
    previousSnapshotId: `SS_${ticker}_PREVIOUS`,
    currentSnapshotId: `SS_${ticker}_CURRENT`,
    materialChangeId: `MC_${ticker}`,
    governanceState,
    reviewStatus: 'Needs Review',
    explanation: Object.freeze({ headline: 'Valuation became less attractive.', whyNow: 'Margin of safety compressed since the previous validation.', chain: ['Margin of safety reduced.', 'Valuation assumptions should be reconfirmed.'], numericDeltas: ['MOS 42% → 27%'], plainLanguageFirst: true }),
    allowedActions: governanceState.allowedActions,
    restrictedActions: [],
    guardrail: 'This item asks for review only and does not recommend an investment action.'
  });
  return deepFreeze({
    cycleId: 'Cycle #2',
    generatedAt: '2026-07-25T00:00:00.000Z',
    portfolioHealth: Object.freeze({ holdingsCount: 66, activeReviewCount: 17, coverageLedgerCount: 49, queueHealth: 'Stressed', researchDebt: 'High', reviewCapacityMinutes: 180, estimatedWorkMinutes: 186, comparisonCoveragePercent: 100, snapshotCount: 132, comparisonCount: 66 }),
    reviewQueue: Object.freeze({
      queueId: 'RQ_CYCLE2', generatedAt: '2026-07-25T00:00:00.000Z',
      dataReadiness: Object.freeze({ component: 'PortfolioValidationDataReadiness', status: 'Ready', portfolioHoldings: 66, comparisonSnapshots: 66, holdingsWithComparisonSnapshots: 66, holdingsMissingComparisonSnapshots: 0, coveragePercent: 100, coveredTickers: ['ELECON','KROSS'], missingTickers: [], warning: null, guardrail: 'Data readiness reports evidence coverage only.' }),
      emptyQueueReason: 'None',
      summary: Object.freeze({ total: 66, highPriority: 9, mediumPriority: 8, lowPriority: 49, outstanding: 57, overdue: 0, estimatedReviewTimeMinutes: 186, reviewCapacityMinutes: 180, capacityUtilizationPercent: 103, capacityState: 'Exceeded' }),
      items: [item('ELECON'), item('KROSS'), item('BHARATCOAL', 'Medium', 'Verified')],
      guardrail: 'Review priority ranks attention urgency only; it must not recommend buy, sell, hold, add, trim, or exit.'
    }),
    coverageLedger: Object.freeze({ ledgerId: 'CL_CYCLE2', generatedAt: '2026-07-25T00:00:00.000Z', totalRecords: 49, routineCoverageCount: 49, stableCount: 49, scheduledReviewCount: 49, records: [] }),
    evidenceHealth: Object.freeze({ snapshotCount: 132, comparisonCount: 66, coveragePercent: 100, failedHoldings: 0 }),
    governanceState,
    metrics: Object.freeze({ cycleId: 'Cycle #2', reviewItemsExamined: 9, highPriorityConfirmedRate: 100, falsePositiveRate: 0, explanationUsefulnessRate: 88.9, priorityCorrectnessRate: 100, actualReviewTimeMinutes: 29, estimatedReviewTimeMinutes: 72, guardrailViolations: 0 })
  });
}

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
