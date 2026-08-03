import { TransportType } from '../contracts/index.js';
export class TransportRegistry{ constructor(){ this.items=new Map(); } register(type){ if(!Object.values(TransportType).includes(type)) throw new Error('Invalid transport'); this.items.set(type,Object.freeze({ transportType:type })); return this.items.get(type); }}
export class TransportCompatibilityPolicy{ assertExecutable(type){ if(type!==TransportType.SimulationOnly) throw new Error('Only SimulationOnly transport executable in Sprint 19'); return true; }}
export const TransportDefinition=Object.freeze({});
