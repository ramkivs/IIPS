import React from 'react';
import type { GovernanceStateDTO, OperationalCockpitDTO, OperationalReviewItemDTO, OperationalReviewQueueDTO, PortfolioEvidenceHealthDTO } from '../../contracts';
import { Alert, Card, Grid, Panel, Stack, StatusPill } from '../../design-system';
import { CoverageLedger } from '../coverage-ledger/CoverageLedger';
import { OperationalMetricsPanel } from '../OperationalMetricsPanel';
import { ReviewQueue, type ReviewQueueEvent } from '../review-queue/ReviewQueue';
import { PortfolioHealthPanel } from './PortfolioHealthPanel';

export function OperationalDashboard({ dto, selectedReviewId = null, onReviewQueueEvent }: { dto: OperationalCockpitDTO; selectedReviewId?: string | null; onReviewQueueEvent?: (event: ReviewQueueEvent) => void }) {
  return (
    <section aria-label="Dashboard" className="iips-dashboard">
      <Stack gap="lg">
        <PortfolioHealthPanel portfolioHealth={dto.portfolioHealth} />
        <Grid columns={3}>
          <ReviewQueueSummaryCard reviewQueue={dto.reviewQueue} />
          <GovernanceSummaryCard governanceState={dto.governanceState} />
          <EvidenceCoverageCard evidenceHealth={dto.evidenceHealth} />
        </Grid>
        <Grid columns={2}>
          <MaterialChangesPanel items={dto.reviewQueue.items} />
          <EngineStatusPanel dto={dto} />
        </Grid>
        <Grid columns={2}>
          <ResearchDebtPanel researchDebt={dto.portfolioHealth.researchDebt} />
          <RecentActivityPanel cycleId={dto.cycleId} generatedAt={dto.generatedAt} />
        </Grid>
        <ReviewQueue reviewQueue={dto.reviewQueue} selectedReviewId={selectedReviewId} onEvent={onReviewQueueEvent} />
        <CoverageLedger coverageLedger={dto.coverageLedger} />
        <OperationalMetricsPanel metrics={dto.metrics} />
      </Stack>
    </section>
  );
}

export function ReviewQueueSummaryCard({ reviewQueue }: { reviewQueue: OperationalReviewQueueDTO }) {
  return (
    <Card aria-label="Review Queue Summary">
      <span>Review Queue Summary</span>
      <dl>
        <dt>Total</dt><dd>{reviewQueue.summary.total}</dd>
        <dt>High</dt><dd>{reviewQueue.summary.highPriority}</dd>
        <dt>Medium</dt><dd>{reviewQueue.summary.mediumPriority}</dd>
        <dt>Low</dt><dd>{reviewQueue.summary.lowPriority}</dd>
        <dt>Capacity</dt><dd>{reviewQueue.summary.capacityState}</dd>
      </dl>
    </Card>
  );
}

export function GovernanceSummaryCard({ governanceState }: { governanceState: GovernanceStateDTO }) {
  return (
    <Card aria-label="Governance Summary">
      <span>Governance Summary</span>
      <strong>{governanceState.governanceState}</strong>
      <dl>
        <dt>Decision</dt><dd>{governanceState.currentDecision}</dd>
        <dt>Confidence</dt><dd>{governanceState.decisionConfidence}</dd>
        <dt>Evidence</dt><dd>{governanceState.evidenceLevel}</dd>
      </dl>
    </Card>
  );
}

export function EvidenceCoverageCard({ evidenceHealth }: { evidenceHealth: PortfolioEvidenceHealthDTO }) {
  return (
    <Card aria-label="Evidence Coverage">
      <span>Evidence Coverage</span>
      <strong>{evidenceHealth.coveragePercent}%</strong>
      <dl>
        <dt>Snapshots</dt><dd>{evidenceHealth.snapshotCount}</dd>
        <dt>Comparisons</dt><dd>{evidenceHealth.comparisonCount}</dd>
        <dt>Failed holdings</dt><dd>{evidenceHealth.failedHoldings}</dd>
      </dl>
    </Card>
  );
}

export function MaterialChangesPanel({ items }: { items: OperationalReviewItemDTO[] }) {
  return (
    <Panel title="Material Changes" aria-label="Material Changes">
      {items.length === 0 ? <Alert>No backend-supplied material changes are available.</Alert> : (
        <ul className="iips-dashboard-list">
          {items.map(item => <li key={item.id}><StatusPill variant={item.priority}>{item.priority}</StatusPill><span>{item.ticker}</span><span>{item.materialChangeCategory}</span><small>{item.explanation.headline}</small></li>)}
        </ul>
      )}
    </Panel>
  );
}

export function ResearchDebtPanel({ researchDebt }: { researchDebt: string }) {
  return <Panel title="Research Debt" aria-label="Research Debt"><p>{researchDebt}</p></Panel>;
}

export function RecentActivityPanel({ cycleId, generatedAt }: { cycleId: string; generatedAt: string }) {
  return <Panel title="Recent Activity" aria-label="Recent Activity"><dl><dt>Cycle</dt><dd>{cycleId}</dd><dt>Generated</dt><dd>{generatedAt}</dd></dl></Panel>;
}

export function EngineStatusPanel({ dto }: { dto: OperationalCockpitDTO }) {
  return <Panel title="Engine Status" aria-label="Engine Status"><dl><dt>Governance version</dt><dd>{dto.governanceState.governanceVersion}</dd><dt>Governance effective at</dt><dd>{dto.governanceState.effectiveAt}</dd><dt>Guardrail</dt><dd>{dto.governanceState.guardrail}</dd></dl></Panel>;
}
