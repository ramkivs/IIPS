import { validateOperationalCockpitDTO } from '../dto/OperationalDataDTO.js';
import { validateOperationalEventEnvelope } from '../events/EventCatalog.js';

export class OperationalCockpitAdapter {
  constructor({ dto }) {
    validateOperationalCockpitDTO(dto);
    this.dto = dto;
  }

  getPortfolioHealth() { return this.dto.portfolioHealth; }
  getReviewQueue() { return this.dto.reviewQueue; }
  getGovernanceState() { return this.dto.governanceState; }
  getSelectedReviewItem(reviewItemId) { return this.dto.reviewQueue.items.find(item => item.id === reviewItemId) || null; }

  applyEvent(event) {
    validateOperationalEventEnvelope(event);
    return Object.freeze({ eventAccepted: true, eventType: event.eventType, requiresBackendRefresh: ['EvidenceRefreshCompleted', 'ReviewQueueUpdated', 'GovernanceStateChanged'].includes(event.eventType) });
  }
}
