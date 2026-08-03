import { FeatureGate } from '../../../../packages/feature-flags/src/index.js';
import { ShellEventType, publishShellEvent } from '../shell/events.js';
import { WorkspaceLifecycleState } from './WorkspaceLifecycle.js';

export class WorkspaceHost {
  constructor({ workspaceRegistry, lifecycle, featureFlagRegistry, environment = 'development', eventBus, diagnostics } = {}) {
    this.workspaceRegistry = workspaceRegistry;
    this.lifecycle = lifecycle;
    this.featureGate = new FeatureGate({ registry: featureFlagRegistry, environment });
    this.eventBus = eventBus;
    this.diagnostics = diagnostics;
    this.activeWorkspaceId = null;
  }

  mount(workspaceId) {
    const workspace = this.workspaceRegistry.get(workspaceId);
    if (!workspace) return this.#fail(workspaceId, 'Workspace not registered');
    if (!this.featureGate.isEnabled(workspace.featureFlag)) {
      this.lifecycle?.record?.(workspaceId, WorkspaceLifecycleState.blocked, { featureFlag: workspace.featureFlag });
      publishShellEvent({ eventBus: this.eventBus, diagnostics: this.diagnostics, type: ShellEventType.FeatureBlocked, payload: { workspaceId, featureFlag: workspace.featureFlag }, source: 'WorkspaceHost' });
      return Object.freeze({ status: 'blocked', workspaceId, reason: 'feature_disabled' });
    }
    this.activeWorkspaceId = workspaceId;
    this.lifecycle?.record?.(workspaceId, WorkspaceLifecycleState.mounted);
    publishShellEvent({ eventBus: this.eventBus, diagnostics: this.diagnostics, type: ShellEventType.WorkspaceMounted, payload: { workspaceId }, source: 'WorkspaceHost' });
    const view = workspace.render({ workspaceId, label: workspace.label });
    this.lifecycle?.record?.(workspaceId, WorkspaceLifecycleState.rendered);
    this.lifecycle?.record?.(workspaceId, WorkspaceLifecycleState.diagnosed);
    return Object.freeze({ status: 'mounted', workspaceId, workspace, view });
  }

  unmount() {
    if (!this.activeWorkspaceId) return Object.freeze({ status: 'idle' });
    const workspaceId = this.activeWorkspaceId;
    this.activeWorkspaceId = null;
    this.lifecycle?.record?.(workspaceId, WorkspaceLifecycleState.unmounted);
    publishShellEvent({ eventBus: this.eventBus, diagnostics: this.diagnostics, type: ShellEventType.WorkspaceUnmounted, payload: { workspaceId }, source: 'WorkspaceHost' });
    return Object.freeze({ status: 'unmounted', workspaceId });
  }

  #fail(workspaceId, message) {
    this.lifecycle?.record?.(workspaceId, WorkspaceLifecycleState.failed, { message });
    publishShellEvent({ eventBus: this.eventBus, diagnostics: this.diagnostics, type: ShellEventType.WorkspaceFailed, payload: { workspaceId, message }, source: 'WorkspaceHost' });
    return Object.freeze({ status: 'failed', workspaceId, message });
  }
}
