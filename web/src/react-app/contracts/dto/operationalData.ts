export type EvidenceQuality = 'Certified' | 'Verified' | 'Provisional' | 'Incomplete' | 'Missing';
export type ReviewPriority = 'High' | 'Medium' | 'Low' | 'Routine';
export type DataReadinessStatus = 'Ready' | 'Partial' | 'Missing Evidence' | 'No Portfolio';
export type EmptyQueueReason = 'None' | 'No Material Changes' | 'Missing Comparison Evidence' | 'No Portfolio Holdings';
export type GovernanceBehaviorState = 'Normal' | 'Governance Freeze Active' | 'Read Only' | 'Change Proposal Required' | 'Maintenance Mode';
export type ReviewAction = 'OpenReview' | 'SubmitReview' | 'SaveDraft' | 'DeferReview' | 'MarkNeedsMoreEvidence' | 'CreateJournalEntry' | 'ReturnToQueue';

export interface OperationalCockpitDTO {
  cycleId: string;
  generatedAt: string;
  portfolioHealth: PortfolioHealthDTO;
  reviewQueue: OperationalReviewQueueDTO;
  coverageLedger: CoverageLedgerDTO;
  evidenceHealth: PortfolioEvidenceHealthDTO;
  governanceState: GovernanceStateDTO;
  metrics: OperationalMetricsDTO;
}

export interface PortfolioHealthDTO {
  holdingsCount: number;
  activeReviewCount: number;
  coverageLedgerCount: number;
  queueHealth: string;
  researchDebt: string;
  reviewCapacityMinutes: number;
  estimatedWorkMinutes: number;
  comparisonCoveragePercent: number;
  snapshotCount: number;
  comparisonCount: number;
}

export interface OperationalReviewQueueDTO {
  queueId: string;
  generatedAt: string;
  dataReadiness: DataReadinessDTO;
  emptyQueueReason: EmptyQueueReason;
  summary: ReviewQueueSummaryDTO;
  items: OperationalReviewItemDTO[];
  guardrail: string;
}

export interface ReviewQueueSummaryDTO {
  total: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  outstanding: number;
  overdue: number;
  estimatedReviewTimeMinutes: number;
  reviewCapacityMinutes: number;
  capacityUtilizationPercent: number;
  capacityState: 'Available' | 'Tight' | 'Exceeded';
}

export interface OperationalReviewItemDTO {
  id: string;
  companyId: string;
  ticker: string;
  companyName: string;
  sourceProfile: string;
  portfolioRole: string;
  portfolioWeight: number | null;
  priority: ReviewPriority;
  attentionReason: string;
  reviewObjective: string;
  materialChangeCategory: string;
  evidenceStatus: EvidenceStatusDTO;
  dataReadinessStatus: DataReadinessStatus;
  estimatedReviewTimeMinutes: number;
  targetReviewBy: string;
  deadlineState: 'On Track' | 'Due Soon' | 'Overdue';
  snapshotId: string | null;
  previousSnapshotId: string | null;
  currentSnapshotId: string | null;
  materialChangeId: string | null;
  governanceState: GovernanceStateDTO;
  reviewStatus: string;
  explanation: ReviewExplanationDTO;
  allowedActions: ReviewAction[];
  restrictedActions: RestrictedActionDTO[];
  guardrail: string;
}

export interface ReviewExplanationDTO {
  headline: string;
  whyNow: string;
  chain: string[];
  numericDeltas: string[];
  plainLanguageFirst: boolean;
}

export interface EvidenceStatusDTO {
  quality: EvidenceQuality;
  status: EvidenceQuality;
  confidence: number | null;
  freshness: string | null;
  evidenceTimestamp: string | null;
  sourceCount: number;
  staleSourceCount: number;
  missingSourceCount: number;
  warning: string | null;
}

export interface DataReadinessDTO {
  component: 'PortfolioValidationDataReadiness';
  status: DataReadinessStatus;
  portfolioHoldings: number;
  comparisonSnapshots: number;
  holdingsWithComparisonSnapshots: number;
  holdingsMissingComparisonSnapshots: number;
  coveragePercent: number;
  coveredTickers: string[];
  missingTickers: string[];
  warning: string | null;
  guardrail: string;
}

export interface CoverageLedgerDTO {
  ledgerId: string;
  generatedAt: string;
  totalRecords: number;
  routineCoverageCount: number;
  stableCount: number;
  scheduledReviewCount: number;
  records: CoverageLedgerItemDTO[];
}

export interface CoverageLedgerItemDTO {
  id: string;
  companyId: string;
  ticker: string;
  companyName: string;
  coverageReason: 'Stable' | 'Scheduled Review' | 'Routine Coverage' | 'Historical Record';
  lastSnapshotId: string | null;
  lastComparedAt: string | null;
  evidenceStatus: EvidenceStatusDTO;
  nextScheduledReview: string | null;
}

export interface PortfolioEvidenceHealthDTO {
  snapshotCount: number;
  comparisonCount: number;
  coveragePercent: number;
  failedHoldings: number;
}

export interface ResearchSnapshotDrawerDTO {
  selectedReviewItemId: string | null;
  companyId: string;
  ticker: string;
  companyName: string;
  priority: ReviewPriority;
  evidenceStatus: EvidenceStatusDTO;
  scores: SnapshotScoreDTO;
  materialChange: MaterialChangeSummaryDTO;
  explanation: ReviewExplanationDTO;
  snapshotDiff: SnapshotDiffDTO;
  provenance: MaterialChangeProvenanceDTO | null;
  allowedActions: ReviewAction[];
  restrictedActions: RestrictedActionDTO[];
}

export interface SnapshotScoreDTO {
  businessQuality: number | null;
  financialStrength: number | null;
  valuation: number | null;
  confidence: number | null;
}

export interface MaterialChangeSummaryDTO {
  category: string;
  headline: string;
  severity: string;
  reviewRequired: boolean;
}

export interface SnapshotDiffDTO {
  previousSnapshotId: string | null;
  currentSnapshotId: string | null;
  rows: SnapshotDiffRowDTO[];
}

export interface SnapshotDiffRowDTO {
  label: string;
  previousValue: string | number | null;
  currentValue: string | number | null;
  delta: string | number | null;
  direction: 'Improved' | 'Declined' | 'Stable' | 'Changed' | 'Unknown';
}

export interface MaterialChangeProvenanceDTO {
  previousSnapshotId: string;
  currentSnapshotId: string;
  producerEngineVersion: string;
  researchSnapshotContractVersion: string;
  evidenceQuality: EvidenceQuality;
  comparisonTimestamp: string;
  comparisonEngineVersion: string;
}

export interface GovernanceStateDTO {
  governanceVersion: string;
  governanceState: string;
  behaviorChangeState: GovernanceBehaviorState;
  currentDecision: string;
  decisionConfidence: 'Low' | 'Moderate' | 'High';
  evidenceLevel: 'E0' | 'E1' | 'E2' | 'E3';
  allowedActions: ReviewAction[];
  restrictedActions: RestrictedActionDTO[];
  restrictionReason: string | null;
  effectiveAt: string;
  guardrail: string;
}

export interface RestrictedActionDTO {
  action: ReviewAction;
  reason: string;
  severity: 'Info' | 'Warning' | 'Blocked';
}

export interface RefreshStateDTO {
  refreshState: 'Idle' | 'Refreshing' | 'Completed' | 'Failed';
  startedAt: string | null;
  completedAt: string | null;
  failedAt: string | null;
  affectedReviewItemIds: string[];
  affectedTickers: string[];
  staleDataVisible: boolean;
  warning: string | null;
  lastSuccessfulRefreshAt: string | null;
}

export interface HumanReviewDTO {
  reviewItemId: string;
  ticker: string;
  reviewerConfirmed: boolean | null;
  falsePositive: boolean | null;
  explanationUseful: 'Yes' | 'No' | 'Partial' | null;
  templateUseful: 'Yes' | 'No' | 'Partial' | null;
  priorityCorrect: boolean | null;
  actionTaken: string | null;
  rootCauseCategory: string | null;
  timeSpentMinutes: number | null;
  finalDisposition: 'Confirmed' | 'Confirmed - Explanation Improvement' | 'False Positive' | 'Needs More Evidence' | null;
  evidenceLevel: 'E0' | 'E1' | 'E2' | 'E3' | null;
  notes: string | null;
  recommendedRefinement: string | null;
}

export interface ReviewSubmissionDTO {
  reviewItemId: string;
  reviewerId: string;
  submittedAt: string;
  governanceStateVersion: string;
  humanReview: HumanReviewDTO;
  clientContext: {
    selectedSnapshotId: string | null;
    refreshStateAtSubmission: RefreshStateDTO['refreshState'];
    staleDataAcknowledged: boolean;
  };
}

export interface OperationalMetricsDTO {
  cycleId: string;
  reviewItemsExamined: number;
  highPriorityConfirmedRate: number | null;
  falsePositiveRate: number | null;
  explanationUsefulnessRate: number | null;
  priorityCorrectnessRate: number | null;
  actualReviewTimeMinutes: number | null;
  estimatedReviewTimeMinutes: number;
  guardrailViolations: number;
}
