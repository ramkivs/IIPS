import { createOpaqueId } from '../../../../../packages/shared-types/src/index.js';
import { assertNoDecisionLogic } from '../contracts/index.js';
export class RecommendationRationaleValidator { validate(r){ if(!r.rationaleId||!r.inputs||!r.policiesApplied||!r.rationaleItems) throw new Error('Invalid rationale'); assertNoDecisionLogic(r,'recommendation rationale'); return true; }}
export class RecommendationRationaleBuilder { constructor(){ this.validator=new RecommendationRationaleValidator(); } build({ inputs, policiesApplied, supportingEvidence=[], rationaleItems=[], excludedPolicies=[] }){ const r=deepFreeze({ rationaleId:createOpaqueId('RATL'), inputs:Object.freeze(inputs), policiesApplied:Object.freeze(policiesApplied), supportingEvidence:Object.freeze(supportingEvidence), rationaleItems:Object.freeze(rationaleItems), excludedPolicies:Object.freeze(excludedPolicies), createdAt:new Date().toISOString() }); this.validator.validate(r); return r; }}
export const RecommendationRationale=Object.freeze({});
function deepFreeze(o){ Object.freeze(o); for(const v of Object.values(o)) if(v&&typeof v==='object'&&!Object.isFrozen(v)) deepFreeze(v); return o; }
