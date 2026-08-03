import { assertNoPluginMath } from '../contracts/index.js';
const allowed=new Set(['pluginExecutionStatus','validationResult','dryRunResult','auditResult','diagnostics','replayMetadata','snapshotMetadata']);
const forbidden=['intrinsicValue','fairValue','targetPrice','valuationRange','marginOfSafety','upsideDownside','recommendation','rating','score'];
export class ValuationPluginOutputValidator { validate(output){ for(const f of forbidden) if(output[f]!==undefined) throw new Error(`Forbidden plugin output field: ${f}`); for(const k of Object.keys(output)) if(!allowed.has(k)) throw new Error(`Unsupported plugin output field: ${k}`); assertNoPluginMath(output,'Plugin output'); return true; }}
export class ValuationPluginOutputNormalizerShell { constructor(){ this.validator=new ValuationPluginOutputValidator(); } normalize(output){ const envelope=Object.freeze({ pluginExecutionStatus:'Completed', diagnostics:{}, replayMetadata:{}, snapshotMetadata:{}, ...output }); this.validator.validate(envelope); return envelope; }}
export const ValuationPluginOutputContract=Object.freeze({}); export const ValuationPluginOutputEnvelope=Object.freeze({});
