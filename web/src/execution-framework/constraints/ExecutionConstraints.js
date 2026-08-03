import { createOpaqueId } from '../../../../../packages/shared-types/src/index.js';
import { assertNoExternalExecution } from '../contracts/index.js';
export class ExecutionConstraintRegistry{ constructor(){ this.items=[]; } register(input){ const c=Object.freeze({ executionConstraintId:createOpaqueId('ECON'), version:'1.0.0', createdAt:new Date().toISOString(), ...input }); assertNoExternalExecution(c,'execution constraint'); this.items.push(c); return c; }}
export class ExecutionConstraintChecker{ evaluate({ constraint, plan }){ return Object.freeze({ executionConstraintId:constraint.executionConstraintId, status:plan?'PASS':'FAIL', evaluatedAt:new Date().toISOString() }); }}
export const ExecutionConstraint=Object.freeze({});
