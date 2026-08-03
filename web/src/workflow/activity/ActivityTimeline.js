import { createOpaqueId, ID_PREFIXES } from '../../../../../packages/shared-types/src/index.js';
import { WorkflowEventType, createWorkflowEvent } from '../contracts/index.js';

export class ActivityStore { constructor() { this.records=[]; } append(record) { const frozen=Object.freeze({ ...record }); this.records.push(frozen); return frozen; } list() { return Object.freeze(this.records.slice()); } byWorkflow(workflowInstanceId) { return Object.freeze(this.records.filter(r=>r.workflowInstanceId===workflowInstanceId)); } recent(limit=10) { return Object.freeze(this.records.slice(-limit).reverse()); } }
export class ActivityProjector { project(event) { return Object.freeze({ activityId:createOpaqueId(ID_PREFIXES.activity), workflowInstanceId:event.workflow_instance_id || event.payload?.workflow_instance_id || null, type:event.type, title:event.type, description:`Workflow event recorded: ${event.type}`, source:event.source || 'workflow', eventId:event.event_id || null, createdAt:event.timestamp || new Date().toISOString() }); } }
export class ActivityTimeline {
  constructor({ store = new ActivityStore(), projector = new ActivityProjector(), eventBus, diagnostics } = {}) { this.store=store; this.projector=projector; this.eventBus=eventBus; this.diagnostics=diagnostics; }
  record(event, user_id = 'system') { const activity=this.store.append(this.projector.project(event)); const emitted=createWorkflowEvent({ type: WorkflowEventType.ActivityRecorded, workflow_instance_id: activity.workflowInstanceId, payload:{ activityId: activity.activityId, sourceEventId: activity.eventId }, user_id, source:'ActivityTimeline' }); this.eventBus?.publish(emitted); this.diagnostics?.record?.('activity.recorded', { activityId: activity.activityId }); return activity; }
  byWorkflow(workflowInstanceId) { return this.store.byWorkflow(workflowInstanceId); }
  recent(limit) { return this.store.recent(limit); }
}
