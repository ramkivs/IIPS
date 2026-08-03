import { createScoringAuditIdentity, assertNoRecommendationLogic } from '../contracts/index.js';
export class ScoreAuditTrail { constructor(){ this.records=[]; } record(input){ const audit=createScoringAuditIdentity(input); const record=Object.freeze({ ...audit, action:input.action||'score-audit', payload:input.payload||{} }); assertNoRecommendationLogic(record,'score audit'); this.records.push(record); return record; }}
export const ScoreAuditRecord=Object.freeze({});
