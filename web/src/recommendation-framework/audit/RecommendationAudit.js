import { createRecommendationAuditIdentity, assertNoDecisionLogic } from '../contracts/index.js';
export class RecommendationAuditTrail { constructor(){ this.records=[]; } record(input){ const audit=createRecommendationAuditIdentity(input); const record=Object.freeze({ ...audit, action:input.action||'recommendation-audit', payload:input.payload||{} }); assertNoDecisionLogic(record,'recommendation audit'); this.records.push(record); return record; }}
export const RecommendationAuditRecord=Object.freeze({});
