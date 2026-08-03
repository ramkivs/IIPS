import { renderPanel, renderEmptyState } from '../../design-system/runtime/index.js';
import { createUIEvent, UIInteractionEvent } from '../shared/events.js';

export function createCoverageLedger({ coverageLedger } = {}) {
  if (!coverageLedger) throw new Error('coverageLedger is required');
  const records = coverageLedger.records ?? [];
  return deepFreeze({
    component: 'CoverageLedger',
    ownsBusinessLogic: false,
    inputs: { ledgerId: coverageLedger.ledgerId, totalRecords: coverageLedger.totalRecords },
    view: records.length ? renderPanel({ title: 'Coverage Ledger' }, records.map(toRecord)) : renderEmptyState({ title: 'Coverage ledger empty', reason: 'No coverage records supplied' }),
    summary: {
      totalRecords: coverageLedger.totalRecords,
      routineCoverageCount: coverageLedger.routineCoverageCount,
      stableCount: coverageLedger.stableCount,
      scheduledReviewCount: coverageLedger.scheduledReviewCount
    },
    events: { expandCoverage: coverageId => createUIEvent(UIInteractionEvent.coverageExpanded, { coverageId }) },
    accessibility: ['ledger count has text label', 'coverage status not color-only'],
    guardrail: 'CoverageLedger displays backend-provided coverage values and must not calculate coverage.'
  });
}

function toRecord(record) {
  return Object.freeze({ id: record.id, ticker: record.ticker, companyName: record.companyName, coverageReason: record.coverageReason, evidenceQuality: record.evidenceStatus?.quality });
}

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
