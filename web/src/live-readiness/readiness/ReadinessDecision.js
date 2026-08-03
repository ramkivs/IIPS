import { createOpaqueId } from '../../../../../packages/shared-types/src/index.js';
import { LIVE_ENABLEMENT_SCHEMA_VERSION } from '../contracts/index.js';
import { TransmissionReadinessValidator } from '../schema/index.js';
export class ReadinessDecisionRegistry{ constructor(){ this.items=new Map(); this.validator=new TransmissionReadinessValidator(); } create(input){ const r=Object.freeze({ readinessId:createOpaqueId('READY'), schemaVersion:LIVE_ENABLEMENT_SCHEMA_VERSION, evaluationProfileId:'DEFAULT_READINESS_PROFILE', evaluationProfileVersion:'1.0.0', readinessPolicyVersion:'1.0.0', reasons:[], failedChecks:[], warnings:[], evaluatedAt:new Date().toISOString(), ...input }); this.validator.validate(r); this.items.set(r.readinessId,r); return r; }}
export class ReadinessDecisionVersionRegistry{ constructor(){ this.versions=new Map(); } createVersion(r){ const list=this.versions.get(r.readinessId)||[]; const version=list.length+1; const rec=Object.freeze({ readinessId:r.readinessId, version, readiness:r }); list.push(rec); this.versions.set(r.readinessId,list); return rec; }}
export const TransmissionReadiness=Object.freeze({});
