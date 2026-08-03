import { MethodologyLifecycleState } from '../contracts/index.js';
const allowed={ Draft:['Registered','Failed'], Registered:['Validated','Failed'], Validated:['Active','Failed'], Active:['Deprecated','Retired','Failed'], Deprecated:['Retired'], Retired:[], Failed:[] };
export class MethodologyLifecyclePolicy { canExecute(state){ return state!==MethodologyLifecycleState.Retired && state!==MethodologyLifecycleState.Failed; } canReplay(state){ return [MethodologyLifecycleState.Active,MethodologyLifecycleState.Deprecated,MethodologyLifecycleState.Retired].includes(state); } }
export class MethodologyLifecycleManager { constructor({ diagnostics }={}){ this.states=new Map(); this.diagnostics=diagnostics; this.policy=new MethodologyLifecyclePolicy(); }
  initialize(id){ this.states.set(id,MethodologyLifecycleState.Draft); return this.status(id); }
  transition(id,to){ const from=this.states.get(id); if(!from) throw new Error(`Unknown methodology lifecycle: ${id}`); if(!(allowed[from]||[]).includes(to)){ this.states.set(id,MethodologyLifecycleState.Failed); this.diagnostics?.record?.('methodology.lifecycle.failed',{ id, from, to }); throw new Error(`Invalid methodology transition: ${from} -> ${to}`); } this.states.set(id,to); return this.status(id); }
  status(id){ return Object.freeze({ methodologyId:id, state:this.states.get(id)||null }); } assertExecutable(id){ if(!this.policy.canExecute(this.states.get(id))) throw new Error('Methodology cannot execute'); return true; }}
export const MethodologyLifecycleTransition = Object.freeze({});
