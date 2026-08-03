import { createOpaqueId } from '../../../../../packages/shared-types/src/index.js';
import { AuthorizationLevel, assertNoLiveReadinessLeak } from '../contracts/index.js';
export class AuthorizationRequest{ constructor({ readinessId, level }){ if(!Object.values(AuthorizationLevel).includes(level)) throw new Error('Invalid authorization level'); return Object.freeze({ authorizationRequestId:createOpaqueId('AUTHREQ'), readinessId, level, requestedAt:new Date().toISOString() }); }}
export class AuthorizationWorkflow{ request(input){ return new AuthorizationRequest(input); }}
export class AuthorizationRecord{ constructor({ readinessId, integrationArtifactId, executionArtifactId, level, approved=true }){ const r=Object.freeze({ authorizationRecordId:createOpaqueId('AUTHREC'), readinessId, integrationArtifactId, executionArtifactId, level, approved, recordedAt:new Date().toISOString() }); assertNoLiveReadinessLeak(r,'authorization record'); return r; }}
