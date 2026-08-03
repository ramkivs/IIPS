import { createOpaqueId, ID_PREFIXES } from '../../../../../packages/shared-types/src/index.js';
import { WorkflowEventType, createWorkflowEvent } from '../contracts/index.js';

export class SessionStateStore { constructor() { this.sessions = new Map(); } save(session) { this.sessions.set(session.sessionId, Object.freeze({ ...session, recentWorkflows: Object.freeze([...(session.recentWorkflows || [])]) })); return this.get(session.sessionId); } get(id) { return this.sessions.get(id) || null; } }
export class RecentWorkflowStore { constructor(limit = 10) { this.limit=limit; this.items=[]; } add(item) { this.items = [item, ...this.items.filter(i => i.workflowInstanceId !== item.workflowInstanceId)].slice(0, this.limit); return this.list(); } list() { return Object.freeze(this.items.slice()); } }
export class SessionRestorePolicy { canRestore(session) { return !!session && !session.endedAt; } }

export class SessionManager {
  constructor({ store = new SessionStateStore(), recentWorkflowStore = new RecentWorkflowStore(), restorePolicy = new SessionRestorePolicy(), eventBus, diagnostics } = {}) { this.store=store; this.recentWorkflowStore=recentWorkflowStore; this.restorePolicy=restorePolicy; this.eventBus=eventBus; this.diagnostics=diagnostics; this.sessionRestores=0; }
  start({ userId = 'anonymous', activeWorkflowInstanceId = null, activeWorkspace = 'dashboard', lastRoute = '/', theme = 'system' } = {}) { const now=new Date().toISOString(); const session=this.store.save({ sessionId:createOpaqueId(ID_PREFIXES.session), userId, activeWorkflowInstanceId, activeWorkspace, recentWorkflows:this.recentWorkflowStore.list(), lastRoute, theme, startedAt:now, lastActiveAt:now, endedAt:null }); this.#publish(WorkflowEventType.SessionStarted, session); return session; }
  touch(sessionId, patch = {}) { const s=this.#require(sessionId); if (patch.activeWorkflowInstanceId) this.recentWorkflowStore.add({ workflowInstanceId: patch.activeWorkflowInstanceId, at: new Date().toISOString() }); return this.store.save({ ...s, ...patch, recentWorkflows:this.recentWorkflowStore.list(), lastActiveAt:new Date().toISOString() }); }
  restore(sessionId) { const s=this.#require(sessionId); if (!this.restorePolicy.canRestore(s)) throw new Error('Session cannot be restored'); this.sessionRestores++; this.diagnostics?.record?.('session.restored', { sessionId }); this.#publish(WorkflowEventType.SessionRestored, s); return s; }
  end(sessionId) { const s=this.#require(sessionId); const ended=this.store.save({ ...s, endedAt:new Date().toISOString(), lastActiveAt:new Date().toISOString() }); this.#publish(WorkflowEventType.SessionEnded, ended); return ended; }
  healthMetrics() { return Object.freeze({ sessionRestores: this.sessionRestores }); }
  #publish(type, session) { const event=createWorkflowEvent({ type, workflow_instance_id: session.activeWorkflowInstanceId, user_id: session.userId, payload:{ sessionId: session.sessionId, activeWorkspace: session.activeWorkspace, lastRoute: session.lastRoute }, source:'SessionManager' }); this.eventBus?.publish(event); return event; }
  #require(id) { const s=this.store.get(id); if (!s) throw new Error(`Session not found: ${id}`); return s; }
}
