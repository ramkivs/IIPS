import { FeatureGate } from '../../../../../packages/feature-flags/src/index.js';
import { WorkflowEventType, createWorkflowEvent } from '../contracts/index.js';

export class CommandPaletteRegistry {
  #commands = new Map();
  register(command) { for (const key of ['commandId','label','featureFlag','execute']) if (!command?.[key]) throw new Error(`command.${key} is required`); if (typeof command.execute !== 'function') throw new Error('command.execute must be a function'); if (this.#commands.has(command.commandId)) throw new Error(`Command already registered: ${command.commandId}`); const record=Object.freeze({ description:'', ...command }); this.#commands.set(record.commandId, record); return record; }
  get(commandId) { return this.#commands.get(commandId) || null; }
  list() { return Object.freeze([...this.#commands.values()]); }
}

export class CommandExecutionService {
  constructor({ registry, featureFlagRegistry, environment = 'development', eventBus, diagnostics } = {}) { this.registry=registry; this.featureGate=new FeatureGate({ registry: featureFlagRegistry, environment }); this.eventBus=eventBus; this.diagnostics=diagnostics; }
  execute(commandId, args = {}, user_id = 'system') { const command=this.registry.get(commandId); if (!command) throw new Error(`Command not found: ${commandId}`); if (!this.featureGate.isEnabled(command.featureFlag)) return Object.freeze({ status:'blocked', reason:'feature_disabled', commandId }); const result=command.execute(args); const event=createWorkflowEvent({ type: WorkflowEventType.CommandExecuted, payload:{ commandId, args }, user_id, source:'CommandExecutionService' }); this.eventBus?.publish(event); this.diagnostics?.record?.('command.executed', { commandId }); return Object.freeze({ status:'executed', commandId, result, eventId:event.event_id }); }
}

export function registerDefaultWorkflowCommands(registry, { shell, workflowEngine, themeProvider } = {}) {
  const commands = [
    ['open-dashboard', 'Open Dashboard', 'dashboard_workspace', () => shell?.navigate?.('/dashboard')],
    ['open-research-workspace', 'Open Research Workspace', 'research_workspace', () => shell?.navigate?.('/research')],
    ['open-portfolio-workspace', 'Open Portfolio Workspace', 'portfolio_workspace', () => shell?.navigate?.('/portfolio')],
    ['open-decision-center', 'Open Decision Center', 'decision_center_workspace', () => shell?.navigate?.('/decision-center')],
    ['open-watchlists', 'Open Watchlists', 'watchlists_workspace', () => shell?.navigate?.('/watchlists')],
    ['open-methodologies', 'Open Methodologies', 'methodology_workspace', () => shell?.navigate?.('/methodologies')],
    ['start-placeholder-workflow', 'Start Placeholder Workflow', 'workflow_platform', args => workflowEngine?.start?.(args)],
    ['resume-recent-workflow', 'Resume Recent Workflow', 'workflow_platform', args => ({ resumed: args.workflowInstanceId })],
    ['switch-theme', 'Switch Theme', 'application_shell', args => themeProvider?.setTheme?.(args.theme || 'system')]
  ];
  commands.forEach(([commandId, label, featureFlag, execute]) => { if (!registry.get(commandId)) registry.register({ commandId, label, featureFlag, execute }); });
  return registry;
}
