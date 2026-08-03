import { createDecisionAuditIdentity, assertNoExecutionLogic } from '../contracts/index.js';
export class DecisionAuditTrail { constructor(){ this.records=[]; } record(input){ const audit=createDecisionAuditIdentity(input); const record=Object.freeze({ ...audit, action:input.action||'decision-audit', payload:input.payload||{} }); assertNoExecutionLogic(record,'decision audit'); this.records.push(record); return record; }}
export const DecisionAuditRecord=Object.freeze({});
