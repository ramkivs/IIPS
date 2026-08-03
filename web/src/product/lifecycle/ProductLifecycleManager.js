import { createPlatformEvent } from '../../../../../packages/shared-types/src/index.js';
import { ProductEventType, ProductHealthState } from '../contracts/index.js';

export const ProductLifecycleState = Object.freeze({ Discovered:'Discovered', Validated:'Validated', Registered:'Registered', Bound:'Bound', Enabled:'Enabled', Mounted:'Mounted', Suspended:'Suspended', Disabled:'Disabled', Unmounted:'Unmounted', Failed:'Failed' });
const allowed=Object.freeze({ Discovered:['Validated','Failed'], Validated:['Registered','Failed'], Registered:['Bound','Disabled','Failed'], Bound:['Enabled','Disabled','Failed'], Enabled:['Mounted','Suspended','Disabled','Failed'], Mounted:['Suspended','Unmounted','Disabled','Failed'], Suspended:['Enabled','Disabled','Failed'], Disabled:['Enabled','Unmounted'], Unmounted:[], Failed:[] });
export class ProductLifecycleManager {
  constructor({ eventBus, diagnostics } = {}){ this.eventBus=eventBus; this.diagnostics=diagnostics; this.states=new Map(); this.health=new Map(); }
  discover(id){ this.states.set(id, ProductLifecycleState.Discovered); this.health.set(id, ProductHealthState.Healthy); this.#emit(id, ProductLifecycleState.Discovered); return this.status(id); }
  transition(id, to){ const from=this.states.get(id); if(!from) throw new Error(`Product module lifecycle not found: ${id}`); if(!(allowed[from]||[]).includes(to)){ this.health.set(id, ProductHealthState.Failed); this.diagnostics?.record?.('product.lifecycle.failed', { productModuleId:id, from, to }); throw new Error(`Invalid product lifecycle transition: ${from} -> ${to}`); } this.states.set(id,to); if(to===ProductLifecycleState.Disabled) this.health.set(id, ProductHealthState.Disabled); if(to===ProductLifecycleState.Failed) this.health.set(id, ProductHealthState.Failed); this.#emit(id,to,from); return this.status(id); }
  status(id){ return Object.freeze({ productModuleId:id, lifecycleState:this.states.get(id)||null, health:this.health.get(id)||null }); }
  #emit(id,state,from=null){ this.eventBus?.publish(createPlatformEvent({ type:ProductEventType.ProductLifecycleChanged, source:'ProductLifecycleManager', payload:{ productModuleId:id, from, state } })); this.diagnostics?.record?.('product.lifecycle.changed', { productModuleId:id, state }); }
}
