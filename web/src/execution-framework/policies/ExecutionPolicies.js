import { createOpaqueId } from '../../../../../packages/shared-types/src/index.js';
import { assertNoExternalExecution } from '../contracts/index.js';
export class ExecutionPolicyRegistry{ constructor(){ this.items=[]; } register(input){ const p=Object.freeze({ executionPolicyId:createOpaqueId('EPOL'), version:'1.0.0', createdAt:new Date().toISOString(), ...input }); assertNoExternalExecution(p,'execution policy'); this.items.push(p); return p; }}
export class ExecutionPolicyEvaluator{ evaluate({ policy, inputPackage }){ const status=inputPackage?.proposalInput?'PASS':'FAIL'; return Object.freeze({ executionPolicyId:policy.executionPolicyId, status, evaluatedAt:new Date().toISOString() }); }}
export const ExecutionPolicy=Object.freeze({});
