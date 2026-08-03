import { WorkflowEventType, createWorkflowEvent } from '../contracts/index.js';

export class WorkflowContextStore {
  #contexts = new Map();
  save(context) { this.#contexts.set(context.workflowInstanceId, deepFreeze({ ...context })); return this.get(context.workflowInstanceId); }
  get(workflowInstanceId) { return this.#contexts.get(workflowInstanceId) || null; }
}

export class WorkflowContextManager {
  constructor({ contextStore = new WorkflowContextStore(), eventBus, projection, diagnostics } = {}) { this.contextStore = contextStore; this.eventBus = eventBus; this.projection = projection; this.diagnostics = diagnostics; }
  create({ workflowInstanceId, workflowId, activeWorkspace, activeStep = null, subject = null, userIntent = '' } = {}) {
    if (!workflowInstanceId || !workflowId) throw new Error('workflowInstanceId and workflowId are required');
    const context = this.contextStore.save({ workflowInstanceId, workflowId, activeWorkspace, activeStep, subject, breadcrumbs: [], selections: {}, pinnedArtifacts: [], userIntent, lastUpdatedAt: new Date().toISOString() });
    return context;
  }
  patch(workflowInstanceId, patch, user_id = 'system') {
    const current = this.contextStore.get(workflowInstanceId); if (!current) throw new Error(`Workflow context not found: ${workflowInstanceId}`);
    const next = this.contextStore.save({ ...current, ...patch, lastUpdatedAt: new Date().toISOString() });
    const event = createWorkflowEvent({ type: WorkflowEventType.WorkflowContextUpdated, workflow_id: current.workflowId, workflow_instance_id: workflowInstanceId, payload: { patch }, user_id, source: 'WorkflowContextManager' });
    this.eventBus?.publish(event); this.projection?.apply(event); this.diagnostics?.record?.('workflow.context.updated', { workflowInstanceId });
    return next;
  }
  snapshot(workflowInstanceId) { const context = this.contextStore.get(workflowInstanceId); if (!context) return null; return deepFreeze({ ...context }); }
}
function deepFreeze(obj) { Object.freeze(obj); for (const value of Object.values(obj)) if (value && typeof value === 'object' && !Object.isFrozen(value)) deepFreeze(value); return obj; }
