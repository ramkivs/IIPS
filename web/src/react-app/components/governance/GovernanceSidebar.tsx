import React from 'react';
import type { GovernanceStateDTO, OperationalMetricsDTO, RestrictedActionDTO } from '../../contracts';
import { Panel, StatusPill } from '../../design-system';

export function GovernanceSidebar({ governanceState, metrics, onRestrictionAcknowledged }: { governanceState: GovernanceStateDTO; metrics: OperationalMetricsDTO; onRestrictionAcknowledged?: (action: string) => void }) {
  return (
    <aside aria-label="Governance Sidebar">
      <Panel title="Operational Governance">
        <p>{governanceState.governanceVersion}</p>
        <dl>
          <dt>Current Decision</dt><dd>{governanceState.currentDecision}</dd>
          <dt>Decision Confidence</dt><dd>{governanceState.decisionConfidence}</dd>
          <dt>Evidence Level</dt><dd>{governanceState.evidenceLevel}</dd>
          <dt>Guardrail Violations</dt><dd>{metrics.guardrailViolations}</dd>
        </dl>
        {governanceState.restrictedActions.map(action => <GovernanceRestrictionBanner key={action.action} restrictedAction={action} onAcknowledge={() => onRestrictionAcknowledged?.(action.action)} />)}
      </Panel>
    </aside>
  );
}

export function GovernanceRestrictionBanner({ restrictedAction, onAcknowledge }: { restrictedAction: RestrictedActionDTO; onAcknowledge?: () => void }) {
  return <div role="alert"><StatusPill variant={restrictedAction.severity}>{restrictedAction.severity}</StatusPill> {restrictedAction.reason} <button type="button" onClick={onAcknowledge}>Acknowledge</button></div>;
}
