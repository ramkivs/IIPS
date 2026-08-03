import { assertNoInvestmentDecision } from '../contracts/index.js';
export class ValuationContributionValidator { validate(c){ if(!c.contributionId||!c.method||c.value===undefined||!c.currency) throw new Error('Invalid valuation contribution'); assertNoInvestmentDecision(c,'Valuation contribution'); return true; }}
export class ValuationContributionRegistry { constructor(){ this.items=[]; this.validator=new ValuationContributionValidator(); } add(c){ this.validator.validate(c); this.items.push(c); return c; } list(){ return Object.freeze(this.items.slice().sort((a,b)=>(a.contributionOrder||0)-(b.contributionOrder||0))); }}
export const ValuationMethodContribution=Object.freeze({});
