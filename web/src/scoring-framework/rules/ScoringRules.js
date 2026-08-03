import { createOpaqueId } from '../../../../../packages/shared-types/src/index.js';
import { assertRequired, assertNoRecommendationLogic } from '../contracts/index.js';
export class ScoringRuleValidator { validate(r){ assertRequired(r,['ruleId','ruleVersion','ruleName','inputType','componentType','provenance','executionPolicy'],'scoringRule'); assertRequired(r.provenance,['originatingMethodology','sourceEvidenceReference','ruleVersion','executionTimestamp'],'ruleProvenance'); assertNoRecommendationLogic(r,'scoring rule'); return true; }}
export class ScoringRuleRegistry { constructor(){ this.items=new Map(); this.validator=new ScoringRuleValidator(); } register(input){ const r=Object.freeze({ ruleId:createOpaqueId('SRULE'), ...input }); this.validator.validate(r); const key=`${r.ruleId}@${r.ruleVersion}`; this.items.set(key,r); return r; }}
export const ScoringRule=Object.freeze({});
