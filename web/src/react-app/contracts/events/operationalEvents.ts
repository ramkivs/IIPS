import type {
  CoverageLedgerDTO,
  DataReadinessDTO,
  GovernanceStateDTO,
  OperationalReviewQueueDTO,
  RefreshStateDTO
} from '../dto/operationalData';

export type OperationalEventType =
  | 'EvidenceRefreshStarted'
  | 'EvidenceRefreshCompleted'
  | 'EvidenceRefreshFailed'
  | 'ReviewQueueUpdated'
  | 'GovernanceStateChanged';

export interface OperationalEventEnvelope<TPayload> {
  eventId: string;
  eventType: OperationalEventType;
  eventVersion: '1.0';
  producer: string;
  producedAt: string;
  sequence: number;
  correlationId: string | null;
  causationId: string | null;
  idempotencyKey: string;
  payload: TPayload;
}

export interface EvidenceRefreshStartedPayload {
  refreshId: string;
  startedAt: string;
  affectedReviewItemIds: string[];
  affectedTickers: string[];
  previousRefreshState: RefreshStateDTO['refreshState'];
  refreshState: 'Refreshing';
  staleDataVisible: boolean;
  message: string;
}

export interface EvidenceRefreshCompletedPayload {
  refreshId: string;
  completedAt: string;
  affectedReviewItemIds: string[];
  affectedTickers: string[];
  refreshState: 'Completed';
  updatedReviewQueue: OperationalReviewQueueDTO;
  updatedCoverageLedger: CoverageLedgerDTO | null;
  updatedDataReadiness: DataReadinessDTO;
  message: string;
}

export interface EvidenceRefreshFailedPayload {
  refreshId: string;
  failedAt: string;
  affectedReviewItemIds: string[];
  affectedTickers: string[];
  refreshState: 'Failed';
  failureCategory: 'DataReadiness' | 'ProviderUnavailable' | 'SchemaValidation' | 'Permission' | 'Unknown';
  failureMessage: string;
  staleDataVisible: boolean;
  lastSuccessfulRefreshAt: string | null;
  retryAllowed: boolean;
}

export interface ReviewQueueUpdatedPayload {
  updatedAt: string;
  reason: 'EvidenceRefresh' | 'ReviewSubmitted' | 'QueueRecomputed' | 'GovernanceStateChanged';
  previousQueueVersion: string | null;
  currentQueueVersion: string;
  updatedReviewQueue: OperationalReviewQueueDTO;
  selectedReviewItemStatus: 'Preserved' | 'Updated' | 'RemovedFromActiveQueue' | 'NoSelection';
  selectedReviewItemId: string | null;
  message: string | null;
}

export interface GovernanceStateChangedPayload {
  previousGovernanceState: GovernanceStateDTO;
  currentGovernanceState: GovernanceStateDTO;
  changedAt: string;
  affectedReviewItemIds: string[];
  message: string;
}

export type OperationalEvent =
  | OperationalEventEnvelope<EvidenceRefreshStartedPayload>
  | OperationalEventEnvelope<EvidenceRefreshCompletedPayload>
  | OperationalEventEnvelope<EvidenceRefreshFailedPayload>
  | OperationalEventEnvelope<ReviewQueueUpdatedPayload>
  | OperationalEventEnvelope<GovernanceStateChangedPayload>;
