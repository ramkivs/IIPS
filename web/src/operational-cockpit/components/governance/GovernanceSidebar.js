import { renderPanel } from '../../design-system/runtime/index.js';
import { createStatusRow } from '../shared/patterns.js';
import { createUIEvent, UIInteractionEvent } from '../shared/events.js';

export function createGovernanceSidebar({ governanceState, metrics = {} } = {}) {
  if (!governanceState) throw new Error('governanceState is required');
  return deepFreeze({
    component: 'GovernanceSidebar',
    ownsBusinessLogic: false,
    inputs: { governanceVersion: governanceState.governanceVersion, behaviorChangeState: governanceState.behaviorChangeState },
    view: renderPanel({ title: 'Operational Governance' }, [
      createStatusRow({ label: 'Current Decision', value: governanceState.currentDecision, variant: 'info' }),
      createStatusRow({ label: 'Decision Confidence', value: governanceState.decisionConfidence, variant: 'info' }),
      createStatusRow({ label: 'Evidence Level', value: governanceState.evidenceLevel, variant: 'info' }),
      createStatusRow({ label: 'Guardrail Violations', value: metrics.guardrailViolations ?? 0, variant: 'good' })
    ]),
    events: { acknowledgeRestriction: action => createUIEvent(UIInteractionEvent.restrictionAcknowledged, { action }) },
    accessibility: ['governance changes announced without stealing focus', 'restriction reason visible as text'],
    guardrail: 'GovernanceSidebar displays backend-owned governance state and must not determine policy.'
  });
}

export function createGovernanceRestrictionBanner({ restrictedAction } = {}) {
  return deepFreeze({
    component: 'GovernanceRestrictionBanner',
    ownsBusinessLogic: false,
    restrictedAction,
    guardrail: 'Restriction banner displays backend-provided reason only.'
  });
}

function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
