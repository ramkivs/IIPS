import React, { useMemo, useState } from 'react';
import type { OperationalReviewItemDTO, OperationalReviewQueueDTO, ReviewPriority } from '../../contracts';
import { Button, DataTable, EmptyState, Panel, SearchBox, Select } from '../../design-system';
import { EvidenceStatusIndicator } from '../evidence/EvidenceStatusIndicator';

export type ReviewQueueSortField = 'ticker' | 'companyName' | 'priority' | 'reviewStatus' | 'materialChangeCategory' | 'targetReviewBy';
export type ReviewQueueSortDirection = 'asc' | 'desc';

export type ReviewQueueEvent =
  | { type: 'RowSelected'; reviewItemId: string }
  | { type: 'FilterChanged'; priority: ReviewPriority | 'All'; status: string | 'All' }
  | { type: 'SortChanged'; field: ReviewQueueSortField; direction: ReviewQueueSortDirection }
  | { type: 'SearchChanged'; query: string };

type ReviewQueueTableRow = OperationalReviewItemDTO & {
  company: string;
  evidence: string;
  status: string;
  materialChange: string;
};

export function ReviewQueue({ reviewQueue, selectedReviewId = null, onEvent }: { reviewQueue: OperationalReviewQueueDTO; selectedReviewId?: string | null; onEvent?: (event: ReviewQueueEvent) => void }) {
  const [priorityFilter, setPriorityFilter] = useState<ReviewPriority | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<string | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<ReviewQueueSortField>('ticker');
  const [sortDirection, setSortDirection] = useState<ReviewQueueSortDirection>('asc');

  const statusOptions = useMemo(() => Array.from(new Set(reviewQueue.items.map(item => item.reviewStatus))).sort((a, b) => a.localeCompare(b)), [reviewQueue.items]);

  const rows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return reviewQueue.items
      .filter(item => priorityFilter === 'All' || item.priority === priorityFilter)
      .filter(item => statusFilter === 'All' || item.reviewStatus === statusFilter)
      .filter(item => normalizedQuery.length === 0 || searchableText(item).includes(normalizedQuery))
      .slice()
      .sort((left, right) => compareReviewItems(left, right, sortField, sortDirection));
  }, [reviewQueue.items, priorityFilter, searchQuery, sortDirection, sortField, statusFilter]);

  function changePriorityFilter(priority: ReviewPriority | 'All') {
    setPriorityFilter(priority);
    onEvent?.({ type: 'FilterChanged', priority, status: statusFilter });
  }

  function changeStatusFilter(status: string | 'All') {
    setStatusFilter(status);
    onEvent?.({ type: 'FilterChanged', priority: priorityFilter, status });
  }

  function changeSearch(query: string) {
    setSearchQuery(query);
    onEvent?.({ type: 'SearchChanged', query });
  }

  function changeSort(field: ReviewQueueSortField, direction: ReviewQueueSortDirection = sortDirection) {
    setSortField(field);
    setSortDirection(direction);
    onEvent?.({ type: 'SortChanged', field, direction });
  }

  function resetPresentationControls() {
    setPriorityFilter('All');
    setStatusFilter('All');
    setSearchQuery('');
    setSortField('ticker');
    setSortDirection('asc');
    onEvent?.({ type: 'SearchChanged', query: '' });
    onEvent?.({ type: 'FilterChanged', priority: 'All', status: 'All' });
    onEvent?.({ type: 'SortChanged', field: 'ticker', direction: 'asc' });
  }

  const tableRows: ReviewQueueTableRow[] = rows.map(item => ({ ...item, company: item.companyName, evidence: item.evidenceStatus.quality, status: item.reviewStatus, materialChange: item.materialChangeCategory }));

  if (reviewQueue.items.length === 0) return <EmptyState title={reviewQueue.emptyQueueReason === 'No Material Changes' ? 'No active reviews' : 'Review queue unavailable'} message={reviewQueue.emptyQueueReason} />;

  return (
    <Panel title="Active Review Queue">
      <div className="iips-queue-toolbar" aria-label="Review Queue Controls">
        <SearchBox label="Search review queue" value={searchQuery} onChange={event => changeSearch(event.target.value)} helperText="Search company, ticker, reason, status, or material change." />
        <Select label="Priority filter" value={priorityFilter} onChange={event => changePriorityFilter(event.target.value as ReviewPriority | 'All')}>
          <option>All</option><option>High</option><option>Medium</option><option>Low</option><option>Routine</option>
        </Select>
        <Select label="Status filter" value={statusFilter} onChange={event => changeStatusFilter(event.target.value)}>
          <option>All</option>{statusOptions.map(status => <option key={status}>{status}</option>)}
        </Select>
        <Select label="Sort field" value={sortField} onChange={event => changeSort(event.target.value as ReviewQueueSortField)}>
          <option value="ticker">Ticker</option>
          <option value="companyName">Company</option>
          <option value="priority">Priority</option>
          <option value="reviewStatus">Review Status</option>
          <option value="materialChangeCategory">Material Change</option>
          <option value="targetReviewBy">Target Review By</option>
        </Select>
        <Select label="Sort direction" value={sortDirection} onChange={event => changeSort(sortField, event.target.value as ReviewQueueSortDirection)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </Select>
        <Button onClick={resetPresentationControls}>Reset queue controls</Button>
      </div>
      {rows.length === 0 ? <EmptyState title="No matching review items" message="Adjust search or filters to show review queue items." /> : (
        <DataTable<ReviewQueueTableRow>
          aria-label="Active Review Queue"
          rows={tableRows}
          columns={[{ key: 'ticker', label: 'Ticker' }, { key: 'company', label: 'Company' }, { key: 'priority', label: 'Priority' }, { key: 'attentionReason', label: 'Reason' }, { key: 'evidence', label: 'Evidence' }, { key: 'status', label: 'Status' }, { key: 'materialChange', label: 'Material Change' }]}
          selectedId={selectedReviewId}
          getRowLabel={row => `Review item ${row.ticker} ${row.company} ${row.priority} ${row.status}`}
          onSelect={row => onEvent?.({ type: 'RowSelected', reviewItemId: row.id })}
        />
      )}
      <div aria-label="Evidence status list" hidden>{rows.map(item => <EvidenceStatusIndicator key={item.id} evidenceStatus={item.evidenceStatus} />)}</div>
    </Panel>
  );
}

function searchableText(item: OperationalReviewItemDTO) {
  return [item.ticker, item.companyName, item.priority, item.attentionReason, item.reviewObjective, item.materialChangeCategory, item.reviewStatus, item.evidenceStatus.quality].join(' ').toLowerCase();
}

function compareReviewItems(left: OperationalReviewItemDTO, right: OperationalReviewItemDTO, field: ReviewQueueSortField, direction: ReviewQueueSortDirection) {
  const leftValue = String(left[field] ?? '');
  const rightValue = String(right[field] ?? '');
  const result = leftValue.localeCompare(rightValue, undefined, { numeric: true, sensitivity: 'base' });
  return direction === 'asc' ? result : -result;
}
