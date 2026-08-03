export const ApplicationLifecycleState = Object.freeze({
  initialized: 'initialized',
  starting: 'starting',
  ready: 'ready',
  degraded: 'degraded',
  failed: 'failed',
  shutdown: 'shutdown'
});

export function createApplicationState(overrides = {}) {
  return Object.freeze({
    lifecycleState: ApplicationLifecycleState.initialized,
    activeRoute: '/',
    activeWorkspace: null,
    enabledFeatures: Object.freeze([]),
    theme: 'system',
    healthStatus: 'unknown',
    error: null,
    ...overrides
  });
}

export class ShellStateStore {
  #state;
  #history = [];

  constructor(initialState = createApplicationState()) {
    this.#state = initialState;
    this.#history.push(initialState);
  }

  getState() { return this.#state; }

  transition(patch) {
    this.#state = Object.freeze({ ...this.#state, ...patch });
    this.#history.push(this.#state);
    return this.#state;
  }

  history() { return Object.freeze(this.#history.slice()); }
}
