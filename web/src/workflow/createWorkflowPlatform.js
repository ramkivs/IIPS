import { FlagStatus } from '../../../../packages/feature-flags/src/index.js';
import { WorkflowRegistry, createPlaceholderWorkflowDefinitions } from './registry/index.js';
import { WorkflowEngine, WorkflowInstanceStore, WorkflowProjection } from './engine/index.js';
import { WorkflowContextManager, WorkflowContextStore } from './context/index.js';
import { CrossWorkspaceStateBus } from './state/index.js';
import { TransactionManager, TransactionRegistry, TransactionLog } from './transactions/index.js';
import { SessionManager, SessionStateStore, RecentWorkflowStore } from './session/index.js';
import { CommandPaletteRegistry, CommandExecutionService, registerDefaultWorkflowCommands } from './commands/index.js';
import { NotificationCenter, NotificationStore } from './notifications/index.js';
import { ActivityTimeline, ActivityStore } from './activity/index.js';

export function registerDefaultWorkflowFeatureFlags(registry, { enabled = true } = {}) {
  for (const flag_id of ['workflow_platform', 'workflow_commands', 'workflow_notifications', 'workflow_activity', 'workflow_sessions']) {
    if (!registry.get(flag_id)) registry.register({ flag_id, default_enabled: enabled, owner: 'workflow-platform', status: FlagStatus.active });
  }
  return registry;
}

export function createWorkflowPlatform({ app, shellRuntime } = {}) {
  const container = app.container;
  const eventBus = container.resolve('eventBus');
  const diagnostics = container.resolve('diagnostics');
  const featureFlagRegistry = container.resolve('featureFlagRegistry');
  registerDefaultWorkflowFeatureFlags(featureFlagRegistry);

  const workflowRegistry = new WorkflowRegistry({ eventBus, diagnostics });
  createPlaceholderWorkflowDefinitions().forEach(definition => workflowRegistry.register(definition));
  const instanceStore = new WorkflowInstanceStore();
  const projection = new WorkflowProjection();
  const workflowEngine = new WorkflowEngine({ workflowRegistry, instanceStore, projection, featureFlagRegistry, environment: app.config.environment, eventBus, diagnostics });
  const contextManager = new WorkflowContextManager({ contextStore: new WorkflowContextStore(), eventBus, projection, diagnostics });
  const stateBus = new CrossWorkspaceStateBus({ featureFlagRegistry, environment: app.config.environment, diagnostics });
  const transactionManager = new TransactionManager({ registry: new TransactionRegistry(), log: new TransactionLog(), eventBus, diagnostics });
  const sessionManager = new SessionManager({ store: new SessionStateStore(), recentWorkflowStore: new RecentWorkflowStore(), eventBus, diagnostics });
  const commandRegistry = new CommandPaletteRegistry();
  registerDefaultWorkflowCommands(commandRegistry, { shell: shellRuntime?.shell, workflowEngine, themeProvider: shellRuntime?.themeProvider });
  const commandExecutionService = new CommandExecutionService({ registry: commandRegistry, featureFlagRegistry, environment: app.config.environment, eventBus, diagnostics });
  const notificationCenter = new NotificationCenter({ store: new NotificationStore(), eventBus, diagnostics });
  const activityTimeline = new ActivityTimeline({ store: new ActivityStore(), eventBus, diagnostics });

  const runtime = Object.freeze({ workflowRegistry, instanceStore, projection, workflowEngine, contextManager, stateBus, transactionManager, sessionManager, commandRegistry, commandExecutionService, notificationCenter, activityTimeline });
  for (const [key, value] of Object.entries(runtime)) if (!container.has(key)) container.register(key, value);
  return runtime;
}
