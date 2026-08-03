import { createPortfolioAuditIdentity, assertNoExecutionLogic } from '../contracts/index.js';
export class PortfolioAuditTrail{ constructor(){ this.records=[]; } record(input){ const audit=createPortfolioAuditIdentity(input); const r=Object.freeze({ ...audit, action:input.action||'portfolio-audit', payload:input.payload||{} }); assertNoExecutionLogic(r,'portfolio audit'); this.records.push(r); return r; }}
export const PortfolioAuditRecord=Object.freeze({});
