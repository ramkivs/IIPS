const forbidden = new Set(['companyQualityScore','investmentScore','valuationQuality','ratingConfidence','recommendationStrength','portfolioFitScore']);
export class ResearchQualityPolicy { validate(metadata){ for(const key of Object.keys(metadata||{})) if(forbidden.has(key)) throw new Error(`Forbidden investment-quality metric: ${key}`); return true; } }
export class ResearchQualityMetadataRegistry { constructor({ policy=new ResearchQualityPolicy() }={}){ this.policy=policy; this.records=new Map(); }
  create({ researchDocumentId, sourceCount=0, openQuestionCount=0, completedChecklistCount=0, requiredSectionCoverage=0, reviewCompletionStatus='NotStarted', artifactLinkCoverage=0, lastReviewedAt=null }={}){ const record=deepFreeze({ researchDocumentId, sourceCount, openQuestionCount, completedChecklistCount, requiredSectionCoverage, reviewCompletionStatus, artifactLinkCoverage, lastReviewedAt }); this.policy.validate(record); this.records.set(researchDocumentId, record); return record; }
  update(researchDocumentId, patch){ const current=this.records.get(researchDocumentId)||{ researchDocumentId }; const next=deepFreeze({ ...current, ...patch }); this.policy.validate(next); this.records.set(researchDocumentId,next); return next; }
  snapshot(researchDocumentId){ return this.records.get(researchDocumentId)||null; }}
export const ResearchQualityMetadata = Object.freeze({});
function deepFreeze(obj){ Object.freeze(obj); for(const v of Object.values(obj)) if(v&&typeof v==='object'&&!Object.isFrozen(v)) deepFreeze(v); return obj; }
