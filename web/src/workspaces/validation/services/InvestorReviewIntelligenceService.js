import { MaterialChangeType } from '../models/ValidationProfiles.js';

export const ReviewPriority = Object.freeze({
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  routine: 'Routine'
});

export const AttentionReason = Object.freeze({
  earningsImpact: 'Earnings Impact',
  valuationShift: 'Valuation Shift',
  evidenceFreshness: 'Evidence Freshness',
  governanceUpdate: 'Governance Update',
  riskChange: 'Risk Change',
  financialQualityChange: 'Financial Quality Change',
  businessQualityChange: 'Business Quality Change',
  marketMovement: 'Market Movement',
  portfolioWeightChange: 'Portfolio Weight Change',
  scheduledQuarterlyReview: 'Scheduled Quarterly Review',
  snoozeExpired: 'Snooze Expired',
  engineUpgradeRegression: 'Engine Upgrade Regression',
  manualReviewRequest: 'Manual Review Request'
});

export const ReviewLifecycleState = Object.freeze({
  detected: 'Detected',
  queued: 'Queued',
  inReview: 'In Review',
  reviewed: 'Reviewed',
  journalUpdated: 'Journal Updated',
  closed: 'Closed'
});

export const ReviewDeadlineState = Object.freeze({
  onTrack: 'On Track',
  dueSoon: 'Due Soon',
  overdue: 'Overdue'
});

export const QueueHealthState = Object.freeze({
  good: 'Good',
  watch: 'Watch',
  stressed: 'Stressed',
  critical: 'Critical'
});

export const ResearchDebtLevel = Object.freeze({
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical'
});

export const ReviewSourceProfile = Object.freeze({
  portfolio: 'Portfolio',
  watchlist: 'Watchlist',
  candidate: 'Candidate',
  regression: 'Regression'
});

export const JournalHandoffStatus = Object.freeze({
  pendingReview: 'Pending Review',
  notRequired: 'Not Required',
  pendingJournal: 'Pending Journal',
  updated: 'Updated'
});

export const SuggestedWorkspace = Object.freeze({
  companyWorkspace: 'Company Workspace',
  validationWorkspace: 'Validation Workspace',
  investmentJournal: 'Investment Journal'
});

export const PortfolioRole = Object.freeze({
  unassigned: 'Unassigned'
});

export const ReviewCapacityState = Object.freeze({
  available: 'Available',
  tight: 'Tight',
  exceeded: 'Exceeded'
});

export const DataReadinessStatus = Object.freeze({
  ready: 'Ready',
  partial: 'Partial',
  missingEvidence: 'Missing Evidence',
  noPortfolio: 'No Portfolio'
});

export const EmptyQueueReason = Object.freeze({
  none: 'None',
  noMaterialChanges: 'No Material Changes',
  missingComparisonEvidence: 'Missing Comparison Evidence',
  noPortfolioHoldings: 'No Portfolio Holdings'
});

export const OPERATIONAL_SLA_DAYS = deepFreeze({
  [ReviewPriority.high]: 2,
  [ReviewPriority.medium]: 7,
  [ReviewPriority.low]: 30,
  [ReviewPriority.routine]: 90
});

const REVIEW_TEMPLATES = deepFreeze({
  [AttentionReason.earningsImpact]: {
    templateId: 'template-earnings-impact',
    title: 'Earnings Impact Review',
    purpose: 'Review quarterly earnings impact without creating an investment recommendation.',
    checklist: ['Revenue', 'Margin', 'Cash Flow', 'Guidance', 'Valuation', 'Thesis']
  },
  [AttentionReason.governanceUpdate]: {
    templateId: 'template-governance-update',
    title: 'Governance Update Review',
    purpose: 'Validate governance changes and update evidence context.',
    checklist: ['Promoter', 'Board', 'Auditor', 'Related Party', 'Capital Allocation']
  },
  [AttentionReason.valuationShift]: {
    templateId: 'template-valuation-shift',
    title: 'Valuation Shift Review',
    purpose: 'Reconfirm valuation assumptions and margin-of-safety context.',
    checklist: ['Intrinsic Value', 'Margin of Safety', 'Scenario', 'Market Expectations']
  },
  [AttentionReason.evidenceFreshness]: {
    templateId: 'template-evidence-freshness',
    title: 'Evidence Freshness Review',
    purpose: 'Update stale evidence and confirm evidence confidence impact.',
    checklist: ['Source age', 'Source reliability', 'Missing evidence', 'Conflicting evidence', 'Confidence impact']
  },
  [AttentionReason.businessQualityChange]: {
    templateId: 'template-business-quality-change',
    title: 'Business Quality Review',
    purpose: 'Reassess business quality evidence that changed materially.',
    checklist: ['Business model', 'Competitive position', 'Capital allocation', 'Financial quality', 'Resilience']
  },
  [AttentionReason.scheduledQuarterlyReview]: {
    templateId: 'template-scheduled-quarterly-review',
    title: 'Scheduled Quarterly Review',
    purpose: 'Complete routine review and confirm evidence, valuation, and journal status.',
    checklist: ['Evidence freshness', 'Quality snapshot', 'Valuation snapshot', 'Decision record', 'Journal status']
  }
});

export function createInvestorReviewIntelligence({ holdings = [], materialChanges = [], validationHistory = [], asOfDate = '2026-07-23', weeklyReviewCapacityMinutes = 45 } = {}) {
  const dataReadiness = createDataReadiness({ holdings, materialChanges });
  const reviewQueue = createReviewQueue({ holdings, materialChanges, validationHistory, asOfDate, weeklyReviewCapacityMinutes, dataReadiness });
  const reviewHistory = createReviewHistory({ reviewQueue, validationHistory, asOfDate });
  const journalHandoff = createJournalHandoff({ reviewQueue, asOfDate });
  return deepFreeze({
    component: 'InvestorReviewIntelligence',
    version: '2.0-mvp',
    investorQuestion: 'What deserves my attention this week?',
    readOnlyWithRespectToCompanyWorkspace: true,
    decisionSupportOnly: true,
    dataReadiness,
    reviewQueue,
    weeklySummary: createWeeklySummary({ reviewQueue, holdings, materialChanges, dataReadiness }),
    reviewHistory,
    journalHandoff,
    queueHealth: reviewQueue.queueHealth,
    researchDebt: reviewQueue.researchDebt,
    guardrails: [
      'Prioritizes review workload, not investment attractiveness.',
      'Manages review workflow, not buy/sell/hold recommendations.',
      'Consumes Company Workspace outputs read-only.',
      'Operational metrics measure research quality, not portfolio quality.'
    ]
  });
}

export function createReviewQueue({ holdings = [], materialChanges = [], validationHistory = [], asOfDate = '2026-07-23', weeklyReviewCapacityMinutes = 45, dataReadiness = createDataReadiness({ holdings, materialChanges }) } = {}) {
  const holdingByTicker = new Map(holdings.map(holding => [holding.ticker, holding]));
  const historyByTicker = new Map(validationHistory.map(history => [history.ticker, history]));
  const detectedDate = asOfDate;
  const items = sortReviewQueueItems(materialChanges.map((comparison, index) => createReviewQueueItem({
    comparison,
    holding: holdingByTicker.get(comparison.ticker),
    history: historyByTicker.get(comparison.ticker),
    detectedDate,
    asOfDate,
    index
  })));

  const summary = summarizeQueue({ items, weeklyReviewCapacityMinutes });
  const queueHealth = createQueueHealth({ items, summary });
  const researchDebt = createResearchDebt({ items, queueHealth, dataReadiness });
  const emptyQueueReason = inferEmptyQueueReason({ items, dataReadiness });

  return deepFreeze({
    component: 'ReviewQueue',
    investorQuestion: 'What should I review first this week?',
    secondaryQuestions: ['Why now?', 'What kind of review is required?', 'When should it be completed?'],
    generatedAt: asOfDate,
    lifecycle: Object.values(ReviewLifecycleState),
    deadlineStates: Object.values(ReviewDeadlineState),
    priorities: Object.values(ReviewPriority),
    items,
    summary,
    dataReadiness,
    emptyQueueReason,
    queueHealth,
    researchDebt,
    guardrail: 'Review priority ranks attention urgency only; it must not recommend buy, sell, hold, add, trim, or exit.'
  });
}


function createDataReadiness({ holdings = [], materialChanges = [] }) {
  const holdingTickers = new Set(holdings.map(holding => holding.ticker).filter(Boolean));
  const comparisonTickers = new Set(materialChanges.map(change => change.ticker).filter(Boolean));
  const coveredTickers = [...holdingTickers].filter(ticker => comparisonTickers.has(ticker));
  const missingTickers = [...holdingTickers].filter(ticker => !comparisonTickers.has(ticker));
  const coveragePercent = holdingTickers.size ? Math.round((coveredTickers.length / holdingTickers.size) * 100) : 0;
  let status = DataReadinessStatus.ready;
  if (holdingTickers.size === 0) status = DataReadinessStatus.noPortfolio;
  else if (coveredTickers.length === 0) status = DataReadinessStatus.missingEvidence;
  else if (coveredTickers.length < holdingTickers.size) status = DataReadinessStatus.partial;

  return deepFreeze({
    component: 'PortfolioValidationDataReadiness',
    status,
    portfolioHoldings: holdingTickers.size,
    comparisonSnapshots: comparisonTickers.size,
    holdingsWithComparisonSnapshots: coveredTickers.length,
    holdingsMissingComparisonSnapshots: missingTickers.length,
    coveragePercent,
    coveredTickers,
    missingTickers,
    warning: createDataReadinessWarning({ status, holdingCount: holdingTickers.size, coveredCount: coveredTickers.length }),
    guardrail: 'Data readiness reports evidence coverage only; it does not indicate portfolio quality or investment attractiveness.'
  });
}

function createDataReadinessWarning({ status, holdingCount, coveredCount }) {
  if (status === DataReadinessStatus.noPortfolio) return 'No portfolio holdings were supplied.';
  if (status === DataReadinessStatus.missingEvidence) return `No comparison snapshots are available for the ${holdingCount} supplied portfolio holdings.`;
  if (status === DataReadinessStatus.partial) return `Comparison snapshots are available for ${coveredCount} of ${holdingCount} supplied portfolio holdings.`;
  return null;
}

function inferEmptyQueueReason({ items, dataReadiness }) {
  if (items.length > 0) return EmptyQueueReason.none;
  if (dataReadiness.status === DataReadinessStatus.noPortfolio) return EmptyQueueReason.noPortfolioHoldings;
  if (dataReadiness.status === DataReadinessStatus.missingEvidence) return EmptyQueueReason.missingComparisonEvidence;
  return EmptyQueueReason.noMaterialChanges;
}

function createReviewQueueItem({ comparison, holding, history, detectedDate, asOfDate, index }) {
  const attentionReason = OperationalPolicy.inferAttentionReason(comparison);
  const priority = OperationalPolicy.inferPriority(comparison, attentionReason);
  const reviewObjective = OperationalPolicy.createReviewObjective({ attentionReason, comparison });
  const targetReviewBy = addDays(detectedDate, OPERATIONAL_SLA_DAYS[priority]);
  const deadlineState = OperationalPolicy.inferDeadlineState({ asOfDate, targetReviewBy, priority });
  const materialChangeCategory = OperationalPolicy.inferMaterialChangeCategory(comparison);
  const explanation = OperationalPolicy.explainChange({ comparison, attentionReason, materialChangeCategory });
  const estimatedReviewTimeMinutes = OperationalPolicy.estimateReviewTime({ priority, attentionReason, comparison });
  const ageDays = daysBetween(detectedDate, asOfDate);

  return Object.freeze({
    id: `review-${comparison.ticker.toLowerCase()}-${detectedDate}`,
    sequence: index + 1,
    company: holding?.company ?? comparison.ticker,
    ticker: comparison.ticker,
    sourceProfile: ReviewSourceProfile.portfolio,
    portfolioRole: holding?.role ?? PortfolioRole.unassigned,
    portfolioWeight: holding?.portfolioWeight ?? null,
    lifecycleState: ReviewLifecycleState.queued,
    reviewStatus: comparison.reviewStatus,
    priority,
    attentionReason,
    reviewObjective,
    materialChangeCategory,
    explanation,
    detectedDate,
    queuedDate: detectedDate,
    targetReviewBy,
    deadlineState,
    ageDays,
    estimatedReviewTimeMinutes,
    confidenceTrend: OperationalPolicy.inferConfidenceTrend({ comparison, history }),
    reviewTemplate: createReviewTemplate(attentionReason),
    completion: createOpenCompletionState(),
    outcome: null,
    snooze: { active: false, until: null, reason: null },
    queueExit: null,
    nextSuggestedWorkspace: SuggestedWorkspace.companyWorkspace,
    journalHandoffStatus: JournalHandoffStatus.pendingReview,
    furtherResearchRequired: false,
    evidence: {
      previousConfidence: comparison.previous.evidenceConfidence,
      currentConfidence: comparison.current.evidenceConfidence
    },
    metrics: {
      previousMarginOfSafety: comparison.previous.marginOfSafety,
      currentMarginOfSafety: comparison.current.marginOfSafety,
      previousBusinessQuality: comparison.previous.businessQuality,
      currentBusinessQuality: comparison.current.businessQuality
    },
    guardrail: 'This item asks for review only and does not recommend an investment action.'
  });
}

function inferAttentionReason(comparison) {
  if (comparison.changes.some(change => change.type === MaterialChangeType.evidence && change.severity === 'High')) return AttentionReason.evidenceFreshness;
  if (comparison.changes.some(change => change.type === MaterialChangeType.valuation)) return AttentionReason.valuationShift;
  if (comparison.changes.some(change => change.type === MaterialChangeType.quality)) return AttentionReason.businessQualityChange;
  return AttentionReason.scheduledQuarterlyReview;
}

function inferPriority(comparison, attentionReason) {
  if (comparison.changes.some(change => change.severity === 'High')) return ReviewPriority.high;
  if (comparison.materialChange && attentionReason !== AttentionReason.scheduledQuarterlyReview) return ReviewPriority.medium;
  if (attentionReason === AttentionReason.scheduledQuarterlyReview) return ReviewPriority.low;
  return ReviewPriority.low;
}

function inferMaterialChangeCategory(comparison) {
  const materialChange = comparison.changes.find(change => change.type !== MaterialChangeType.stable);
  return materialChange?.type ?? MaterialChangeType.stable;
}

function createReviewObjective({ attentionReason, comparison }) {
  if (attentionReason === AttentionReason.evidenceFreshness) return 'Update stale evidence and confirm whether evidence confidence still supports the current analysis.';
  if (attentionReason === AttentionReason.valuationShift) {
    const mosDrop = comparison.current.marginOfSafety < comparison.previous.marginOfSafety;
    return mosDrop ? 'Reconfirm valuation assumptions after margin-of-safety compression.' : 'Review valuation movement and confirm whether assumptions remain current.';
  }
  if (attentionReason === AttentionReason.businessQualityChange) return 'Reassess business quality deterioration and identify which quality evidence changed.';
  return 'Complete scheduled routine review and confirm evidence, valuation, and journal status.';
}

function explainChange({ comparison, attentionReason, materialChangeCategory }) {
  if (attentionReason === AttentionReason.evidenceFreshness) {
    return Object.freeze({
      headline: 'Evidence quality weakened.',
      whyNow: comparison.current.evidenceRead === 'Stable' ? 'Evidence confidence declined materially since the previous validation.' : comparison.current.evidenceRead,
      chain: Object.freeze([
        'Evidence confidence declined materially.',
        'Source freshness or reliability requires review.',
        'Company Workspace should be opened only if updated evidence changes the analysis.'
      ]),
      numericDeltas: Object.freeze([`Evidence Confidence ${comparison.previous.evidenceConfidence}% → ${comparison.current.evidenceConfidence}%`]),
      plainLanguageFirst: true
    });
  }

  if (attentionReason === AttentionReason.valuationShift) {
    const lessAttractive = comparison.current.marginOfSafety < comparison.previous.marginOfSafety;
    return Object.freeze({
      headline: lessAttractive ? 'Valuation became less attractive.' : 'Valuation context changed.',
      whyNow: lessAttractive ? 'Margin of safety compressed since the previous validation.' : `Valuation changed from ${comparison.previous.valuationRead} to ${comparison.current.valuationRead}.`,
      chain: Object.freeze(lessAttractive ? [
        'Margin of safety reduced.',
        'Valuation assumptions should be reconfirmed.',
        'Review is required before updating the journal.'
      ] : [
        'Valuation read changed.',
        'Assumptions should be checked for freshness.',
        'Review may confirm that no further work is required.'
      ]),
      numericDeltas: Object.freeze([`MOS ${comparison.previous.marginOfSafety}% → ${comparison.current.marginOfSafety}%`]),
      plainLanguageFirst: true
    });
  }

  if (materialChangeCategory === MaterialChangeType.quality) {
    return Object.freeze({
      headline: 'Business quality changed.',
      whyNow: 'Business quality score moved beyond the review threshold.',
      chain: Object.freeze(['Quality evidence changed.', 'Business quality assumptions should be reviewed.', 'Journal context may need updating.']),
      numericDeltas: Object.freeze([`Business Quality ${comparison.previous.businessQuality} → ${comparison.current.businessQuality}`]),
      plainLanguageFirst: true
    });
  }

  return Object.freeze({
    headline: 'Routine review is due.',
    whyNow: 'No material change was detected, but the company remains in the routine review cadence.',
    chain: Object.freeze(['Evidence is stable.', 'Valuation is stable.', 'No immediate review issue is indicated.']),
    numericDeltas: Object.freeze([]),
    plainLanguageFirst: true
  });
}

function estimateReviewTime({ priority, attentionReason, comparison }) {
  if (priority === ReviewPriority.high && attentionReason === AttentionReason.valuationShift) return 8;
  if (priority === ReviewPriority.high && attentionReason === AttentionReason.evidenceFreshness) return 5;
  if (priority === ReviewPriority.medium) return comparison.current.valuationRead !== comparison.previous.valuationRead ? 2 : 4;
  if (priority === ReviewPriority.low) return 2;
  return 3;
}

function inferConfidenceTrend({ comparison, history }) {
  const delta = comparison.current.evidenceConfidence - comparison.previous.evidenceConfidence;
  if (delta >= 5) return 'Improving';
  if (delta <= -10) return 'Weakening';
  if (history?.events?.length >= 5) return 'Stable';
  return 'Insufficient history';
}

function createReviewTemplate(attentionReason) {
  const template = REVIEW_TEMPLATES[attentionReason] ?? {
    templateId: 'template-general-review',
    title: 'General Review',
    purpose: 'Review evidence, valuation, quality, and journal context.',
    checklist: ['Evidence', 'Valuation', 'Quality', 'Journal']
  };
  return deepFreeze({
    templateId: template.templateId,
    title: template.title,
    purpose: template.purpose,
    attentionReason,
    checklist: template.checklist.map((item, index) => ({ id: `${template.templateId}-${index + 1}`, item, checked: false })),
    evidencePrompts: createTemplateEvidencePrompts(attentionReason),
    guardrail: 'Review templates guide investor attention and must not recommend an investment action.'
  });
}

function createTemplateEvidencePrompts(attentionReason) {
  if (attentionReason === AttentionReason.valuationShift) return Object.freeze(['Which valuation assumption changed?', 'Is the margin-of-safety change evidence-backed?', 'Does the journal need updated context?']);
  if (attentionReason === AttentionReason.evidenceFreshness) return Object.freeze(['Which sources became stale?', 'Is replacement evidence available?', 'Did confidence change enough to require Company Workspace review?']);
  if (attentionReason === AttentionReason.businessQualityChange) return Object.freeze(['Which quality pillar changed?', 'Is the change supported by current evidence?', 'Does the prior thesis need review?']);
  return Object.freeze(['What triggered this review?', 'What evidence should be checked?', 'Is a journal update required?']);
}

function createOpenCompletionState() {
  return Object.freeze({ objectiveAchieved: null, journalUpdated: false, furtherResearchRequired: false, completedDate: null, completedBy: null });
}

function summarizeQueue({ items, weeklyReviewCapacityMinutes }) {
  const requiredReviewTime = items.reduce((sum, item) => sum + item.estimatedReviewTimeMinutes, 0);
  const highPriority = items.filter(item => item.priority === ReviewPriority.high).length;
  const mediumPriority = items.filter(item => item.priority === ReviewPriority.medium).length;
  const lowPriority = items.filter(item => item.priority === ReviewPriority.low).length;
  const overdue = items.filter(item => item.deadlineState === ReviewDeadlineState.overdue).length;
  const utilization = weeklyReviewCapacityMinutes ? Math.round((requiredReviewTime / weeklyReviewCapacityMinutes) * 100) : 0;

  return Object.freeze({
    total: items.length,
    highPriority,
    mediumPriority,
    lowPriority,
    routine: items.filter(item => item.priority === ReviewPriority.routine).length,
    outstanding: items.filter(item => item.lifecycleState !== ReviewLifecycleState.closed).length,
    overdue,
    estimatedReviewTimeMinutes: requiredReviewTime,
    weeklyReviewCapacityMinutes,
    capacityUtilizationPercent: utilization,
    capacityState: utilization > 100 ? ReviewCapacityState.exceeded : utilization >= 80 ? ReviewCapacityState.tight : ReviewCapacityState.available,
    highPriorityReviewTimeMinutes: items.filter(item => item.priority === ReviewPriority.high).reduce((sum, item) => sum + item.estimatedReviewTimeMinutes, 0),
    oldestUnresolvedDays: Math.max(0, ...items.map(item => item.ageDays))
  });
}

function createQueueHealth({ items, summary }) {
  const averageAgeDays = items.length ? Math.round(items.reduce((sum, item) => sum + item.ageDays, 0) / items.length) : 0;
  const journalCompletionPercent = calculateJournalCompletionPercent(items);
  let health = QueueHealthState.good;
  if (summary.overdue > 0 || summary.capacityState === ReviewCapacityState.tight) health = QueueHealthState.watch;
  if (summary.overdue >= 3 || summary.capacityState === ReviewCapacityState.exceeded) health = QueueHealthState.stressed;
  if (summary.overdue >= 5) health = QueueHealthState.critical;

  return Object.freeze({
    queueSize: items.length,
    highPriority: summary.highPriority,
    overdue: summary.overdue,
    averageAgeDays,
    journalCompletionPercent,
    capacityUtilizationPercent: summary.capacityUtilizationPercent,
    health
  });
}

function createResearchDebt({ items, queueHealth, dataReadiness }) {
  const staleEvidenceSources = items.filter(item => item.attentionReason === AttentionReason.evidenceFreshness).length;
  const journalPending = items.filter(item => isCompletedReview(item) && item.journalHandoffStatus !== JournalHandoffStatus.updated).length;
  const reasons = [];
  if (queueHealth.overdue > 0) reasons.push(`${queueHealth.overdue} overdue review${queueHealth.overdue === 1 ? '' : 's'}`);
  if (staleEvidenceSources > 0) reasons.push(`${staleEvidenceSources} stale evidence review${staleEvidenceSources === 1 ? '' : 's'}`);
  if (journalPending > 0) reasons.push(`${journalPending} journal handoff${journalPending === 1 ? '' : 's'} pending after review`);
  if (queueHealth.capacityUtilizationPercent > 100) reasons.push('review capacity exceeded');
  if (dataReadiness?.status === DataReadinessStatus.missingEvidence) reasons.push('portfolio validation snapshot coverage missing');
  if (dataReadiness?.status === DataReadinessStatus.partial) reasons.push('portfolio validation snapshot coverage partial');

  let level = ResearchDebtLevel.low;
  if (reasons.length >= 1) level = ResearchDebtLevel.medium;
  if (queueHealth.overdue >= 3 || queueHealth.capacityUtilizationPercent > 100) level = ResearchDebtLevel.high;
  if (queueHealth.health === QueueHealthState.critical) level = ResearchDebtLevel.critical;

  return Object.freeze({ level, reasons: Object.freeze(reasons), guardrail: 'Research Debt measures process quality, not portfolio quality or investment attractiveness.' });
}


function createReviewHistory({ reviewQueue, validationHistory, asOfDate }) {
  const historyByTicker = new Map(validationHistory.map(history => [history.ticker, history]));
  const entries = reviewQueue.items.map(item => createReviewHistoryEntry({ item, history: historyByTicker.get(item.ticker), asOfDate }));
  return deepFreeze({
    component: 'ReviewHistory',
    investorQuestion: 'What review context led to this queue item?',
    generatedAt: asOfDate,
    entries,
    guardrail: 'Review History preserves operational context and outcomes; it does not create investment recommendations.'
  });
}

function createReviewHistoryEntry({ item, history, asOfDate }) {
  const priorEvents = (history?.events ?? []).map(event => ({
    date: event.date,
    status: event.status,
    reason: event.reason ?? null,
    source: 'Validation History'
  }));
  const currentEvents = [
    { date: item.detectedDate, status: ReviewLifecycleState.detected, reason: item.attentionReason, source: 'Investor Review Intelligence' },
    { date: item.queuedDate, status: ReviewLifecycleState.queued, reason: item.reviewObjective, source: 'Review Queue' }
  ];

  return Object.freeze({
    itemId: item.id,
    ticker: item.ticker,
    company: item.company,
    sourceProfile: item.sourceProfile,
    attentionReason: item.attentionReason,
    reviewObjective: item.reviewObjective,
    materialChangeCategory: item.materialChangeCategory,
    priority: item.priority,
    lifecycleState: item.lifecycleState,
    reviewOutcome: item.outcome,
    journalHandoffStatus: item.journalHandoffStatus,
    generatedAt: asOfDate,
    events: Object.freeze([...priorEvents, ...currentEvents]),
    queueExit: item.queueExit,
    guardrail: 'History records why review is needed; it does not rank investment attractiveness.'
  });
}

function createJournalHandoff({ reviewQueue, asOfDate }) {
  const entries = reviewQueue.items.map(item => createJournalHandoffEntry({ item, asOfDate }));
  const pendingCount = entries.filter(entry => entry.status === JournalHandoffStatus.pendingReview || entry.status === JournalHandoffStatus.pendingJournal).length;
  return deepFreeze({
    component: 'JournalHandoff',
    investorQuestion: 'What context should be carried into the investor-owned journal?',
    generatedAt: asOfDate,
    pendingCount,
    entries,
    guardrail: 'Journal handoff may prefill context, but the investor owns the conclusion.'
  });
}

function createJournalHandoffEntry({ item, asOfDate }) {
  return Object.freeze({
    itemId: item.id,
    ticker: item.ticker,
    company: item.company,
    status: item.journalHandoffStatus,
    canCreateJournalEntry: item.lifecycleState === ReviewLifecycleState.reviewed || item.lifecycleState === ReviewLifecycleState.journalUpdated,
    autoFilledFields: Object.freeze({
      date: asOfDate,
      company: item.company,
      ticker: item.ticker,
      sourceProfile: item.sourceProfile,
      reasonReviewed: item.attentionReason,
      reviewObjective: item.reviewObjective,
      materialChangeCategory: item.materialChangeCategory,
      materialChangeExplanation: item.explanation.headline,
      evidenceConfidenceTrend: item.confidenceTrend,
      reviewOutcome: item.outcome,
      furtherResearchRequired: item.furtherResearchRequired,
      investorOwnedConclusion: null
    }),
    requiredInvestorFields: Object.freeze(['investorOwnedConclusion', 'notes']),
    guardrail: 'Auto-filled journal fields provide context only; final conclusion is investor-owned.'
  });
}

function createWeeklySummary({ reviewQueue, holdings, materialChanges, dataReadiness }) {
  const materialChangeCount = materialChanges.filter(change => change.materialChange).length;
  const evidenceStale = reviewQueue.items.filter(item => item.attentionReason === AttentionReason.evidenceFreshness).length;
  const stable = Math.max(0, holdings.length - reviewQueue.summary.highPriority - reviewQueue.summary.mediumPriority);

  return Object.freeze({
    component: 'WeeklyInvestmentReviewSummary',
    investorQuestion: 'What changed in this review cycle?',
    portfolioCompanies: holdings.length,
    dataReadinessStatus: dataReadiness.status,
    validationCoveragePercent: dataReadiness.coveragePercent,
    holdingsWithComparisonSnapshots: dataReadiness.holdingsWithComparisonSnapshots,
    holdingsMissingComparisonSnapshots: dataReadiness.holdingsMissingComparisonSnapshots,
    emptyQueueReason: reviewQueue.emptyQueueReason,
    stable,
    needsReview: reviewQueue.summary.highPriority + reviewQueue.summary.mediumPriority,
    materialChanges: materialChangeCount,
    evidenceImproved: materialChanges.filter(change => change.current.evidenceConfidence > change.previous.evidenceConfidence).length,
    evidenceStale,
    newReviews: reviewQueue.summary.total,
    completedReviews: reviewQueue.items.filter(isCompletedReview).length,
    outstandingReviews: reviewQueue.summary.outstanding,
    overdueReviews: reviewQueue.summary.overdue,
    averageConfidence: calculateAverageConfidence(materialChanges),
    estimatedReviewTimeMinutes: reviewQueue.summary.estimatedReviewTimeMinutes,
    averageReviewTimeMinutes: reviewQueue.summary.total ? Math.round(reviewQueue.summary.estimatedReviewTimeMinutes / reviewQueue.summary.total) : 0,
    journalCompletionPercent: reviewQueue.queueHealth.journalCompletionPercent,
    oldestUnresolvedDays: reviewQueue.summary.oldestUnresolvedDays,
    reviewCapacityMinutes: reviewQueue.summary.weeklyReviewCapacityMinutes,
    requiredReviewTimeMinutes: reviewQueue.summary.estimatedReviewTimeMinutes,
    capacityUtilizationPercent: reviewQueue.summary.capacityUtilizationPercent,
    queueHealth: reviewQueue.queueHealth.health,
    researchDebt: reviewQueue.researchDebt.level,
    primaryAction: 'Open Review Queue'
  });
}


function sortReviewQueueItems(items) {
  return [...items].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority)
    || a.targetReviewBy.localeCompare(b.targetReviewBy)
    || b.ageDays - a.ageDays
    || a.company.localeCompare(b.company));
}

function priorityRank(priority) {
  return { [ReviewPriority.high]: 0, [ReviewPriority.medium]: 1, [ReviewPriority.low]: 2, [ReviewPriority.routine]: 3 }[priority] ?? 99;
}

function isCompletedReview(item) {
  return [ReviewLifecycleState.reviewed, ReviewLifecycleState.journalUpdated, ReviewLifecycleState.closed].includes(item.lifecycleState);
}

function calculateJournalCompletionPercent(items) {
  const completedReviews = items.filter(isCompletedReview);
  if (completedReviews.length === 0) return 100;
  const journaledReviews = completedReviews.filter(item => item.journalHandoffStatus === JournalHandoffStatus.updated).length;
  return Math.round((journaledReviews / completedReviews.length) * 100);
}

function calculateAverageConfidence(materialChanges) {
  if (materialChanges.length === 0) return 0;
  const total = materialChanges.reduce((sum, change) => sum + change.current.evidenceConfidence, 0);
  return Math.round(total / materialChanges.length);
}

export const OperationalPolicy = deepFreeze({
  inferAttentionReason,
  inferPriority,
  inferMaterialChangeCategory,
  createReviewObjective,
  explainChange,
  estimateReviewTime,
  inferConfidenceTrend,
  inferDeadlineState,
  sortReviewQueueItems,
  createDataReadiness
});

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00.000Z`).getTime();
  const end = new Date(`${endDate}T00:00:00.000Z`).getTime();
  return Math.max(0, Math.round((end - start) / 86400000));
}

function inferDeadlineState({ asOfDate, targetReviewBy, priority }) {
  const remaining = daysBetween(asOfDate, targetReviewBy);
  if (new Date(`${asOfDate}T00:00:00.000Z`) > new Date(`${targetReviewBy}T00:00:00.000Z`)) return ReviewDeadlineState.overdue;
  if (priority === ReviewPriority.high && remaining <= 1) return ReviewDeadlineState.dueSoon;
  if (priority === ReviewPriority.medium && remaining <= 2) return ReviewDeadlineState.dueSoon;
  if (priority === ReviewPriority.low && remaining <= 5) return ReviewDeadlineState.dueSoon;
  return ReviewDeadlineState.onTrack;
}

function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
