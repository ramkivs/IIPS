import { createValuationAuditIdentity, assertNoValuationLogic } from '../contracts/index.js';
export class ValuationAuditTrail { constructor(){ this.records=[]; } record(input){ const audit=createValuationAuditIdentity(input); const record=Object.freeze({ ...audit, action:input.action||'valuation-audit', payload:input.payload||{} }); assertNoValuationLogic(record,'Valuation audit'); this.records.push(record); return record; } byExecution(id){ return Object.freeze(this.records.filter(r=>r.valuationExecutionId===id)); }}
export const ValuationAuditRecord=Object.freeze({});
