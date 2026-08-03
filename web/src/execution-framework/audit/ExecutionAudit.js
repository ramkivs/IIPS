import { createExecutionAuditIdentity, assertNoExternalExecution } from '../contracts/index.js';
export class ExecutionAuditTrail{ constructor(){ this.records=[]; } record(input){ const audit=createExecutionAuditIdentity(input); const r=Object.freeze({ ...audit, action:input.action||'execution-audit', payload:input.payload||{} }); assertNoExternalExecution(r,'execution audit'); this.records.push(r); return r; }}
export const ExecutionAuditRecord=Object.freeze({});
