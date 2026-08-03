import React from 'react';
import type { CoverageLedgerDTO } from '../../contracts';
import { EmptyState, Panel } from '../../design-system';

export function CoverageLedger({ coverageLedger, onCoverageExpanded }: { coverageLedger: CoverageLedgerDTO; onCoverageExpanded?: (coverageId: string) => void }) {
  if (coverageLedger.totalRecords === 0) return <EmptyState title="Coverage ledger empty" message="No coverage records supplied" />;
  return (
    <Panel title="Coverage Ledger">
      <dl>
        <dt>Total records</dt><dd>{coverageLedger.totalRecords}</dd>
        <dt>Routine coverage</dt><dd>{coverageLedger.routineCoverageCount}</dd>
        <dt>Stable</dt><dd>{coverageLedger.stableCount}</dd>
      </dl>
      {coverageLedger.records.map(record => <button key={record.id} type="button" onClick={() => onCoverageExpanded?.(record.id)}>{record.ticker} — {record.coverageReason}</button>)}
    </Panel>
  );
}
