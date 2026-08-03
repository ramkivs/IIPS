import { FeatureGate } from '../../../../../packages/feature-flags/src/index.js';
import { createOpaqueId, ID_PREFIXES } from '../../../../../packages/shared-types/src/index.js';
import { WorkflowEventType, createWorkflowEvent } from '../contracts/index.js';
import { WorkflowLifecycle, WorkflowLifecycleState } from './WorkflowLifecycle.js';

export class WorkflowEngine {
  constructor({ workflowRegistry, instanceStore, projection, featureFlagRegistry, environment = 'development', eventBus, diagnostics } = {}) {
    this.workflowRegistry = workflowRegistry; this.instanceStore = instanceStore; this.projection = projection; this.eventBus = eventBus; this.diagnostics = diagnostics;
    this.featureGate = new FeatureGate({ registry: featureFlagRegistry, environment });
    this.lifecycle = new WorkflowLifecycle(); this.failedTransitions = 0; this.completions = [];
  }
  start({ workflowId, version, user_id = 'system', subject = null } = {}) {
    const definition = this.workflowRegistry.get(workflowId, version);
    if (!definition) throw new Error(`Workflow definition not found: ${workflowId}`);
    if (!this.featureGate.isEnabled(definition.featureFlag)) return Object.freeze({ status: 'blocked', reason: 'feature_disabled', workflowId });
    const now = new Date().toISOString();
    const instance = this.instanceStore.save({ workflowInstanceId: createOpaqueId(ID_PREFIXES.workflowInstance), workflowId: definition.workflowId, workflowDefinitionVersion: definition.version, status: WorkflowLifecycleState.Started, activeStep: definition.steps[0]?.stepId || null, subject, startedAt: now, updatedAt: now });
    this.#publish(WorkflowEventType.WorkflowStarted, instance, { entryWorkspace: definition.entryWorkspace }, user_id);
    if (instance.activeStep) this.#publish(WorkflowEventType.WorkflowStepActivated, instance, { stepId: instance.activeStep }, user_id);
    this.diagnostics?.record?.('workflow.started', { workflowInstanceId: instance.workflowInstanceId });
    return Object.freeze({ status: 'started', instance, projection: this.projection.get(instance.workflowInstanceId) });
  }
  pause(workflowInstanceId, user_id = 'system') { return this.#transition(workflowInstanceId, WorkflowLifecycleState.Paused, WorkflowEventType.WorkflowPaused, user_id); }
  resume(workflowInstanceId, user_id = 'system') { return this.#transition(workflowInstanceId, WorkflowLifecycleState.Resumed, WorkflowEventType.WorkflowResumed, user_id, WorkflowLifecycleState.Active); }
  complete(workflowInstanceId, user_id = 'system') { const r=this.#transition(workflowInstanceId, WorkflowLifecycleState.Completed, WorkflowEventType.WorkflowCompleted, user_id); this.completions.push(Date.now() - Date.parse(r.instance.startedAt)); return r; }
  cancel(workflowInstanceId, user_id = 'system') { return this.#transition(workflowInstanceId, WorkflowLifecycleState.Cancelled, WorkflowEventType.WorkflowCancelled, user_id); }
  fail(workflowInstanceId, message = 'Workflow failed', user_id = 'system') { return this.#transition(workflowInstanceId, WorkflowLifecycleState.Failed, WorkflowEventType.WorkflowFailed, user_id, undefined, { message }); }
  activateStep(workflowInstanceId, stepId, user_id = 'system') { const i=this.#require(workflowInstanceId); const next=this.instanceStore.save({ ...i, activeStep: stepId, updatedAt: new Date().toISOString() }); this.#publish(WorkflowEventType.WorkflowStepActivated, next, { stepId }, user_id); return Object.freeze({ status: 'step_activated', instance: next }); }
  completeStep(workflowInstanceId, stepId, user_id = 'system') { const i=this.#require(workflowInstanceId); this.#publish(WorkflowEventType.WorkflowStepCompleted, i, { stepId }, user_id); return Object.freeze({ status: 'step_completed', instance: i }); }
  healthMetrics() { const all=this.instanceStore.list(); return Object.freeze({ activeWorkflows: all.filter(i => i.status === 'Active' || i.status === 'Started' || i.status === 'Resumed').length, failedWorkflows: all.filter(i => i.status === 'Failed').length, pausedWorkflows: all.filter(i => i.status === 'Paused').length, averageCompletionTime: this.completions.length ? this.completions.reduce((a,b)=>a+b,0)/this.completions.length : 0, failedTransitions: this.failedTransitions }); }
  #transition(id, state, eventType, user_id, storedState = state, payload = {}) { const i=this.#require(id); try { this.lifecycle.transition(i.status, state); } catch (e) { this.failedTransitions++; throw e; } const next=this.instanceStore.save({ ...i, status: storedState, updatedAt: new Date().toISOString() }); this.#publish(eventType, next, payload, user_id); return Object.freeze({ status: String(eventType).replace('Workflow','').toLowerCase(), instance: next, projection: this.projection.get(id) }); }
  #publish(type, instance, payload, user_id) { const event=createWorkflowEvent({ type, workflow_id: instance.workflowId, workflow_instance_id: instance.workflowInstanceId, payload, user_id, source:'WorkflowEngine' }); this.eventBus?.publish(event); this.projection?.apply(event); return event; }
  #require(id) { const i=this.instanceStore.get(id); if (!i) throw new Error(`Workflow instance not found: ${id}`); return i; }
}
