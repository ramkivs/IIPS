import { createOpaqueId } from '../../../../../packages/shared-types/src/index.js';
import { ExecutionIntentStatus, assertRequired, assertNoExternalExecution } from '../contracts/index.js';
export class ExecutionIntentRegistry{ constructor(){ this.items=[]; } create(input){ const intent=Object.freeze({ executionIntentId:createOpaqueId('EINT'), status:ExecutionIntentStatus.Active, createdAt:new Date().toISOString(), ...input }); assertRequired(intent,['executionIntentId','portfolioChangeProposalId','portfolioId','sourceDecisionArtifactId','intentType','status'],'executionIntent'); assertNoExternalExecution(intent,'execution intent'); this.items.push(intent); return intent; }}
export const ExecutionIntent=Object.freeze({});
