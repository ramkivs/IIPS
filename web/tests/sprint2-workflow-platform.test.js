import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/bootstrap/createApp.js';
import { createApplicationShell } from '../src/shell/index.js';
import {
  WorkflowCommandType,
  WorkflowEventType,
  createWorkflowCommand,
  createWorkflowEvent,
  validateWorkflowCommand,
  validateWorkflowEvent,
  WorkflowRegistry,
  WorkflowStatus,
  WorkflowLifecycle,
  WorkflowInstanceStore,
  WorkflowProjection,
  WorkflowEngine,
  WorkflowContextManager,
  WorkflowContextStore,
  CrossWorkspaceStateBus,
  WorkspaceStateProjection,
  TransactionManager,
  TransactionRegistry,
  TransactionLog,
  SessionManager,
  SessionStateStore,
  RecentWorkflowStore,
  CommandPaletteRegistry,
  CommandExecutionService,
  NotificationCenter,
  NotificationStore,
  ActivityTimeline,
  ActivityStore,
  createWorkflowPlatform,
  registerDefaultWorkflowFeatureFlags
} from '../src/workflow/index.js';
import { ID_PREFIXES } from '../../../packages/shared-types/src/index.js';

function runtime() {
  const app = createApp({ env: { NODE_ENV: 'test' } });
  const shellRuntime = createApplicationShell({ app });
  const workflowRuntime = createWorkflowPlatform({ app, shellRuntime });
  return { app, shellRuntime, workflowRuntime };
}

test('workflow ID prefixes are governed shared platform prefixes', () => {
  assert.equal(ID_PREFIXES.workflow, 'WF');
  assert.equal(ID_PREFIXES.workflowInstance, 'WFI');
  assert.equal(ID_PREFIXES.transaction, 'TXN');
  assert.equal(ID_PREFIXES.session, 'SES');
  assert.equal(ID_PREFIXES.activity, 'ACT');
  assert.equal(ID_PREFIXES.notification, 'NTF');
});

test('workflow command and event contracts validate required audit fields', () => {
  const command = createWorkflowCommand({ type: WorkflowCommandType.StartWorkflow, payload: { workflowId: 'WF_1' }, user_id: 'u1' });
  assert.equal(validateWorkflowCommand(command), true);
  assert.throws(() => createWorkflowCommand({ type: 'RankStock' }));

  const event = createWorkflowEvent({ type: WorkflowEventType.WorkflowStarted, workflow_instance_id: 'WFI_1', workflow_id: 'WF_1', command_id: command.id, correlation_id: command.correlationId, causation_id: command.id, user_id: 'u1' });
  assert.equal(validateWorkflowEvent(event), true);
  assert.equal(event.metadata.audit.workflow_instance_id, 'WFI_1');
  assert.equal(event.metadata.audit.command_id, command.id);
  assert.equal(event.metadata.audit.correlation_id, command.correlationId);
  assert.equal(event.metadata.audit.causation_id, command.id);
  assert.throws(() => validateWorkflowEvent({ type: WorkflowEventType.WorkflowStarted }));
});

test('workflow registry registers versioned definitions and rejects duplicates/invalid definitions', () => {
  const { app } = runtime();
  const registry = new WorkflowRegistry({ eventBus: app.container.resolve('eventBus'), diagnostics: app.diagnostics });
  const definition = registry.register({ workflowId: 'WF_TEST', version: '1.0.0', name: 'Test Workflow', owner: 'test', status: WorkflowStatus.active, featureFlag: 'workflow_platform', entryWorkspace: 'dashboard', steps: [{ stepId: 'start' }] });
  registry.register({ ...definition, version: '1.1.0' });

  assert.equal(registry.get('WF_TEST', '1.0.0').version, '1.0.0');
  assert.equal(registry.get('WF_TEST').version, '1.1.0');
  assert.equal(registry.byStatus(WorkflowStatus.active).length, 2);
  assert.equal(registry.byFeatureFlag('workflow_platform').length, 2);
  assert.throws(() => registry.register(definition));
  assert.throws(() => registry.register({ workflowId: 'WF_BAD' }));
  assert.equal(app.container.resolve('eventStore').all().some(event => event.type === WorkflowEventType.WorkflowRegistered), true);
});

test('workflow engine starts, version-locks, transitions, projects, replays, and reports health', () => {
  const { workflowRuntime, app } = runtime();
  const definition = workflowRuntime.workflowRegistry.list()[0];
  const started = workflowRuntime.workflowEngine.start({ workflowId: definition.workflowId, version: definition.version, user_id: 'u1', subject: { type: 'generic', id: 'SUB_1', label: 'Subject' } });

  assert.equal(started.status, 'started');
  assert.equal(started.instance.workflowDefinitionVersion, definition.version);
  assert.match(started.instance.workflowInstanceId, /^WFI_/);
  assert.equal(workflowRuntime.projection.get(started.instance.workflowInstanceId).status, 'Active');

  workflowRuntime.workflowEngine.pause(started.instance.workflowInstanceId, 'u1');
  assert.equal(workflowRuntime.projection.get(started.instance.workflowInstanceId).status, 'Paused');
  workflowRuntime.workflowEngine.resume(started.instance.workflowInstanceId, 'u1');
  workflowRuntime.workflowEngine.activateStep(started.instance.workflowInstanceId, 'review', 'u1');
  workflowRuntime.workflowEngine.completeStep(started.instance.workflowInstanceId, 'review', 'u1');
  workflowRuntime.workflowEngine.complete(started.instance.workflowInstanceId, 'u1');
  assert.equal(workflowRuntime.projection.get(started.instance.workflowInstanceId).status, 'Completed');

  assert.throws(() => workflowRuntime.workflowEngine.pause(started.instance.workflowInstanceId, 'u1'));
  assert.equal(workflowRuntime.workflowEngine.healthMetrics().failedTransitions, 1);
  assert.equal(workflowRuntime.workflowEngine.healthMetrics().averageCompletionTime >= 0, true);

  const events = app.container.resolve('eventStore').all().filter(event => event.workflow_instance_id === started.instance.workflowInstanceId);
  const replayed = new WorkflowProjection().replay(events);
  assert.equal(replayed.get(started.instance.workflowInstanceId).status, 'Completed');
});

test('workflow engine fails closed when workflow feature flag is disabled or missing', () => {
  const app = createApp({ env: { NODE_ENV: 'test' } });
  const flags = app.container.resolve('featureFlagRegistry');
  flags.register({ flag_id: 'workflow_platform', default_enabled: false, owner: 'test', status: 'active' });
  const registry = new WorkflowRegistry();
  const definition = registry.register({ workflowId: 'WF_DISABLED', version: '1.0.0', name: 'Disabled Workflow', owner: 'test', status: 'active', featureFlag: 'workflow_platform', entryWorkspace: 'dashboard', steps: [{ stepId: 'start' }] });
  const engine = new WorkflowEngine({ workflowRegistry: registry, instanceStore: new WorkflowInstanceStore(), projection: new WorkflowProjection(), featureFlagRegistry: flags, environment: 'test' });
  assert.equal(engine.start({ workflowId: definition.workflowId }).status, 'blocked');

  const missingRegistry = new WorkflowRegistry();
  missingRegistry.register({ workflowId: 'WF_MISSING', version: '1.0.0', name: 'Missing Flag Workflow', owner: 'test', status: 'active', featureFlag: 'missing_workflow_flag', entryWorkspace: 'dashboard', steps: [{ stepId: 'start' }] });
  const missingEngine = new WorkflowEngine({ workflowRegistry: missingRegistry, instanceStore: new WorkflowInstanceStore(), projection: new WorkflowProjection(), featureFlagRegistry: flags, environment: 'test' });
  assert.equal(missingEngine.start({ workflowId: 'WF_MISSING' }).status, 'blocked');
});

test('workflow context patches immutably and cross-workspace state propagates through platform bus only', () => {
  const { workflowRuntime, app } = runtime();
  const definition = workflowRuntime.workflowRegistry.list()[0];
  const started = workflowRuntime.workflowEngine.start({ workflowId: definition.workflowId, version: definition.version });
  const context = workflowRuntime.contextManager.create({ workflowInstanceId: started.instance.workflowInstanceId, workflowId: definition.workflowId, activeWorkspace: 'dashboard', activeStep: 'intake', subject: { type: 'generic', id: 'S1', label: 'Generic Subject' } });
  const patched = workflowRuntime.contextManager.patch(context.workflowInstanceId, { activeWorkspace: 'research', activeStep: 'review' }, 'u1');

  assert.notEqual(context, patched);
  assert.equal(context.activeWorkspace, 'dashboard');
  assert.equal(patched.activeWorkspace, 'research');
  assert.throws(() => { workflowRuntime.contextManager.snapshot(context.workflowInstanceId).activeWorkspace = 'portfolio'; });

  const projection = new WorkspaceStateProjection({ workspaceId: 'research' });
  const sub = workflowRuntime.stateBus.subscribe({ workspaceId: 'research', featureFlag: 'research_workspace', projection });
  assert.equal(sub.status, 'subscribed');
  const updates = workflowRuntime.stateBus.publishContext(patched);
  assert.equal(updates.length >= 1, true);
  assert.equal(projection.getState().activeWorkspace, 'research');
  assert.throws(() => workflowRuntime.stateBus.mutateWorkspaceDirectly());

  const blockedBus = new CrossWorkspaceStateBus({ featureFlagRegistry: app.container.resolve('featureFlagRegistry'), environment: 'test' });
  assert.equal(blockedBus.subscribe({ workspaceId: 'blocked', featureFlag: 'missing_flag' }).status, 'blocked');
});

test('transaction manager starts, commits, rolls back with compensating event, and preserves log append-only behavior', () => {
  const { app } = runtime();
  const manager = new TransactionManager({ registry: new TransactionRegistry(), log: new TransactionLog(), eventBus: app.container.resolve('eventBus'), diagnostics: app.diagnostics });
  const first = manager.start({ workflowInstanceId: 'WFI_TXN', name: 'Workflow Operation' });
  assert.match(first.transactionId, /^TXN_/);
  const committed = manager.commit(first.transactionId);
  assert.equal(committed.status, 'Committed');
  assert.throws(() => manager.rollback(first.transactionId));

  const second = manager.start({ workflowInstanceId: 'WFI_TXN', name: 'Workflow Operation 2' });
  const rolledBack = manager.rollback(second.transactionId, 'test compensation');
  assert.equal(rolledBack.status, 'RolledBack');
  assert.equal(rolledBack.compensationPolicy.type, 'compensating_event');
  assert.equal(manager.log.list().length, 4);
});

test('session manager starts, restores, tracks recent workflows, route, workspace, and theme continuity', () => {
  const { app } = runtime();
  const manager = new SessionManager({ store: new SessionStateStore(), recentWorkflowStore: new RecentWorkflowStore(), eventBus: app.container.resolve('eventBus'), diagnostics: app.diagnostics });
  const session = manager.start({ userId: 'u1', activeWorkspace: 'dashboard', lastRoute: '/', theme: 'dark' });
  assert.match(session.sessionId, /^SES_/);
  const touched = manager.touch(session.sessionId, { activeWorkflowInstanceId: 'WFI_RECENT', activeWorkspace: 'research', lastRoute: '/research' });
  assert.equal(touched.recentWorkflows[0].workflowInstanceId, 'WFI_RECENT');
  const restored = manager.restore(session.sessionId);
  assert.equal(restored.lastRoute, '/research');
  assert.equal(restored.theme, 'dark');
  assert.equal(manager.healthMetrics().sessionRestores, 1);
  const ended = manager.end(session.sessionId);
  assert.ok(ended.endedAt);
  assert.throws(() => manager.restore(session.sessionId));
});

test('command palette registers feature-gated workflow/platform commands and emits execution event', () => {
  const { app, shellRuntime } = runtime();
  registerDefaultWorkflowFeatureFlags(app.container.resolve('featureFlagRegistry'));
  const registry = new CommandPaletteRegistry();
  registry.register({ commandId: 'open-dashboard', label: 'Open Dashboard', featureFlag: 'dashboard_workspace', execute: () => shellRuntime.shell.navigate('/dashboard') });
  assert.throws(() => registry.register({ commandId: 'open-dashboard', label: 'Duplicate', featureFlag: 'dashboard_workspace', execute: () => null }));
  const service = new CommandExecutionService({ registry, featureFlagRegistry: app.container.resolve('featureFlagRegistry'), environment: 'test', eventBus: app.container.resolve('eventBus'), diagnostics: app.diagnostics });
  const result = service.execute('open-dashboard', {}, 'u1');
  assert.equal(result.status, 'executed');
  assert.equal(app.container.resolve('eventStore').all().some(event => event.type === WorkflowEventType.CommandExecuted), true);

  registry.register({ commandId: 'blocked', label: 'Blocked', featureFlag: 'missing_flag', execute: () => 'never' });
  assert.equal(service.execute('blocked').status, 'blocked');
});

test('notification center raises, acknowledges, queries, and reports failures without recommendations', () => {
  const { app } = runtime();
  const center = new NotificationCenter({ store: new NotificationStore(), eventBus: app.container.resolve('eventBus'), diagnostics: app.diagnostics });
  const notification = center.raise({ type: 'info', title: 'Workflow status', message: 'Workflow started', workflowInstanceId: 'WFI_NTF' });
  assert.match(notification.notificationId, /^NTF_/);
  assert.equal(center.store.unread().length, 1);
  center.acknowledge(notification.notificationId);
  assert.equal(center.store.read().length, 1);
  const failure = center.fromWorkflowFailure({ workflowInstanceId: 'WFI_NTF', message: 'Step failed' });
  assert.equal(failure.type, 'error');
  assert.throws(() => center.raise({ type: 'recommendation', title: 'Bad', message: 'Bad' }));
  assert.equal(center.healthMetrics().notificationFailures, 1);
});

test('activity timeline projects workflow events into append-only activity records', () => {
  const { app } = runtime();
  const timeline = new ActivityTimeline({ store: new ActivityStore(), eventBus: app.container.resolve('eventBus'), diagnostics: app.diagnostics });
  const event = createWorkflowEvent({ type: WorkflowEventType.WorkflowStarted, workflow_instance_id: 'WFI_ACT', workflow_id: 'WF_ACT' });
  const activity = timeline.record(event);
  assert.match(activity.activityId, /^ACT_/);
  assert.equal(timeline.byWorkflow('WFI_ACT').length, 1);
  assert.equal(timeline.recent(1)[0].activityId, activity.activityId);
  assert.throws(() => { activity.title = 'mutated'; });
});

test('Sprint 2 integrated demo flow validates workflow continuity without investment logic', () => {
  const { app, shellRuntime, workflowRuntime } = runtime();
  const shellStart = shellRuntime.shell.start('/');
  assert.equal(shellStart.status, 'mounted');

  const definition = workflowRuntime.workflowRegistry.list()[0];
  const startResult = workflowRuntime.commandExecutionService.execute('start-placeholder-workflow', { workflowId: definition.workflowId, version: definition.version }, 'u1');
  assert.equal(startResult.status, 'executed');
  const workflowInstanceId = startResult.result.instance.workflowInstanceId;

  const context = workflowRuntime.contextManager.create({ workflowInstanceId, workflowId: definition.workflowId, activeWorkspace: 'dashboard', activeStep: 'intake' });
  const research = shellRuntime.shell.navigate('/research');
  assert.equal(research.status, 'mounted');
  const moved = workflowRuntime.contextManager.patch(workflowInstanceId, { activeWorkspace: 'research' }, 'u1');

  workflowRuntime.stateBus.subscribe({ workspaceId: 'research', featureFlag: 'research_workspace' });
  assert.equal(workflowRuntime.stateBus.publishContext(moved).length, 1);

  const session = workflowRuntime.sessionManager.start({ userId: 'u1', activeWorkflowInstanceId: workflowInstanceId, activeWorkspace: 'research', lastRoute: '/research', theme: 'dark' });
  workflowRuntime.sessionManager.touch(session.sessionId, { activeWorkflowInstanceId: workflowInstanceId });
  const note = workflowRuntime.notificationCenter.raise({ type: 'success', title: 'Workflow status', message: 'Placeholder workflow active', workflowInstanceId });
  assert.match(note.notificationId, /^NTF_/);

  const workflowEvent = app.container.resolve('eventStore').all().find(event => event.workflow_instance_id === workflowInstanceId && event.type === WorkflowEventType.WorkflowStarted);
  const activity = workflowRuntime.activityTimeline.record(workflowEvent);
  assert.match(activity.activityId, /^ACT_/);

  workflowRuntime.sessionManager.restore(session.sessionId);
  assert.equal(workflowRuntime.sessionManager.healthMetrics().sessionRestores, 1);
  assert.equal(context.workflowId, definition.workflowId);

  const serialized = JSON.stringify({ definitions: workflowRuntime.workflowRegistry.list(), events: app.container.resolve('eventStore').all() }).toLowerCase();
  for (const forbidden of ['valuation model', 'stock scoring', 'portfolio calculation', 'market data provider', 'investment recommendation', 'decision automation']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});
