import { createDCFAuditIdentity, assertNoInvestmentDecision } from '../contracts/index.js';
export class DCFAuditTrail { constructor(){ this.records=[]; } record(input){ const audit=createDCFAuditIdentity(input); const record=Object.freeze({ ...audit, action:input.action||'dcf-audit', payload:input.payload||{} }); assertNoInvestmentDecision(record,'DCF audit'); this.records.push(record); return record; }}
export const DCFAuditRecord=Object.freeze({});
