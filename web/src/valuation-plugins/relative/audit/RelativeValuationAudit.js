import { createRelativeValuationAuditIdentity, assertNoRelativeDecisionLogic } from '../contracts/index.js';
export class RelativeValuationAuditTrail { constructor(){ this.records=[]; } record(input){ const audit=createRelativeValuationAuditIdentity(input); const record=Object.freeze({ ...audit, action:input.action||'relative-valuation-audit', payload:input.payload||{} }); assertNoRelativeDecisionLogic(record,'Relative valuation audit'); this.records.push(record); return record; }}
export const RelativeValuationAuditRecord=Object.freeze({});
