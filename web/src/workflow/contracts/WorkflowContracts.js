import { createOpaqueId, ID_PREFIXES, createPlatformEvent } from '../../../../../packages/shared-types/src/index.js';

export const WorkflowEventType = Object.freeze({
  WorkflowRegistered: 'WorkflowRegistered',
  WorkflowStarted: 'WorkflowStarted',
  WorkflowResumed: 'WorkflowResumed',
  WorkflowPaused: 'WorkflowPaused',
  WorkflowCompleted: 'WorkflowCompleted',
  WorkflowCancelled: 'WorkflowCancelled',
  WorkflowFailed: 'WorkflowFailed',
  WorkflowContextUpdated: 'WorkflowContextUpdated',
  WorkflowStepActivated: 'WorkflowStepActivated',
  WorkflowStepCompleted: 'WorkflowStepCompleted',
  WorkflowStepFailed: 'WorkflowStepFailed',
  TransactionStarted: 'TransactionStarted',
  TransactionCommitted: 'TransactionCommitted',
  TransactionRolledBack: 'TransactionRolledBack',
  SessionStarted: 'SessionStarted',
  SessionRestored: 'SessionRestored',
  SessionEnded: 'SessionEnded',
  CommandExecuted: 'CommandExecuted',
  NotificationRaised: 'NotificationRaised',
  ActivityRecorded: 'ActivityRecorded'
});

export const WorkflowCommandType = Object.freeze({
  StartWorkflow: 'StartWorkflow',
  ResumeWorkflow: 'ResumeWorkflow',
  PauseWorkflow: 'PauseWorkflow',
  CompleteWorkflow: 'CompleteWorkflow',
  CancelWorkflow: 'CancelWorkflow',
  UpdateWorkflowContext: 'UpdateWorkflowContext',
  ActivateWorkflowStep: 'ActivateWorkflowStep',
  CompleteWorkflowStep: 'CompleteWorkflowStep',
  StartTransaction: 'StartTransaction',
  CommitTransaction: 'CommitTransaction',
  RollbackTransaction: 'RollbackTransaction',
  RestoreSession: 'RestoreSession',
  ExecuteCommand: 'ExecuteCommand',
  RaiseNotification: 'RaiseNotification',
  RecordActivity: 'RecordActivity'
});

export function assertRequiredFields(record, fields, label = 'record') {
  for (const field of fields) {
    if (record?.[field] === undefined || record?.[field] === null || record?.[field] === '') throw new Error(`${label}.${field} is required`);
  }
  return true;
}

export function createWorkflowCommand({ type, payload = {}, user_id = 'system', id, correlationId } = {}) {
  if (!Object.values(WorkflowCommandType).includes(type)) throw new Error(`Unknown workflow command: ${type}`);
  return Object.freeze({
    id: id || createOpaqueId(ID_PREFIXES.command),
    type,
    payload: Object.freeze({ ...payload }),
    user_id,
    correlationId: correlationId || createOpaqueId('CORR'),
    createdAt: new Date().toISOString()
  });
}

export function createWorkflowEvent({ type, workflow_instance_id, workflow_id, payload = {}, user_id = 'system', command_id, correlation_id, causation_id, source = 'WorkflowPlatform' } = {}) {
  if (!Object.values(WorkflowEventType).includes(type)) throw new Error(`Unknown workflow event: ${type}`);
  const event_id = createOpaqueId(ID_PREFIXES.event);
  const timestamp = new Date().toISOString();
  const audit = Object.freeze({
    event_id,
    workflow_instance_id: workflow_instance_id || null,
    user_id,
    timestamp,
    command_id: command_id || null,
    correlation_id: correlation_id || null,
    causation_id: causation_id || null
  });
  const event = createPlatformEvent({
    type,
    source,
    payload: Object.freeze({ workflow_id: workflow_id || null, workflow_instance_id: workflow_instance_id || null, ...payload, audit }),
    correlationId: correlation_id,
    metadata: { audit }
  });
  return Object.freeze({ ...event, event_id, workflow_instance_id: workflow_instance_id || null, user_id, timestamp, command_id: command_id || null, causationId: causation_id || event.causationId });
}

export function validateWorkflowCommand(command) {
  assertRequiredFields(command, ['id', 'type', 'payload', 'user_id', 'correlationId'], 'command');
  if (!Object.values(WorkflowCommandType).includes(command.type)) throw new Error(`Unknown workflow command: ${command.type}`);
  return true;
}

export function validateWorkflowEvent(event) {
  assertRequiredFields(event, ['event_id', 'type', 'user_id', 'timestamp'], 'event');
  if (!Object.values(WorkflowEventType).includes(event.type)) throw new Error(`Unknown workflow event: ${event.type}`);
  const audit = event.metadata?.audit || event.payload?.audit;
  assertRequiredFields(audit, ['event_id', 'user_id', 'timestamp'], 'event.audit');
  return true;
}
