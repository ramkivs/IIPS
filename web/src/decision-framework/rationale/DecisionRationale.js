import { createOpaqueId } from '../../../../../packages/shared-types/src/index.js';
import { assertNoExecutionLogic } from '../contracts/index.js';
export class DecisionRationaleValidator { validate(r){ if(!r.rationaleId||!r.recommendationArtifact||!r.policiesEvaluated||!r.approvalEvaluation||!r.rationaleItems) throw new Error('Invalid decision rationale'); assertNoExecutionLogic(r,'decision rationale'); return true; }}
export class DecisionRationaleBuilder { constructor(){ this.validator=new DecisionRationaleValidator(); } build({ recommendationArtifact, policiesEvaluated, approvalEvaluation, rationaleItems=[], supportingReferences=[] }){ const r=deepFreeze({ rationaleId:createOpaqueId('DRAT'), recommendationArtifact, policiesEvaluated:Object.freeze(policiesEvaluated), approvalEvaluation, rationaleItems:Object.freeze(rationaleItems), supportingReferences:Object.freeze(supportingReferences), createdAt:new Date().toISOString() }); this.validator.validate(r); return r; }}
export const DecisionRationale=Object.freeze({});
function deepFreeze(o){ Object.freeze(o); for(const v of Object.values(o)) if(v&&typeof v==='object'&&!Object.isFrozen(v)) deepFreeze(v); return o; }
