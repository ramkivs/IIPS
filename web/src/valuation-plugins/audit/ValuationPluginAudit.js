import { createValuationPluginAuditIdentity, assertNoPluginMath } from '../contracts/index.js';
export class ValuationPluginAuditTrail { constructor(){ this.records=[]; } record(input){ const audit=createValuationPluginAuditIdentity(input); const record=Object.freeze({ ...audit, action:input.action||'valuation-plugin-audit', payload:input.payload||{} }); assertNoPluginMath(record,'Plugin audit'); this.records.push(record); return record; }}
export const ValuationPluginAuditRecord=Object.freeze({});
