import React from 'react';
import type { OperationalCockpitDTO } from '../../contracts';
import { Alert, Card, Grid, Panel, Stack } from '../../design-system';

export function ReportsView({ dto }: { dto: OperationalCockpitDTO }) {
  return (
    <section aria-label="Reports" className="iips-reports-view">
      <Stack gap="lg">
        <Grid columns={3}>
          <Card aria-label="Report Cycle"><span>Cycle</span><strong>{dto.cycleId}</strong></Card>
          <Card aria-label="Report Generated At"><span>Generated</span><strong>{dto.generatedAt}</strong></Card>
          <Card aria-label="Report Guardrails"><span>Guardrail Violations</span><strong>{dto.metrics.guardrailViolations}</strong></Card>
        </Grid>
        <Grid columns={2}>
          <Panel title="Operational Summary Report" aria-label="Operational Summary Report"><dl><dt>Review items examined</dt><dd>{dto.metrics.reviewItemsExamined}</dd><dt>Estimated review time</dt><dd>{dto.metrics.estimatedReviewTimeMinutes} min</dd><dt>Actual review time</dt><dd>{dto.metrics.actualReviewTimeMinutes ?? 'Unavailable'}</dd></dl></Panel>
          <Panel title="Review Queue Report" aria-label="Review Queue Report"><dl><dt>Total reviews</dt><dd>{dto.reviewQueue.summary.total}</dd><dt>Outstanding</dt><dd>{dto.reviewQueue.summary.outstanding}</dd><dt>Overdue</dt><dd>{dto.reviewQueue.summary.overdue}</dd><dt>Capacity state</dt><dd>{dto.reviewQueue.summary.capacityState}</dd></dl></Panel>
        </Grid>
        <Grid columns={2}>
          <Panel title="Evidence Report" aria-label="Evidence Report"><dl><dt>Evidence coverage</dt><dd>{dto.evidenceHealth.coveragePercent}%</dd><dt>Snapshots</dt><dd>{dto.evidenceHealth.snapshotCount}</dd><dt>Comparisons</dt><dd>{dto.evidenceHealth.comparisonCount}</dd></dl></Panel>
          <Panel title="Governance Report" aria-label="Governance Report"><dl><dt>Governance state</dt><dd>{dto.governanceState.governanceState}</dd><dt>Decision support state</dt><dd>{dto.governanceState.currentDecision}</dd><dt>Evidence level</dt><dd>{dto.governanceState.evidenceLevel}</dd></dl></Panel>
        </Grid>
        <Panel title="Generated Reports" aria-label="Generated Reports"><Alert variant="info">Generated report catalog and export status were not supplied in the current presentation DTO.</Alert></Panel>
      </Stack>
    </section>
  );
}
