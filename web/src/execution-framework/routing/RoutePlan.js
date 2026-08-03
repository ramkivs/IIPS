import { createOpaqueId } from '../../../../../packages/shared-types/src/index.js';
import { assertNoExternalExecution } from '../contracts/index.js';
export class RoutePlanValidator{ validate(r){ for(const f of ['venue','pathInstruction','FIXMsg','broker']) if(r[f]!==undefined) throw new Error(`Forbidden route field: ${f}`); assertNoExternalExecution(r,'route plan'); return true; }}
export class RoutePlanPlaceholder{ constructor(input={}){ const r=Object.freeze({ routePlanId:createOpaqueId('RPLAN'), routeType:'placeholder', createdAt:new Date().toISOString(), ...input }); new RoutePlanValidator().validate(r); return r; }}
