import { createOpaqueId } from '../../../../../packages/shared-types/src/index.js';
import { assertNoLiveIntegration } from '../contracts/index.js';
export class DryRunSimulator{ simulate(request){ assertNoLiveIntegration(request,'dry run request'); return Object.freeze({ simulationId:createOpaqueId('SIM'), requestEnvelopeId:request.requestEnvelopeId, acknowledgement:{ status:'ACKNOWLEDGED_SIMULATION', deterministic:true }, executionReport:{ status:'SIMULATED_ONLY', fills:[] }, simulatedAt:'2026-07-21T00:00:00.000Z' }); }}
export class SimulatedBrokerAdapter{ run(request){ return new DryRunSimulator().simulate(request); }}
export class SimulatedExchangeAdapter{ run(request){ return new DryRunSimulator().simulate(request); }}
export const SimulatedAcknowledgement=Object.freeze({}); export const SimulatedExecutionReport=Object.freeze({});
