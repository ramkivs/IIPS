export const ValidationProfileType = Object.freeze({
  portfolio: 'Portfolio',
  watchlist: 'Watchlist',
  candidate: 'Candidate',
  regression: 'Regression'
});

export const ValidationTrigger = Object.freeze({
  scheduled: 'Scheduled',
  quarterlyResults: 'Quarterly Results',
  corporateAction: 'Corporate Action',
  portfolioReview: 'Portfolio Review',
  manual: 'Manual',
  engineUpgrade: 'Engine Upgrade'
});

export const MaterialChangeType = Object.freeze({
  valuation: 'Valuation',
  evidence: 'Evidence',
  quality: 'Business Quality',
  decision: 'Decision',
  stable: 'Stable'
});

export function createValidationProfile({ type, datasetName, purpose, focus, outputs, defaults = {} }) {
  if (!Object.values(ValidationProfileType).includes(type)) throw new Error(`Unsupported validation profile: ${type}`);
  return deepFreeze({ type, datasetName, purpose, focus: Object.freeze(focus), outputs: Object.freeze(outputs), defaults: Object.freeze(defaults) });
}

export const validationProfiles = deepFreeze({
  portfolio: createValidationProfile({
    type: ValidationProfileType.portfolio,
    datasetName: 'portfolio.csv',
    purpose: 'Validate all current holdings.',
    focus: ['business quality deterioration', 'material valuation change', 'evidence freshness drop', 'holdings requiring review'],
    outputs: ['Stable', 'Needs Review', 'Material Change', 'Evidence Stale'],
    defaults: { trigger: ValidationTrigger.scheduled, cadence: 'Weekly', priority: 'Highest', reviewQuestion: 'Which holdings require attention?' }
  }),
  watchlist: createValidationProfile({
    type: ValidationProfileType.watchlist,
    datasetName: 'watchlist.csv',
    purpose: 'Validate companies under research.',
    focus: ['new evidence', 'valuation movement', 'quality trend', 'research completeness'],
    outputs: ['Continue Research', 'Evidence Improved', 'Evidence Weakening', 'Research Incomplete'],
    defaults: { trigger: ValidationTrigger.manual, cadence: 'As Needed', priority: 'High', reviewQuestion: 'Which watchlist companies changed?' }
  }),
  candidate: createValidationProfile({
    type: ValidationProfileType.candidate,
    datasetName: 'scanx_export.csv',
    purpose: 'Validate newly screened companies.',
    focus: ['data completeness', 'Company Workspace output quality', 'missing evidence', 'readiness for deeper research'],
    outputs: ['Ready for Research', 'Needs Data', 'Reject Data Quality', 'Research Candidate'],
    defaults: { trigger: ValidationTrigger.manual, cadence: 'As Needed', priority: 'Medium', reviewQuestion: 'Which screened companies deserve research?' }
  }),
  regression: createValidationProfile({
    type: ValidationProfileType.regression,
    datasetName: 'VALIDATION_DATASET_v1.0_CANDIDATE.csv',
    purpose: 'Validate platform stability.',
    focus: ['architecture drift', 'guardrail violations', 'feature regressions', 'release gates'],
    outputs: ['Pass', 'Warning', 'Fail', 'Release Blocked'],
    defaults: { trigger: ValidationTrigger.engineUpgrade, cadence: 'Per Release', priority: 'Engineering', reviewQuestion: 'Is the platform stable?' }
  })
});

export function createPortfolioHolding({ ticker, company, quantity, averagePrice, portfolioWeight, role }) {
  return Object.freeze({ ticker, company, quantity, averagePrice, portfolioWeight, role });
}

export function createDemoPortfolioHoldings() {
  return deepFreeze([
    createPortfolioHolding({ ticker: 'TCS', company: 'Tata Consultancy Services', quantity: 120, averagePrice: 3620, portfolioWeight: 6.2, role: 'Core' }),
    createPortfolioHolding({ ticker: 'BLS', company: 'BLS International', quantity: 800, averagePrice: 428, portfolioWeight: 3.5, role: 'Satellite' }),
    createPortfolioHolding({ ticker: 'KAYNES', company: 'Kaynes Technology', quantity: 75, averagePrice: 2410, portfolioWeight: 2.8, role: 'Growth' }),
    createPortfolioHolding({ ticker: 'COALINDIA', company: 'Coal India', quantity: 500, averagePrice: 238, portfolioWeight: 4.1, role: 'Income' }),
    createPortfolioHolding({ ticker: 'HDFCBANK', company: 'HDFC Bank', quantity: 150, averagePrice: 1480, portfolioWeight: 5.4, role: 'Core' }),
    createPortfolioHolding({ ticker: 'ITC', company: 'ITC', quantity: 900, averagePrice: 392, portfolioWeight: 4.7, role: 'Core' })
  ]);
}

function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
