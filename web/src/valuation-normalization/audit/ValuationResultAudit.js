import { createNormalizationAuditIdentity, assertNoInvestmentDecision } from '../contracts/index.js';
export class ValuationResultAuditTrail { constructor(){ this.records=[]; } record(input){ const audit=createNormalizationAuditIdentity(input); const record=Object.freeze({ ...audit, action:input.action||'valuation-normalization-audit', payload:input.payload||{} }); assertNoInvestmentDecision(record,'Valuation result audit'); this.records.push(record); return record; }}
export const ValuationResultAuditRecord=Object.freeze({});
