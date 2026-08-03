import React from 'react';
import type { CoverageLedgerDTO, OperationalReviewQueueDTO, PortfolioEvidenceHealthDTO } from '../../contracts';
import { Alert, Card, Grid, Panel, Stack } from '../../design-system';
import { EvidenceStatusIndicator } from './EvidenceStatusIndicator';

export function EvidenceCenter({ evidenceHealth, reviewQueue, coverageLedger }: { evidenceHealth: PortfolioEvidenceHealthDTO; reviewQueue: OperationalReviewQueueDTO; coverageLedger: CoverageLedgerDTO }) {
  const evidenceItems = reviewQueue.items.map(item => ({ id: item.id, ticker: item.ticker, companyName: item.companyName, evidenceStatus: item.evidenceStatus, materialChangeCategory: item.materialChangeCategory }));
  return (
    <section aria-label="Evidence Center" className="iips-evidence-center">
      <Stack gap="lg">
        <Grid columns={4}>
          <Card aria-label="Evidence Coverage Summary"><span>Coverage</span><strong>{evidenceHealth.coveragePercent}%</strong></Card>
          <Card aria-label="Evidence Snapshot Count"><span>Snapshots</span><strong>{evidenceHealth.snapshotCount}</strong></Card>
          <Card aria-label="Evidence Comparison Count"><span>Comparisons</span><strong>{evidenceHealth.comparisonCount}</strong></Card>
          <Card aria-label="Failed Evidence Holdings"><span>Failed Holdings</span><strong>{evidenceHealth.failedHoldings}</strong></Card>
        </Grid>
        <Panel title="Evidence Readiness" aria-label="Evidence Readiness">
          <dl>
            <dt>Data readiness</dt><dd>{reviewQueue.dataReadiness.status}</dd>
            <dt>Coverage percent</dt><dd>{reviewQueue.dataReadiness.coveragePercent}%</dd>
            <dt>Covered tickers</dt><dd>{reviewQueue.dataReadiness.coveredTickers.join(', ') || 'Unavailable'}</dd>
            <dt>Missing tickers</dt><dd>{reviewQueue.dataReadiness.missingTickers.join(', ') || 'None supplied'}</dd>
          </dl>
          {reviewQueue.dataReadiness.warning ? <Alert variant="warning">{reviewQueue.dataReadiness.warning}</Alert> : null}
        </Panel>
        <Panel title="Evidence Status by Review Item" aria-label="Evidence Status by Review Item">
          {evidenceItems.length === 0 ? <Alert>No review-item evidence statuses were supplied.</Alert> : (
            <ul className="iips-evidence-list">
              {evidenceItems.map(item => <li key={item.id}><span>{item.ticker}</span><span>{item.companyName}</span><EvidenceStatusIndicator evidenceStatus={item.evidenceStatus} /><small>{item.materialChangeCategory}</small></li>)}
            </ul>
          )}
        </Panel>
        <Panel title="Coverage Evidence Records" aria-label="Coverage Evidence Records">
          {coverageLedger.records.length === 0 ? <Alert>No coverage evidence records were supplied.</Alert> : (
            <ul className="iips-evidence-list">
              {coverageLedger.records.map(record => <li key={record.id}><span>{record.ticker}</span><span>{record.companyName}</span><EvidenceStatusIndicator evidenceStatus={record.evidenceStatus} /><small>{record.coverageReason}</small></li>)}
            </ul>
          )}
        </Panel>
      </Stack>
    </section>
  );
}
