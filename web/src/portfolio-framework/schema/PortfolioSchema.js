import { createOpaqueId } from '../../../../../packages/shared-types/src/index.js';
import { PORTFOLIO_SCHEMA_VERSION, assertRequired, assertNoExecutionLogic } from '../contracts/index.js';
export class PortfolioArtifactValidator{ validate(a){ assertRequired(a,['portfolioArtifactId','portfolioSchemaVersion','portfolioId','portfolioVersion','createdAt','extensions'],'portfolioArtifact'); assertNoExecutionLogic(a,'portfolio artifact'); return true; }}
export function createPortfolioArtifact({ portfolioId, portfolioVersion='1.0.0', extensions={} }={}){ const a=Object.freeze({ portfolioArtifactId:createOpaqueId('PART'), portfolioSchemaVersion:PORTFOLIO_SCHEMA_VERSION, portfolioId, portfolioVersion, createdAt:new Date().toISOString(), extensions:Object.freeze({ ...extensions }) }); new PortfolioArtifactValidator().validate(a); return a; }
export const PortfolioSchema=Object.freeze({ version:PORTFOLIO_SCHEMA_VERSION });
