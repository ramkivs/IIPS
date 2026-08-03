import { createOpaqueId, ID_PREFIXES } from '../../../../../packages/shared-types/src/index.js';
import { WorkflowEventType, createWorkflowEvent } from '../contracts/index.js';

export const TransactionState = Object.freeze({ Started: 'Started', Committed: 'Committed', RolledBack: 'RolledBack', Failed: 'Failed' });

export class TransactionLog { constructor() { this.records = []; } append(record) { const frozen=Object.freeze({ ...record }); this.records.push(frozen); return frozen; } list() { return Object.freeze(this.records.slice()); } }
export class TransactionRegistry { constructor() { this.transactions = new Map(); } save(txn) { this.transactions.set(txn.transactionId, Object.freeze({ ...txn })); return this.get(txn.transactionId); } get(id) { return this.transactions.get(id) || null; } list() { return Object.freeze([...this.transactions.values()]); } }
export class CompensationPolicy { static compensatingEvent(reason) { return Object.freeze({ type: 'compensating_event', reason }); } }

export class TransactionManager {
  constructor({ registry = new TransactionRegistry(), log = new TransactionLog(), eventBus, diagnostics } = {}) { this.registry=registry; this.log=log; this.eventBus=eventBus; this.diagnostics=diagnostics; }
  start({ workflowInstanceId, name, user_id = 'system' } = {}) { if (!workflowInstanceId || !name) throw new Error('workflowInstanceId and name are required'); const txn=this.registry.save({ transactionId:createOpaqueId(ID_PREFIXES.transaction), workflowInstanceId, name, status:TransactionState.Started, startedAt:new Date().toISOString(), completedAt:null, commands:[], events:[], compensationPolicy:null }); this.#record(WorkflowEventType.TransactionStarted, txn, user_id); return txn; }
  commit(transactionId, user_id = 'system') { const txn=this.#require(transactionId); if (txn.status !== TransactionState.Started) throw new Error('Only started transactions can commit'); const next=this.registry.save({ ...txn, status:TransactionState.Committed, completedAt:new Date().toISOString() }); this.#record(WorkflowEventType.TransactionCommitted, next, user_id); return next; }
  rollback(transactionId, reason = 'rollback requested', user_id = 'system') { const txn=this.#require(transactionId); if (txn.status !== TransactionState.Started) throw new Error('Only started transactions can roll back'); const next=this.registry.save({ ...txn, status:TransactionState.RolledBack, completedAt:new Date().toISOString(), compensationPolicy:CompensationPolicy.compensatingEvent(reason) }); this.#record(WorkflowEventType.TransactionRolledBack, next, user_id, { reason, compensationPolicy: next.compensationPolicy }); return next; }
  #record(type, txn, user_id, extra = {}) { const event=createWorkflowEvent({ type, workflow_instance_id: txn.workflowInstanceId, payload:{ transactionId: txn.transactionId, status: txn.status, ...extra }, user_id, source:'TransactionManager' }); this.eventBus?.publish(event); this.log.append({ transactionId: txn.transactionId, eventType: type, eventId: event.event_id, at: event.timestamp }); this.diagnostics?.record?.(`transaction.${txn.status}`, { transactionId: txn.transactionId }); return event; }
  #require(id) { const txn=this.registry.get(id); if (!txn) throw new Error(`Transaction not found: ${id}`); return txn; }
}
