import { createReadinessAuditIdentity, assertNoLiveReadinessLeak } from '../contracts/index.js';
export class ReadinessAuditTrail{ constructor(){ this.records=[]; } record(input){ const audit=createReadinessAuditIdentity(input); const r=Object.freeze({ ...audit, action:input.action||'readiness-audit', payload:input.payload||{} }); assertNoLiveReadinessLeak(r,'readiness audit'); this.records.push(r); return r; }}
export const ReadinessAuditRecord=Object.freeze({});
