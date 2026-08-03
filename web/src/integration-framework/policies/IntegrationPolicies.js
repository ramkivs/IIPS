import { createOpaqueId } from '../../../../../packages/shared-types/src/index.js';
import { assertNoLiveIntegration } from '../contracts/index.js';
export class RetryPolicy{ constructor(input={}){ const p=Object.freeze({ retryPolicyId:createOpaqueId('RTRY'), maxAttempts:0, appliesTo:'simulation', ...input }); assertNoLiveIntegration(p,'retry policy'); return p; }}
export class FailurePolicy{ constructor(input={}){ const p=Object.freeze({ failurePolicyId:createOpaqueId('FAILP'), behavior:'record-and-stop', ...input }); assertNoLiveIntegration(p,'failure policy'); return p; }}
export const ProviderFailureRecord=Object.freeze({});
