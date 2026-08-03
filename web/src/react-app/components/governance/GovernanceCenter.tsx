import React from 'react';
import type { GovernanceStateDTO, OperationalMetricsDTO } from '../../contracts';
import { Alert, Grid, Panel, Stack, StatusPill } from '../../design-system';

export function GovernanceCenter({ governanceState, metrics }: { governanceState: GovernanceStateDTO; metrics: OperationalMetricsDTO }) {
  return (
    <section aria-label="Governance Center" className="iips-governance-center">
      <Stack gap="lg">
        <Grid columns={3}>
          <Panel title="Governance Status" aria-label="Governance Status"><strong>{governanceState.governanceState}</strong><p>{governanceState.governanceVersion}</p></Panel>
          <Panel title="Decision Support State" aria-label="Decision Support State"><dl><dt>Decision</dt><dd>{governanceState.currentDecision}</dd><dt>Confidence</dt><dd>{governanceState.decisionConfidence}</dd></dl></Panel>
          <Panel title="Evidence Governance" aria-label="Evidence Governance"><dl><dt>Evidence level</dt><dd>{governanceState.evidenceLevel}</dd><dt>Effective at</dt><dd>{governanceState.effectiveAt}</dd></dl></Panel>
        </Grid>
        <Grid columns={2}>
          <Panel title="Allowed Actions" aria-label="Allowed Actions"><ActionList actions={governanceState.allowedActions} /></Panel>
          <Panel title="Restricted Actions" aria-label="Restricted Actions">{governanceState.restrictedActions.length === 0 ? <Alert variant="info">No restricted actions supplied.</Alert> : <ul className="iips-governance-list">{governanceState.restrictedActions.map(action => <li key={action.action}><StatusPill variant={action.severity}>{action.severity}</StatusPill><span>{action.action}</span><small>{action.reason}</small></li>)}</ul>}</Panel>
        </Grid>
        <Grid columns={2}>
          <Panel title="Governance Guardrails" aria-label="Governance Guardrails"><p>{governanceState.guardrail}</p>{governanceState.restrictionReason ? <Alert variant="warning">{governanceState.restrictionReason}</Alert> : null}</Panel>
          <Panel title="Governance Audit Metrics" aria-label="Governance Audit Metrics"><dl><dt>Guardrail violations</dt><dd>{metrics.guardrailViolations}</dd><dt>Review items examined</dt><dd>{metrics.reviewItemsExamined}</dd><dt>Estimated review time</dt><dd>{metrics.estimatedReviewTimeMinutes} min</dd></dl></Panel>
        </Grid>
      </Stack>
    </section>
  );
}

function ActionList({ actions }: { actions: string[] }) {
  if (actions.length === 0) return <Alert variant="info">No allowed actions supplied.</Alert>;
  return <ul className="iips-governance-list">{actions.map(action => <li key={action}><span>{action}</span></li>)}</ul>;
}
