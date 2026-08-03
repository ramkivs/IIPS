export class DiagnosticsService {
  constructor() { this.events = []; this.startedAt = null; this.completedAt = null; }
  start() { this.startedAt = performanceNow(); this.record('startup.started'); }
  complete() { this.completedAt = performanceNow(); this.record('startup.completed', { durationMs: this.durationMs() }); }
  record(event, meta = {}) { const e = Object.freeze({ event, at: new Date().toISOString(), meta: Object.freeze({ ...meta }) }); this.events.push(e); return e; }
  durationMs() { return this.startedAt == null || this.completedAt == null ? null : +(this.completedAt - this.startedAt).toFixed(3); }
  snapshot() { return Object.freeze({ eventCount: this.events.length, startedAt: this.startedAt, completedAt: this.completedAt, durationMs: this.durationMs(), events: Object.freeze(this.events.slice()) }); }
}
function performanceNow() { return globalThis.performance?.now ? globalThis.performance.now() : Date.now(); }
