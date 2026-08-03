import React from 'react';
import type { CoverageLedgerDTO, PortfolioEvidenceHealthDTO, PortfolioHealthDTO } from '../../contracts';
import { Alert, Card, Grid, Panel, Stack } from '../../design-system';
import { PortfolioHealthPanel } from '../dashboard/PortfolioHealthPanel';

export function PortfolioView({ portfolioHealth, evidenceHealth, coverageLedger }: { portfolioHealth: PortfolioHealthDTO; evidenceHealth: PortfolioEvidenceHealthDTO; coverageLedger: CoverageLedgerDTO }) {
  return (
    <section aria-label="Portfolio" className="iips-portfolio-view">
      <Stack gap="lg">
        <PortfolioHealthPanel portfolioHealth={portfolioHealth} />
        <Grid columns={3}>
          <Card aria-label="Portfolio Review Coverage"><span>Review Coverage</span><strong>{portfolioHealth.comparisonCoveragePercent}%</strong></Card>
          <Card aria-label="Portfolio Snapshot Count"><span>Snapshots</span><strong>{portfolioHealth.snapshotCount}</strong></Card>
          <Card aria-label="Portfolio Comparison Count"><span>Comparisons</span><strong>{portfolioHealth.comparisonCount}</strong></Card>
        </Grid>
        <Grid columns={2}>
          <Panel title="Holdings" aria-label="Holdings Table"><Unavailable message="Holding-level rows were not supplied in the current presentation DTO." /><dl><dt>Holdings count</dt><dd>{portfolioHealth.holdingsCount}</dd></dl></Panel>
          <Panel title="Allocation Summary" aria-label="Allocation Summary"><Unavailable message="Sector, market-cap, and allocation breakdowns were not supplied in the current presentation DTO." /></Panel>
        </Grid>
        <Grid columns={2}>
          <Panel title="Review Coverage" aria-label="Portfolio Coverage"><dl><dt>Coverage ledger records</dt><dd>{coverageLedger.totalRecords}</dd><dt>Routine coverage</dt><dd>{coverageLedger.routineCoverageCount}</dd><dt>Scheduled reviews</dt><dd>{coverageLedger.scheduledReviewCount}</dd></dl></Panel>
          <Panel title="Evidence Coverage" aria-label="Portfolio Evidence Coverage"><dl><dt>Coverage percent</dt><dd>{evidenceHealth.coveragePercent}%</dd><dt>Failed holdings</dt><dd>{evidenceHealth.failedHoldings}</dd></dl></Panel>
        </Grid>
        <Grid columns={2}>
          <Panel title="Quality Distribution" aria-label="Quality Distribution"><Unavailable message="Quality distribution was not supplied in the current presentation DTO." /></Panel>
          <Panel title="Watchlist Overlap" aria-label="Watchlist Overlap"><Unavailable message="Watchlist overlap was not supplied in the current presentation DTO." /></Panel>
        </Grid>
      </Stack>
    </section>
  );
}

function Unavailable({ message }: { message: string }) {
  return <Alert variant="info">{message}</Alert>;
}
