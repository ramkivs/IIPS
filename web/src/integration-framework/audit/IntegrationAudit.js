import { createIntegrationAuditIdentity, assertNoLiveIntegration } from '../contracts/index.js';
export class IntegrationAuditTrail{ constructor(){ this.records=[]; } record(input){ const audit=createIntegrationAuditIdentity(input); const r=Object.freeze({ ...audit, action:input.action||'integration-audit', payload:input.payload||{} }); assertNoLiveIntegration(r,'integration audit'); this.records.push(r); return r; }}
export const IntegrationAuditRecord=Object.freeze({});
