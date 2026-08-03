import {
  createCompanyWorkspaceView,
  createBusinessQualitySummary,
  createValuationSummary,
  createDecisionSummary
} from '../../company/index.js';

export function runCompanyWorkspaceReadOnly(company) {
  const overview = createCompanyWorkspaceView({ workspaceId:'company', label:'Company' });
  const businessQuality = createBusinessQualitySummary();
  const valuation = createValuationSummary();
  const investmentDecision = createDecisionSummary();
  return deepFreeze({
    ticker: company.ticker,
    company: company.company,
    readOnly: true,
    consumedRelease: 'Company Workspace v1.0',
    outputs: { overview, businessQuality, valuation, investmentDecision },
    mutationAttempted: false
  });
}

function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
