import { createOpaqueId } from '../../../../../packages/shared-types/src/index.js';
import { assertNoExecutionLogic } from '../contracts/index.js';
export class PortfolioPolicyRegistry{ constructor(){ this.items=[]; } register(input){ const p=Object.freeze({ portfolioPolicyId:createOpaqueId('PPOL'), version:'1.0.0', createdAt:new Date().toISOString(), ...input }); assertNoExecutionLogic(p,'portfolio policy'); this.items.push(p); return p; }}
export const PortfolioPolicy=Object.freeze({});
