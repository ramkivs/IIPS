import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createOverviewFeatureView } from './OverviewFeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-OV-008',
  workspace: 'Company Workspace',
  epic: 'Overview',
  featureId: '1.8',
  featureName: 'Market Cap & Listing Details',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'How does this company exist in the public markets?',
  purpose: 'Describe the company public-market identity, listing structure, securities, free float, index membership, listing history, and corporate-action identity without performing valuation analysis.'
});

const DEFAULT_MARKET_LISTING_INPUT = Object.freeze({
  company: Object.freeze({ displayName: 'Apex Consumer Products', legalName: 'Apex Consumer Products Limited' }),
  marketIdentity: Object.freeze({
    marketCapitalization: '₹48,000 Cr',
    marketCapAsOf: 'FY2026 demo snapshot',
    publicMarketStatus: 'Publicly listed equity issuer'
  }),
  primaryListing: Object.freeze({
    exchange: 'National Stock Exchange of India',
    exchangeMic: 'XNSE',
    ticker: 'APEX',
    isin: 'INE000A01000',
    tradingCurrency: 'INR',
    country: 'IN',
    listingStatus: 'Active'
  }),
  secondaryListings: Object.freeze([
    Object.freeze({ exchange: 'BSE Limited', exchangeMic: 'XBOM', ticker: 'APEXCP', tradingCurrency: 'INR', listingStatus: 'Active' })
  ]),
  shareClasses: Object.freeze([
    Object.freeze({ className: 'Ordinary equity shares', votingRights: 'One share, one vote', listed: true, primary: true })
  ]),
  freeFloat: Object.freeze({ freeFloatPercent: 42, promoterHoldingPercent: 51, institutionalHoldingPercent: 21, publicHoldingPercent: 28, source: 'shareholding pattern disclosure' }),
  indexMembership: Object.freeze([
    Object.freeze({ indexName: 'NIFTY Midcap Consumer Index', membershipStatus: 'Constituent' }),
    Object.freeze({ indexName: 'Consumer Staples Sector Basket', membershipStatus: 'Watchlist candidate' })
  ]),
  listingHistory: Object.freeze([
    Object.freeze({ date: '2012-05-14', event: 'Initial public listing', exchange: 'National Stock Exchange of India' }),
    Object.freeze({ date: '2012-05-15', event: 'Secondary listing activated', exchange: 'BSE Limited' })
  ]),
  corporateActionsSummary: Object.freeze([
    Object.freeze({ date: '2018-08-01', actionType: 'bonus', description: 'Bonus share issue recorded for public-market identity history.' }),
    Object.freeze({ date: '2021-09-20', actionType: 'split', description: 'Face value split recorded for listing and share-history context.' }),
    Object.freeze({ date: '2024-04-01', actionType: 'ticker-change', description: 'Ticker format updated after exchange symbol standardization.' })
  ]),
  investorJudgment: Object.freeze({ status: 'Market identity reviewed', note: 'Public-market identity is understandable; valuation and expected return must be reviewed in the Valuation epic.' })
});

export function createMarketListingDetails(input = DEFAULT_MARKET_LISTING_INPUT) {
  const normalized = normalizeInput(input);
  const marketFacts = createMarketFacts(normalized);
  const aiInterpretation = createAiInterpretation(normalized);
  const investorJudgment = createInvestorJudgment(normalized);
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Medium',
    coverage: 80,
    rationale: 'Market Cap & Listing Details covers listing identity, securities, free float, index membership, listing history, and corporate actions, but still needs live exchange references and source-linked shareholding disclosures.',
    evidenceItems: ['market identity', 'primary listing', 'secondary listings', 'ISIN', 'trading currency', 'share classes', 'free float', 'index membership', 'listing history', 'corporate actions summary'],
    missingEvidence: [
      { label: 'exchange master reference', priority: 'High', status: 'partial', sourceCount: 1 },
      { label: 'latest shareholding pattern', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'index membership source', priority: 'Medium', status: 'missing', sourceCount: 0 },
      { label: 'corporate action exchange notices', priority: 'Medium', status: 'partial', sourceCount: 1 }
    ]
  });
  const sections = Object.freeze({
    marketListingHeader: createMarketListingHeader(normalized),
    marketIdentity: createMarketIdentity(normalized),
    exchange: createExchange(normalized),
    ticker: createTicker(normalized),
    isin: createIsin(normalized),
    tradingCurrency: createTradingCurrency(normalized),
    primaryListing: createPrimaryListing(normalized),
    secondaryListings: createSecondaryListings(normalized),
    marketCapitalization: createMarketCapitalization(normalized),
    freeFloat: createFreeFloat(normalized),
    shareClasses: createShareClasses(normalized),
    indexMembership: createIndexMembership(normalized),
    listingHistory: createListingHistory(normalized),
    corporateActionsSummary: createCorporateActionsSummary(normalized),
    marketFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    marketIdentityOnly: true,
    noValuationMultiples: true,
    noIntrinsicValue: true,
    noExpectedReturn: true,
    noMarginOfSafety: true,
    noValuation: true,
    noScoring: true,
    noRecommendation: true,
    noExecution: true
  });
  const futureExtensions = Object.freeze(['live exchange reference link', 'shareholding history', 'index membership changes', 'corporate action timeline']);

  return deepFreeze({
    type: 'market-listing-details',
    feature: FEATURE_META,
    businessLogic: false,
    selfContained: true,
    responsive: Object.freeze({ supportsCompact: true, supportsWide: true, minimumContentWidth: 320 }),
    evidenceConfidence,
    sections,
    overviewFeatureView: createOverviewFeatureView({
      type: 'market-listing-details',
      feature: FEATURE_META,
      facts: marketFacts.items,
      aiInterpretation,
      investorJudgment,
      evidenceConfidence,
      guardrails,
      futureExtensions,
      sections
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      marketIdentityOnly: true,
      valuationEpicExcluded: true,
      userCanUnderstand: Object.freeze(['market identity', 'exchange', 'ticker', 'ISIN', 'trading currency', 'primary listing', 'secondary listings', 'market capitalization', 'free float', 'share classes', 'index membership', 'listing history', 'corporate actions summary']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultMarketListingDetailsInput() {
  return clone(DEFAULT_MARKET_LISTING_INPUT);
}

function createMarketListingHeader(input) { return Object.freeze({ component: 'MarketListingHeader', companyName: input.company.displayName, investorQuestion: FEATURE_META.investorQuestion }); }
function createMarketIdentity(input) { return Object.freeze({ component: 'MarketIdentity', ...input.marketIdentity, factsOnly: true }); }
function createExchange(input) { return Object.freeze({ component: 'Exchange', exchange: input.primaryListing.exchange, exchangeMic: input.primaryListing.exchangeMic, country: input.primaryListing.country, factsOnly: true }); }
function createTicker(input) { return Object.freeze({ component: 'Ticker', ticker: input.primaryListing.ticker, factsOnly: true }); }
function createIsin(input) { return Object.freeze({ component: 'ISIN', isin: input.primaryListing.isin, factsOnly: true }); }
function createTradingCurrency(input) { return Object.freeze({ component: 'TradingCurrency', tradingCurrency: input.primaryListing.tradingCurrency, factsOnly: true }); }
function createPrimaryListing(input) { return Object.freeze({ component: 'PrimaryListing', ...input.primaryListing, factsOnly: true }); }
function createSecondaryListings(input) { return Object.freeze({ component: 'SecondaryListings', items: input.secondaryListings, factsOnly: true }); }
function createMarketCapitalization(input) { return Object.freeze({ component: 'MarketCapitalization', marketCapitalization: input.marketIdentity.marketCapitalization, asOf: input.marketIdentity.marketCapAsOf, factsOnly: true, noValuationInterpretation: true }); }
function createFreeFloat(input) { return Object.freeze({ component: 'FreeFloat', ...input.freeFloat, factsOnly: true }); }
function createShareClasses(input) { return Object.freeze({ component: 'ShareClasses', items: input.shareClasses, factsOnly: true }); }
function createIndexMembership(input) { return Object.freeze({ component: 'IndexMembership', items: input.indexMembership, factsOnly: true }); }
function createListingHistory(input) { return Object.freeze({ component: 'ListingHistory', items: input.listingHistory, factsOnly: true }); }
function createCorporateActionsSummary(input) { return Object.freeze({ component: 'CorporateActionsSummary', items: input.corporateActionsSummary, factsOnly: true, marketIdentityContextOnly: true }); }

function createMarketFacts(input) {
  return Object.freeze({
    component: 'MarketFacts',
    items: deepFreeze([
      { id: 'public-market-status', kind: 'fact', source: 'market-listing-input', value: input.marketIdentity.publicMarketStatus },
      { id: 'primary-listing', kind: 'fact', source: 'exchange-listing-input', value: `${input.primaryListing.ticker} / ${input.primaryListing.exchange}` },
      { id: 'isin', kind: 'fact', source: 'security-identifier-input', value: input.primaryListing.isin },
      { id: 'market-capitalization', kind: 'fact', source: 'market-listing-input', value: input.marketIdentity.marketCapitalization },
      { id: 'free-float', kind: 'fact', source: 'shareholding-pattern-input', value: `${input.freeFloat.freeFloatPercent}%` }
    ]),
    factsOnly: true
  });
}

function createAiInterpretation(input) {
  return Object.freeze({
    component: 'MarketListingAIInterpretation',
    kind: 'generated_explanation',
    source: 'deterministic-product-summary',
    basedOn: Object.freeze(['market-identity', 'primary-listing', 'secondary-listings', 'share-classes', 'free-float', 'index-membership', 'listing-history', 'corporate-actions-summary']),
    summary: `${input.company.displayName} exists in public markets as ${input.primaryListing.ticker} on ${input.primaryListing.exchange}, trading in ${input.primaryListing.tradingCurrency}, with ${input.freeFloat.freeFloatPercent}% free float and market capitalization recorded as ${input.marketIdentity.marketCapitalization}.`,
    caution: 'Generated market identity interpretation only. It excludes valuation multiples, intrinsic value, expected return, margin of safety, score, recommendation, and execution.'
  });
}
function createInvestorJudgment(input) { return Object.freeze({ component: 'MarketListingInvestorJudgment', status: input.investorJudgment.status, note: input.investorJudgment.note, controlledBy: 'Investor', noAutomation: true }); }

function normalizeInput(input) {
  const company = input.company || {};
  requireText(company.displayName, 'company.displayName');
  return Object.freeze({
    company: Object.freeze({ displayName: company.displayName, legalName: valueOrUnknown(company.legalName) }),
    marketIdentity: normalizeObject(input.marketIdentity, ['marketCapitalization', 'marketCapAsOf', 'publicMarketStatus']),
    primaryListing: normalizeObject(input.primaryListing, ['exchange', 'exchangeMic', 'ticker', 'isin', 'tradingCurrency', 'country', 'listingStatus']),
    secondaryListings: normalizeItems(input.secondaryListings, ['exchange', 'exchangeMic', 'ticker', 'tradingCurrency', 'listingStatus']),
    shareClasses: normalizeItems(input.shareClasses, ['className', 'votingRights', 'listed', 'primary']),
    freeFloat: normalizeObject(input.freeFloat, ['freeFloatPercent', 'promoterHoldingPercent', 'institutionalHoldingPercent', 'publicHoldingPercent', 'source']),
    indexMembership: normalizeItems(input.indexMembership, ['indexName', 'membershipStatus']),
    listingHistory: normalizeItems(input.listingHistory, ['date', 'event', 'exchange']),
    corporateActionsSummary: normalizeItems(input.corporateActionsSummary, ['date', 'actionType', 'description']),
    investorJudgment: Object.freeze({ status: valueOrUnknown(input.investorJudgment?.status), note: valueOrUnknown(input.investorJudgment?.note) })
  });
}
function normalizeObject(item, requiredFields) { const source = item || {}; for (const field of requiredFields) if (source[field] === undefined || source[field] === null || source[field] === '') throw new Error(`${field} is required`); return Object.freeze({ ...source }); }
function normalizeItems(items, requiredFields) { return deepFreeze(freezeList(items).map((item, index) => { for (const field of requiredFields) if (item?.[field] === undefined || item?.[field] === null || item?.[field] === '') throw new Error(`items[${index}].${field} is required`); return Object.freeze({ ...item }); })); }
function freezeList(value) { return Object.freeze([...(Array.isArray(value) ? value : [])]); }
function valueOrUnknown(value) { return value === undefined || value === null || value === '' ? 'Unknown' : value; }
function requireText(value, label) { if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
