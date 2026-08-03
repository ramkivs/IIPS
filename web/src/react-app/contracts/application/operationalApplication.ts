export interface ApplicationMetadataDTO {
  engineVersion: string;
  contractVersion: string;
  generatedAt: string;
  providerId: string;
  marketDate: string;
}

export interface ApplicationPortfolioDTO {
  holdings: number;
  sectors: number;
  portfolioHealth: string;
  reviewCoverage: number;
  researchDebt: number;
}

export interface ApplicationReviewQueueDTO {
  items: ApplicationReviewItemDTO[];
  total: number;
}

export interface ApplicationReviewItemDTO {
  id: string;
  ticker: string;
  companyName: string;
  sector: string;
  priority: string;
  governanceStatus: string;
  evidenceStatus: string;
  materialChange: string;
  lastReviewed: string;
  assignedAnalyst: string | null;
}

export interface ApplicationGovernanceDTO {
  status: string;
  reviewSLA: string;
  validationStatus: string;
  engineVersion: string;
  contractVersion: string;
}

export interface ApplicationEvidenceDTO {
  quality: string;
  latestUpdate: string;
  missingItems: number;
  timeline: ApplicationEvidenceEventDTO[];
}

export interface ApplicationEvidenceEventDTO {
  date: string;
  category: string;
  title: string;
}

export interface ApplicationAlertDTO {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  createdAt: string;
}

export interface ApplicationOperationalCockpitDTO {
  metadata: ApplicationMetadataDTO;
  portfolio: ApplicationPortfolioDTO;
  reviewQueue: ApplicationReviewQueueDTO;
  governance: ApplicationGovernanceDTO;
  evidence: ApplicationEvidenceDTO;
  alerts: ApplicationAlertDTO[];
}
