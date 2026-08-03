import { ReadinessGateType } from '../contracts/index.js';
export class ReadinessGateRegistry{ constructor(){ this.gates=[]; } register({ gateType, enabled=true }){ if(!Object.values(ReadinessGateType).includes(gateType)) throw new Error('Invalid readiness gate'); const g=Object.freeze({ gateType, enabled }); this.gates.push(g); return g; } registerDefaults(){ ['platform','environment','provider','operator','artifact'].forEach(gateType=>this.register({ gateType, enabled:true })); return this; }}
export class ReadinessGateEvaluator{ evaluate(gates){ return Object.freeze(gates.map(g=>Object.freeze({ gateType:g.gateType, enabled:g.enabled, evaluatedAt:new Date().toISOString() }))); }}
export const ReadinessFeatureGate=Object.freeze({}); export const ReadinessGateResult=Object.freeze({});
