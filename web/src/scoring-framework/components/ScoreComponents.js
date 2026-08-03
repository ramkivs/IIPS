import { createOpaqueId } from '../../../../../packages/shared-types/src/index.js';
import { assertRequired, assertNoRecommendationLogic } from '../contracts/index.js';
export class ScoreComponentValidator { validate(c){ assertRequired(c,['componentId','componentVersion','componentSource','componentWeightReference','componentType','rawValue','normalizedValue','provenance','createdAt'],'scoreComponent'); assertNoRecommendationLogic(c,'score component'); return true; }}
export class ScoreComponentRegistry { constructor(){ this.items=[]; this.validator=new ScoreComponentValidator(); } create(input){ const c=Object.freeze({ componentId:createOpaqueId('SCMP'), componentVersion:'1.0.0', createdAt:new Date().toISOString(), ...input }); this.validator.validate(c); this.items.push(c); return c; } list(){ return Object.freeze(this.items.slice()); }}
export const ScoreComponent=Object.freeze({});
