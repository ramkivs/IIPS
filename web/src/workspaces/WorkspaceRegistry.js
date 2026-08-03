import { WorkspaceLifecycleState } from './WorkspaceLifecycle.js';

export class WorkspaceRegistry {
  #workspaces = new Map();

  constructor({ lifecycle } = {}) { this.lifecycle = lifecycle; }

  register(workspace) {
    for (const key of ['workspaceId', 'label', 'featureFlag', 'render']) {
      if (!workspace?.[key]) throw new Error(`Workspace ${key} is required`);
    }
    if (typeof workspace.render !== 'function') throw new Error('Workspace render must be a function');
    if (this.#workspaces.has(workspace.workspaceId)) throw new Error(`Workspace already registered: ${workspace.workspaceId}`);
    const record = Object.freeze({ description: '', source: 'application', ...workspace });
    this.#workspaces.set(record.workspaceId, record);
    this.lifecycle?.record?.(record.workspaceId, WorkspaceLifecycleState.registered, { source: record.source });
    return record;
  }

  registerFromCapability(capability) {
    const workspace = capability?.implementation?.workspace;
    if (!workspace) throw new Error('Workspace capability implementation is required');
    return this.register({ ...workspace, source: capability.provider_id || 'plugin' });
  }

  get(workspaceId) { return this.#workspaces.get(workspaceId) || null; }
  list() { return Object.freeze([...this.#workspaces.values()]); }
}
