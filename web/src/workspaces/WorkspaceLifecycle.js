export const WorkspaceLifecycleState = Object.freeze({
  registered: 'Registered',
  mounted: 'Mounted',
  rendered: 'Rendered',
  diagnosed: 'Diagnosed',
  unmounted: 'Unmounted',
  blocked: 'Blocked',
  failed: 'Failed'
});

export class WorkspaceLifecycle {
  constructor({ diagnostics } = {}) {
    this.diagnostics = diagnostics;
    this.transitions = [];
  }

  record(workspaceId, state, meta = {}) {
    if (!Object.values(WorkspaceLifecycleState).includes(state)) throw new Error(`Invalid workspace lifecycle state: ${state}`);
    const transition = Object.freeze({ workspaceId, state, at: new Date().toISOString(), meta: Object.freeze({ ...meta }) });
    this.transitions.push(transition);
    this.diagnostics?.record?.(`workspace.${state}`, { workspaceId, ...meta });
    return transition;
  }

  history() { return Object.freeze(this.transitions.slice()); }
}
