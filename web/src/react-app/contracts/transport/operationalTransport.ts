export type TransportProviderMode = 'fixture' | 'api';
export type TransportLoadState = 'loading' | 'ready' | 'empty' | 'error' | 'unavailable';
export type TransportSeverity = 'info' | 'warning' | 'critical';

export interface TransportMetadataDTO {
  engineVersion: string;
  contractVersion: string;
  generatedAt: string;
  providerId: string;
  marketDate: string;
}

export interface TransportPortfolioSummaryDTO {
  holdings: number;
  sectors: number;
  portfolioHealth: string;
  reviewCoverage: number;
  researchDebt: number;
}

export interface TransportReviewQueueDTO {
  items: TransportReviewItemDTO[];
  total: number;
}

export interface TransportReviewItemDTO {
  id: string;
  symbol: string;
  company: string;
  sector: string;
  reviewPriority: string;
  governanceState: string;
  evidenceStatus: string;
  materialChange: string;
  lastReviewed: string;
  assignedAnalyst?: string;
}

export interface TransportResearchSnapshotDTO {
  companyId: string;
  businessSummary: string;
  financialSummary: string;
  valuationSummary: string;
  governanceSummary: string;
  evidenceSummary: string;
  reviewHistory: TransportReviewHistoryDTO[];
}

export interface TransportReviewHistoryDTO {
  reviewedAt: string;
  reviewer: string;
  outcome: string;
  notes?: string;
}

export interface TransportGovernanceStateDTO {
  status: string;
  reviewSLA: string;
  validationStatus: string;
  engineVersion: string;
  contractVersion: string;
}

export interface TransportEvidenceSummaryDTO {
  quality: string;
  latestUpdate: string;
  missingItems: number;
  timeline: TransportEvidenceEventDTO[];
}

export interface TransportEvidenceEventDTO {
  date: string;
  category: string;
  title: string;
}

export interface TransportAlertDTO {
  id: string;
  severity: TransportSeverity;
  title: string;
  message: string;
  createdAt: string;
}

export interface TransportOperationalCockpitDTO {
  metadata: TransportMetadataDTO;
  portfolio: TransportPortfolioSummaryDTO;
  reviewQueue: TransportReviewQueueDTO;
  governance: TransportGovernanceStateDTO;
  evidence: TransportEvidenceSummaryDTO;
  alerts: TransportAlertDTO[];
}

export interface TransportEnvelope<TData> {
  data: TData;
  pagination?: unknown;
  meta?: unknown;
  links?: unknown;
}
