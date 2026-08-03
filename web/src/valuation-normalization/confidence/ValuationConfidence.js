import { ValuationConfidenceSignal, assertNoInvestmentDecision } from '../contracts/index.js';
export class ValuationConfidencePolicy { validate(metadata){ for(const key of Object.keys(metadata||{})) if(!Object.values(ValuationConfidenceSignal).includes(key)) throw new Error(`Unsupported confidence signal: ${key}`); assertNoInvestmentDecision(metadata,'Valuation confidence'); return true; }}
export class ValuationConfidenceMetadata { constructor(input={}){ new ValuationConfidencePolicy().validate(input); return Object.freeze({ ...input }); }}
