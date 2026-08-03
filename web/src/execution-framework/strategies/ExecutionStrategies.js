import { createOpaqueId } from '../../../../../packages/shared-types/src/index.js';
import { ExecutionStrategyType, assertNoExternalExecution } from '../contracts/index.js';
export class ExecutionStrategyRegistry{ constructor(){ this.items=[]; } register(input){ if(!Object.values(ExecutionStrategyType).includes(input.strategyType)) throw new Error('Invalid execution strategy'); const s=Object.freeze({ executionStrategyId:createOpaqueId('ESTR'), version:'1.0.0', ...input }); assertNoExternalExecution(s,'execution strategy'); this.items.push(s); return s; }}
export const ExecutionStrategy=Object.freeze({});
