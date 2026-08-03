import React from 'react';
import type { ResearchSnapshotDrawerDTO } from '../../contracts';
import { Alert, Grid, Panel, Stack, StatusPill } from '../../design-system';
import { EvidenceStatusIndicator } from './EvidenceStatusIndicator';

export function ResearchWorkspace({ snapshot }: { snapshot: ResearchSnapshotDrawerDTO }) {
  return (
    <section aria-label={`Research Workspace ${snapshot.ticker}`} className="iips-research-workspace">
      <Stack gap="md">
        <header className="iips-research-workspace__header">
          <div>
            <p className="iips-kicker">Research Workspace</p>
            <h2>{snapshot.ticker}</h2>
            <p>{snapshot.companyName}</p>
          </div>
          <StatusPill variant={snapshot.priority}>{snapshot.priority}</StatusPill>
        </header>
        <Grid columns={2}>
          <BusinessSummaryPanel snapshot={snapshot} />
          <FinancialSnapshotPanel snapshot={snapshot} />
        </Grid>
        <Grid columns={2}>
          <ValuationSummaryPanel snapshot={snapshot} />
          <GovernanceSummaryPanel snapshot={snapshot} />
        </Grid>
        <Grid columns={2}>
          <EvidenceSummaryPanel snapshot={snapshot} />
          <MaterialChangePanel snapshot={snapshot} />
        </Grid>
        <ReviewHistoryPanel />
        <OperationalNotesPanel snapshot={snapshot} />
      </Stack>
    </section>
  );
}

function BusinessSummaryPanel({ snapshot }: { snapshot: ResearchSnapshotDrawerDTO }) {
  return <Panel title="Business Summary" aria-label="Business Summary"><Unavailable message="Business summary text was not supplied in the current presentation DTO." /><dl><dt>Company</dt><dd>{snapshot.companyName}</dd></dl></Panel>;
}

function FinancialSnapshotPanel({ snapshot }: { snapshot: ResearchSnapshotDrawerDTO }) {
  return <Panel title="Financial Snapshot" aria-label="Financial Snapshot"><Unavailable message="Financial snapshot details were not supplied in the current presentation DTO." /><dl><dt>Financial Strength</dt><dd>{snapshot.scores.financialStrength ?? 'Unavailable'}</dd><dt>Confidence</dt><dd>{snapshot.scores.confidence ?? 'Unavailable'}</dd></dl></Panel>;
}

function ValuationSummaryPanel({ snapshot }: { snapshot: ResearchSnapshotDrawerDTO }) {
  return <Panel title="Valuation Summary" aria-label="Valuation Summary"><dl><dt>Valuation</dt><dd>{snapshot.scores.valuation ?? 'Unavailable'}</dd><dt>Business Quality</dt><dd>{snapshot.scores.businessQuality ?? 'Unavailable'}</dd></dl><Unavailable message="Valuation values are displayed only when supplied by backend DTOs." /></Panel>;
}

function GovernanceSummaryPanel({ snapshot }: { snapshot: ResearchSnapshotDrawerDTO }) {
  return <Panel title="Governance Summary" aria-label="Governance Summary"><dl><dt>Allowed actions</dt><dd>{snapshot.allowedActions.length}</dd><dt>Restricted actions</dt><dd>{snapshot.restrictedActions.length}</dd></dl>{snapshot.restrictedActions.length === 0 ? <Alert variant="info">No restricted actions supplied for this snapshot.</Alert> : null}</Panel>;
}

function EvidenceSummaryPanel({ snapshot }: { snapshot: ResearchSnapshotDrawerDTO }) {
  return <Panel title="Evidence Summary" aria-label="Evidence Summary"><EvidenceStatusIndicator evidenceStatus={snapshot.evidenceStatus} /><dl><dt>Source count</dt><dd>{snapshot.evidenceStatus.sourceCount}</dd><dt>Missing sources</dt><dd>{snapshot.evidenceStatus.missingSourceCount}</dd><dt>Freshness</dt><dd>{snapshot.evidenceStatus.freshness ?? 'Unavailable'}</dd></dl></Panel>;
}

function MaterialChangePanel({ snapshot }: { snapshot: ResearchSnapshotDrawerDTO }) {
  return <Panel title="Material Changes" aria-label="Research Material Changes"><dl><dt>Category</dt><dd>{snapshot.materialChange.category}</dd><dt>Severity</dt><dd>{snapshot.materialChange.severity}</dd><dt>Review required</dt><dd>{snapshot.materialChange.reviewRequired ? 'Yes' : 'No'}</dd></dl><p>{snapshot.materialChange.headline}</p><p>{snapshot.explanation.whyNow}</p></Panel>;
}

function ReviewHistoryPanel() {
  return <Panel title="Review History" aria-label="Review History"><Unavailable message="Review history was not supplied in the current presentation DTO." /></Panel>;
}

function OperationalNotesPanel({ snapshot }: { snapshot: ResearchSnapshotDrawerDTO }) {
  return <Panel title="Operational Notes" aria-label="Operational Notes"><dl><dt>Previous snapshot</dt><dd>{snapshot.snapshotDiff.previousSnapshotId ?? 'Unavailable'}</dd><dt>Current snapshot</dt><dd>{snapshot.snapshotDiff.currentSnapshotId ?? 'Unavailable'}</dd></dl>{snapshot.provenance ? <p>{snapshot.provenance.comparisonTimestamp}</p> : <Unavailable message="Material-change provenance was not supplied." />}</Panel>;
}

function Unavailable({ message }: { message: string }) {
  return <Alert variant="info">{message}</Alert>;
}
