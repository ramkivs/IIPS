import { WorkflowEventType } from '../contracts/index.js';

export class WorkflowProjection {
  constructor() { this.state = new Map(); }
  apply(event) {
    const id = event.workflow_instance_id || event.payload?.workflow_instance_id;
    if (!id) return null;
    const current = this.state.get(id) || { workflowInstanceId: id, status: 'Registered', activeStep: null, context: {}, events: [] };
    const next = { ...current, events: [...current.events, event.event_id || event.type] };
    if (event.type === WorkflowEventType.WorkflowStarted) next.status = 'Active';
    if (event.type === WorkflowEventType.WorkflowPaused) next.status = 'Paused';
    if (event.type === WorkflowEventType.WorkflowResumed) next.status = 'Active';
    if (event.type === WorkflowEventType.WorkflowCompleted) next.status = 'Completed';
    if (event.type === WorkflowEventType.WorkflowCancelled) next.status = 'Cancelled';
    if (event.type === WorkflowEventType.WorkflowFailed) next.status = 'Failed';
    if (event.type === WorkflowEventType.WorkflowStepActivated) next.activeStep = event.payload.stepId;
    if (event.type === WorkflowEventType.WorkflowContextUpdated) next.context = Object.freeze({ ...next.context, ...(event.payload.patch || {}) });
    this.state.set(id, Object.freeze(next));
    return this.get(id);
  }
  get(workflowInstanceId) { return this.state.get(workflowInstanceId) || null; }
  replay(events) { const projection = new WorkflowProjection(); events.forEach(e => projection.apply(e)); return projection; }
}
