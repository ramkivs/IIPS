import { createOpaqueId } from '../../../../../../packages/shared-types/src/index.js';
import { EvidenceCandidateStatus, assertNoInvestmentAnalysis } from '../contracts/index.js';
export class EvidenceCandidatePolicy { validate(candidate){ assertNoInvestmentAnalysis(candidate,'Evidence candidate'); return true; } }
export class EvidenceCandidateRegistry { constructor({ policy=new EvidenceCandidatePolicy(), diagnostics }={}){ this.policy=policy; this.candidates=new Map(); this.diagnostics=diagnostics; }
  create({ sourceArtifactId, researchDocumentId, workflowInstanceId, preparedByUserId='system', rationale='' }={}){ const c=deepFreeze({ evidenceCandidateId:createOpaqueId('ECAN'), sourceArtifactId, researchDocumentId, workflowInstanceId, preparedByUserId, rationale, status:EvidenceCandidateStatus.Draft, certified:false, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() }); this.policy.validate(c); this.candidates.set(c.evidenceCandidateId,c); this.diagnostics?.record?.('researchIntelligence.evidenceCandidate.created', { evidenceCandidateId:c.evidenceCandidateId }); return c; }
  link(id){ return this.#status(id,EvidenceCandidateStatus.Linked); } readyForReview(id){ return this.#status(id,EvidenceCandidateStatus.ReadyForReview); } reject(id){ return this.#status(id,EvidenceCandidateStatus.Rejected); } archive(id){ return this.#status(id,EvidenceCandidateStatus.Archived); }
  certify(){ throw new Error('Evidence candidate certification is out of scope for Sprint 5'); }
  #status(id,status){ const c=this.get(id); const next=deepFreeze({ ...c, status, updatedAt:new Date().toISOString() }); this.candidates.set(id,next); return next; }
  get(id){ const c=this.candidates.get(id); if(!c) throw new Error(`Evidence candidate not found: ${id}`); return c; }}
export class ArtifactEvidencePreparationLinker { constructor({ evidenceCandidateRegistry }){ this.evidenceCandidateRegistry=evidenceCandidateRegistry; } linkCandidate(id){ return this.evidenceCandidateRegistry.link(id); }}
export const EvidenceCandidate = Object.freeze({});
function deepFreeze(obj){ Object.freeze(obj); for(const v of Object.values(obj)) if(v&&typeof v==='object'&&!Object.isFrozen(v)) deepFreeze(v); return obj; }
