import type { OperationalCockpitDTO, OperationalReviewItemDTO } from '../dto/operationalData';
import type { OperationalEvent, OperationalEventEnvelope, OperationalEventType } from '../events/operationalEvents';

export function asOperationalCockpitDTO(value: OperationalCockpitDTO): OperationalCockpitDTO {
  return value;
}

export function selectReviewItem(dto: OperationalCockpitDTO, reviewItemId: string): OperationalReviewItemDTO | null {
  return dto.reviewQueue.items.find(item => item.id === reviewItemId) ?? null;
}

export function asOperationalEvent<TPayload>(event: OperationalEventEnvelope<TPayload>): OperationalEventEnvelope<TPayload> {
  return event;
}

export function isOperationalEventType(value: string): value is OperationalEventType {
  return ['EvidenceRefreshStarted', 'EvidenceRefreshCompleted', 'EvidenceRefreshFailed', 'ReviewQueueUpdated', 'GovernanceStateChanged'].includes(value);
}

export function acceptOperationalEvent(event: OperationalEvent): { accepted: true; eventType: OperationalEventType; businessEvent: false } {
  return { accepted: true, eventType: event.eventType, businessEvent: false };
}
