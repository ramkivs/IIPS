import { renderDataTable, renderEmptyState } from '../../design-system/runtime/index.js';
import { validateReviewQueueDTO } from '../../contracts/dto/OperationalDataDTO.js';
import { createUIEvent, UIInteractionEvent } from '../shared/events.js';

export function createActiveReviewQueue({ reviewQueue, selectedReviewId = null, filterState = {}, sortState = { field: 'priority', direction: 'asc' } } = {}) {
  validateReviewQueueDTO(reviewQueue);
  const rows = applyPresentationSort(applyPresentationFilter(reviewQueue.items, filterState), sortState);
  return deepFreeze({
    component: 'ActiveReviewQueue',
    ownsBusinessLogic: false,
    localState: { selectedReviewId, filterState, sortState },
    inputs: { queueId: reviewQueue.queueId, itemCount: reviewQueue.items.length },
    view: rows.length ? renderDataTable({ 'aria-label': 'Active Review Queue', selectedReviewId }, rows.map(toRow)) : renderEmptyState({ reason: reviewQueue.emptyQueueReason, title: emptyTitle(reviewQueue.emptyQueueReason) }),
    events: {
      selectRow: reviewItemId => createUIEvent(UIInteractionEvent.rowSelected, { reviewItemId }),
      changeFilter: nextFilter => createUIEvent(UIInteractionEvent.filterChanged, { filterState: nextFilter }),
      changeSort: nextSort => createUIEvent(UIInteractionEvent.sortChanged, { sortState: nextSort })
    },
    accessibility: ['rows keyboard focusable', 'Enter/Space selects row', 'selected row announced'],
    guardrail: 'ActiveReviewQueue may filter/sort DTO fields but must not compute or alter review priority.'
  });
}

function toRow(item) {
  return Object.freeze({ id: item.id, ticker: item.ticker, companyName: item.companyName, priority: item.priority, reason: item.attentionReason, evidenceQuality: item.evidenceStatus.quality, estimatedReviewTimeMinutes: item.estimatedReviewTimeMinutes });
}

function applyPresentationFilter(items, filterState) {
  return items.filter(item => !filterState.priority || item.priority === filterState.priority);
}

function applyPresentationSort(items, sortState) {
  if (!sortState?.field) return [...items];
  return [...items].sort((a, b) => String(a[sortState.field] ?? '').localeCompare(String(b[sortState.field] ?? '')) * (sortState.direction === 'desc' ? -1 : 1));
}

function emptyTitle(reason) {
  if (reason === 'No Material Changes') return 'No active reviews';
  if (reason === 'Missing Comparison Evidence') return 'Review Queue unavailable';
  return 'No review items';
}

function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
