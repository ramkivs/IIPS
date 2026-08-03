import { createOpaqueId } from '../../../../../../packages/shared-types/src/index.js';
import { assertNoInvestmentAnalysis } from '../contracts/index.js';
export class ResearchCommentThread { constructor({ targetType, targetId }){ if(!targetType||!targetId) throw new Error('targetType and targetId are required'); return Object.freeze({ threadId:createOpaqueId('RTHR'), targetType, targetId, resolvedAt:null, createdAt:new Date().toISOString() }); } }
export class ResearchMention { constructor({ userId }){ return Object.freeze({ userId }); } }
export class ResearchAssignment { constructor({ userId, role }){ return Object.freeze({ userId, role }); } }
export class ResearchCollaborationService { constructor({ diagnostics }={}){ this.threads=new Map(); this.comments=[]; this.diagnostics=diagnostics; }
  createThread({ targetType, targetId }){ const t=new ResearchCommentThread({ targetType, targetId }); this.threads.set(t.threadId,t); return t; }
  addComment({ threadId, authorUserId='system', commentText, mentions=[] }){ const t=this.threads.get(threadId); if(!t) throw new Error(`Thread not found: ${threadId}`); assertNoInvestmentAnalysis({ commentText }, 'Research comment'); const c=deepFreeze({ researchCommentId:createOpaqueId('RCOM'), threadId, targetType:t.targetType, targetId:t.targetId, authorUserId, commentText, mentions:Object.freeze(mentions.slice()), createdAt:new Date().toISOString(), resolvedAt:null }); this.comments.push(c); this.diagnostics?.record?.('researchIntelligence.comment.added', { researchCommentId:c.researchCommentId }); return c; }
  resolveThread(threadId){ const t=this.threads.get(threadId); if(!t) throw new Error(`Thread not found: ${threadId}`); const next=Object.freeze({ ...t, resolvedAt:new Date().toISOString() }); this.threads.set(threadId,next); return next; }}
export const ResearchComment = Object.freeze({});
function deepFreeze(obj){ Object.freeze(obj); for(const v of Object.values(obj)) if(v&&typeof v==='object'&&!Object.isFrozen(v)) deepFreeze(v); return obj; }
