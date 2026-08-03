import type {
  ApplicationAlertDTO,
  ApplicationEvidenceDTO,
  ApplicationEvidenceEventDTO,
  ApplicationGovernanceDTO,
  ApplicationMetadataDTO,
  ApplicationOperationalCockpitDTO,
  ApplicationPortfolioDTO,
  ApplicationReviewItemDTO,
  ApplicationReviewQueueDTO
} from '../application/operationalApplication';
import type {
  TransportAlertDTO,
  TransportEvidenceEventDTO,
  TransportEvidenceSummaryDTO,
  TransportGovernanceStateDTO,
  TransportMetadataDTO,
  TransportOperationalCockpitDTO,
  TransportPortfolioSummaryDTO,
  TransportReviewItemDTO,
  TransportReviewQueueDTO
} from '../transport/operationalTransport';

export class TransportMappingError extends Error {
  readonly field: string;
  readonly code: 'MissingField' | 'InvalidField' | 'UnsupportedValue';

  constructor(field: string, code: 'MissingField' | 'InvalidField' | 'UnsupportedValue', message?: string) {
    super(message ?? `${code}: ${field}`);
    this.name = 'TransportMappingError';
    this.field = field;
    this.code = code;
    Object.setPrototypeOf(this, TransportMappingError.prototype);
  }
}

export function mapTransportToApplication(dto: TransportOperationalCockpitDTO): ApplicationOperationalCockpitDTO {
  assertObject(dto, 'transport');
  return {
    metadata: mapMetadata(dto.metadata),
    portfolio: mapPortfolio(dto.portfolio),
    reviewQueue: mapReviewQueue(dto.reviewQueue),
    governance: mapGovernance(dto.governance),
    evidence: mapEvidence(dto.evidence),
    alerts: mapAlerts(dto.alerts)
  };
}

export function mapMetadata(metadata: TransportMetadataDTO): ApplicationMetadataDTO {
  assertObject(metadata, 'metadata');
  return {
    engineVersion: requiredString(metadata.engineVersion, 'metadata.engineVersion'),
    contractVersion: requiredString(metadata.contractVersion, 'metadata.contractVersion'),
    generatedAt: requiredString(metadata.generatedAt, 'metadata.generatedAt'),
    providerId: requiredString(metadata.providerId, 'metadata.providerId'),
    marketDate: requiredString(metadata.marketDate, 'metadata.marketDate')
  };
}

export function mapPortfolio(portfolio: TransportPortfolioSummaryDTO): ApplicationPortfolioDTO {
  assertObject(portfolio, 'portfolio');
  return {
    holdings: requiredNumber(portfolio.holdings, 'portfolio.holdings'),
    sectors: requiredNumber(portfolio.sectors, 'portfolio.sectors'),
    portfolioHealth: requiredString(portfolio.portfolioHealth, 'portfolio.portfolioHealth'),
    reviewCoverage: requiredNumber(portfolio.reviewCoverage, 'portfolio.reviewCoverage'),
    researchDebt: requiredNumber(portfolio.researchDebt, 'portfolio.researchDebt')
  };
}

export function mapReviewQueue(reviewQueue: TransportReviewQueueDTO): ApplicationReviewQueueDTO {
  assertObject(reviewQueue, 'reviewQueue');
  const items = requiredArray<TransportReviewItemDTO>(reviewQueue.items, 'reviewQueue.items').map((item, index) => mapReviewItem(item, `reviewQueue.items[${index}]`));
  return {
    items,
    total: requiredNumber(reviewQueue.total, 'reviewQueue.total')
  };
}

export function mapReviewItem(item: TransportReviewItemDTO, path = 'reviewItem'): ApplicationReviewItemDTO {
  assertObject(item, path);
  return {
    id: requiredString(item.id, `${path}.id`),
    ticker: requiredString(item.symbol, `${path}.symbol`),
    companyName: requiredString(item.company, `${path}.company`),
    sector: requiredString(item.sector, `${path}.sector`),
    priority: requiredString(item.reviewPriority, `${path}.reviewPriority`),
    governanceStatus: requiredString(item.governanceState, `${path}.governanceState`),
    evidenceStatus: requiredString(item.evidenceStatus, `${path}.evidenceStatus`),
    materialChange: requiredString(item.materialChange, `${path}.materialChange`),
    lastReviewed: requiredString(item.lastReviewed, `${path}.lastReviewed`),
    assignedAnalyst: optionalString(item.assignedAnalyst, `${path}.assignedAnalyst`)
  };
}

export function mapGovernance(governance: TransportGovernanceStateDTO): ApplicationGovernanceDTO {
  assertObject(governance, 'governance');
  return {
    status: requiredString(governance.status, 'governance.status'),
    reviewSLA: requiredString(governance.reviewSLA, 'governance.reviewSLA'),
    validationStatus: requiredString(governance.validationStatus, 'governance.validationStatus'),
    engineVersion: requiredString(governance.engineVersion, 'governance.engineVersion'),
    contractVersion: requiredString(governance.contractVersion, 'governance.contractVersion')
  };
}

export function mapEvidence(evidence: TransportEvidenceSummaryDTO): ApplicationEvidenceDTO {
  assertObject(evidence, 'evidence');
  return {
    quality: requiredString(evidence.quality, 'evidence.quality'),
    latestUpdate: requiredString(evidence.latestUpdate, 'evidence.latestUpdate'),
    missingItems: requiredNumber(evidence.missingItems, 'evidence.missingItems'),
    timeline: requiredArray<TransportEvidenceEventDTO>(evidence.timeline, 'evidence.timeline').map((event, index) => mapEvidenceEvent(event, `evidence.timeline[${index}]`))
  };
}

export function mapEvidenceEvent(event: TransportEvidenceEventDTO, path = 'evidenceEvent'): ApplicationEvidenceEventDTO {
  assertObject(event, path);
  return {
    date: requiredString(event.date, `${path}.date`),
    category: requiredString(event.category, `${path}.category`),
    title: requiredString(event.title, `${path}.title`)
  };
}

export function mapAlerts(alerts: TransportAlertDTO[]): ApplicationAlertDTO[] {
  return requiredArray<TransportAlertDTO>(alerts, 'alerts').map((alert, index) => mapAlert(alert, `alerts[${index}]`));
}

export function mapAlert(alert: TransportAlertDTO, path = 'alert'): ApplicationAlertDTO {
  assertObject(alert, path);
  const severity = requiredString(alert.severity, `${path}.severity`);
  if (!['info', 'warning', 'critical'].includes(severity)) {
    throw new TransportMappingError(`${path}.severity`, 'UnsupportedValue');
  }
  return {
    id: requiredString(alert.id, `${path}.id`),
    severity: severity as ApplicationAlertDTO['severity'],
    title: requiredString(alert.title, `${path}.title`),
    message: requiredString(alert.message, `${path}.message`),
    createdAt: requiredString(alert.createdAt, `${path}.createdAt`)
  };
}

function assertObject(value: unknown, field: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TransportMappingError(field, 'MissingField');
}

function requiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.length === 0) throw new TransportMappingError(field, typeof value === 'undefined' ? 'MissingField' : 'InvalidField');
  return value;
}

function optionalString(value: unknown, field: string) {
  if (typeof value === 'undefined' || value === null) return null;
  if (typeof value !== 'string') throw new TransportMappingError(field, 'InvalidField');
  return value;
}

function requiredNumber(value: unknown, field: string) {
  if (typeof value !== 'number' || Number.isNaN(value)) throw new TransportMappingError(field, typeof value === 'undefined' ? 'MissingField' : 'InvalidField');
  return value;
}

function requiredArray<T>(value: T[] | unknown, field: string): T[] {
  if (!Array.isArray(value)) throw new TransportMappingError(field, typeof value === 'undefined' ? 'MissingField' : 'InvalidField');
  return value;
}
