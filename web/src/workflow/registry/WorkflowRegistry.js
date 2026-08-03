import { createOpaqueId, ID_PREFIXES } from '../../../../../packages/shared-types/src/index.js';
import { WorkflowEventType, createWorkflowEvent, assertRequiredFields } from '../contracts/index.js';

export const WorkflowStatus = Object.freeze({ draft: 'draft', active: 'active', deprecated: 'deprecated', retired: 'retired' });

export class WorkflowRegistry {
  #definitions = new Map();
  constructor({ eventBus, diagnostics } = {}) { this.eventBus = eventBus; this.diagnostics = diagnostics; }

  register(definition) {
    assertRequiredFields(definition, ['workflowId', 'version', 'name', 'owner', 'status', 'featureFlag', 'entryWorkspace', 'steps'], 'workflowDefinition');
    if (!Object.values(WorkflowStatus).includes(definition.status)) throw new Error(`Invalid workflow status: ${definition.status}`);
    if (!Array.isArray(definition.steps)) throw new Error('workflowDefinition.steps must be an array');
    const key = this.#key(definition.workflowId, definition.version);
    if (this.#definitions.has(key)) throw new Error(`Workflow definition already registered: ${key}`);
    const record = deepFreeze({ description: '', capabilities: [], createdAt: new Date().toISOString(), ...definition });
    this.#definitions.set(key, record);
    this.diagnostics?.record?.('workflow.registered', { workflowId: record.workflowId, version: record.version });
    this.eventBus?.publish(createWorkflowEvent({ type: WorkflowEventType.WorkflowRegistered, workflow_id: record.workflowId, payload: { workflowId: record.workflowId, version: record.version }, source: 'WorkflowRegistry' }));
    return record;
  }

  get(workflowId, version) {
    if (version) return this.#definitions.get(this.#key(workflowId, version)) || null;
    return this.list().filter(d => d.workflowId === workflowId).sort((a,b) => String(b.version).localeCompare(String(a.version)))[0] || null;
  }
  list() { return Object.freeze([...this.#definitions.values()]); }
  byStatus(status) { return Object.freeze(this.list().filter(d => d.status === status)); }
  byFeatureFlag(featureFlag) { return Object.freeze(this.list().filter(d => d.featureFlag === featureFlag)); }
  #key(workflowId, version) { return `${workflowId}@${version}`; }
}

export function createPlaceholderWorkflowDefinitions() {
  const base = [
    ['company-analysis-placeholder', 'Company Analysis Placeholder', 'dashboard'],
    ['research-review-placeholder', 'Research Review Placeholder', 'research'],
    ['decision-preparation-placeholder', 'Decision Preparation Placeholder', 'decision-center'],
    ['portfolio-review-placeholder', 'Portfolio Review Placeholder', 'portfolio'],
    ['monitoring-review-placeholder', 'Monitoring Review Placeholder', 'watchlists']
  ];
  return Object.freeze(base.map(([slug, name, entryWorkspace], index) => deepFreeze({
    workflowId: createOpaqueId(ID_PREFIXES.workflow, String(index + 1)),
    slug,
    version: '1.0.0',
    name,
    description: 'Workflow placeholder only. No investment logic is implemented.',
    owner: 'workflow-platform',
    status: WorkflowStatus.active,
    featureFlag: 'workflow_platform',
    entryWorkspace,
    steps: [{ stepId: 'intake', label: 'Intake Placeholder' }, { stepId: 'review', label: 'Review Placeholder' }],
    capabilities: [],
    businessLogic: false,
    createdAt: new Date().toISOString()
  })));
}

function deepFreeze(obj) { Object.freeze(obj); for (const value of Object.values(obj)) if (value && typeof value === 'object' && !Object.isFrozen(value)) deepFreeze(value); return obj; }
