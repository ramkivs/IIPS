import { RelativeValuationMethod } from '../contracts/index.js';
const definitions=Object.freeze({
  EV_EBITDA:{ method:RelativeValuationMethod.EV_EBITDA, numerator:'enterpriseValue', denominator:'EBITDA', valuationBasis:'enterprise', requiredInputs:['companyMetric','peerSet'] },
  EV_EBIT:{ method:RelativeValuationMethod.EV_EBIT, numerator:'enterpriseValue', denominator:'EBIT', valuationBasis:'enterprise', requiredInputs:['companyMetric','peerSet'] },
  EV_SALES:{ method:RelativeValuationMethod.EV_SALES, numerator:'enterpriseValue', denominator:'Sales', valuationBasis:'enterprise', requiredInputs:['companyMetric','peerSet'] },
  PE:{ method:RelativeValuationMethod.PE, numerator:'equityValue', denominator:'Earnings', valuationBasis:'equity', requiredInputs:['companyMetric','peerSet'] },
  PB:{ method:RelativeValuationMethod.PB, numerator:'equityValue', denominator:'BookValue', valuationBasis:'equity', requiredInputs:['companyMetric','peerSet'] },
  PCFO:{ method:RelativeValuationMethod.PCFO, numerator:'equityValue', denominator:'CFO', valuationBasis:'equity', requiredInputs:['companyMetric','peerSet'] },
  PEG:{ method:RelativeValuationMethod.PEG, numerator:'PE', denominator:'Growth', valuationBasis:'equity', requiredInputs:['companyMetric','peerSet'] },
  CUSTOM_MULTIPLE:{ method:RelativeValuationMethod.CUSTOM_MULTIPLE, numerator:'customNumerator', denominator:'customDenominator', valuationBasis:'custom', requiredInputs:['companyMetric','selectedMultiple'] }
});
export class RelativeValuationMethodRegistry { constructor(){ this.definitions=new Map(Object.entries(definitions)); } get(method){ const d=this.definitions.get(method); if(!d) throw new Error(`Unsupported relative valuation method: ${method}`); return Object.freeze({ ...d, requiredInputs:Object.freeze([...(d.requiredInputs||[])]), optionalInputs:Object.freeze([...(d.optionalInputs||[])]) }); } list(){ return Object.freeze([...this.definitions.values()].map(d=>Object.freeze({ ...d }))); } capabilityMatrix(){ return Object.freeze(Object.fromEntries([...this.definitions.keys()].map(k=>[k,true]))); }}
