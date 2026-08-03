import { ShellEventType, publishShellEvent } from './events.js';

export class ErrorBoundary {
  constructor({ eventBus, diagnostics } = {}) {
    this.eventBus = eventBus;
    this.diagnostics = diagnostics;
  }

  capture(error, context = {}) {
    const normalized = Object.freeze({
      message: String(error?.message || error),
      context: Object.freeze({ ...context })
    });
    publishShellEvent({
      eventBus: this.eventBus,
      diagnostics: this.diagnostics,
      type: ShellEventType.WorkspaceFailed,
      payload: normalized,
      source: 'ErrorBoundary'
    });
    return Object.freeze({ type: 'error', role: 'alert', ...normalized });
  }

  run(operation, context = {}) {
    try {
      return operation();
    } catch (error) {
      return this.capture(error, context);
    }
  }
}
