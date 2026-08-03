import { createInvestmentThesis } from './InvestmentThesis.js';
import { createCompanyProfile } from './CompanyProfile.js';
import { createIndustrySector } from './IndustrySector.js';
import { createProductsServices } from './ProductsServices.js';
import { createRevenueSegments } from './RevenueSegments.js';
import { createGeographicExposure } from './GeographicExposure.js';
import { createMarketListingDetails } from './MarketListingDetails.js';
import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createOverviewFeatureView } from './OverviewFeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-OV-001',
  workspace: 'Company Workspace',
  epic: 'Overview',
  featureId: '1.1',
  featureName: 'Business Snapshot',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'Should I spend time researching this company?',
  purpose: 'Provide a 60-second understanding of what the business does.'
});

const DEFAULT_BUSINESS_SNAPSHOT_INPUT = Object.freeze({
  company: Object.freeze({
    companyId: 'CMP_DEMO_BUSINESS_SNAPSHOT',
    legalName: 'Apex Consumer Products Limited',
    displayName: 'Apex Consumer Products',
    domicileCountry: 'IN',
    incorporationCountry: 'IN',
    status: 'Active'
  }),
  security: Object.freeze({
    securityId: 'SEC_DEMO_BUSINESS_SNAPSHOT',
    securityType: 'equity',
    name: 'Apex Consumer Products Equity',
    currency: 'INR'
  }),
  listing: Object.freeze({
    tradingSymbol: 'APEX',
    listingCurrency: 'INR',
    exchange: Object.freeze({ name: 'National Stock Exchange of India', mic: 'XNSE', country: 'IN' })
  }),
  classification: Object.freeze({ sector: 'Consumer Staples', industry: 'Packaged Foods' }),
  marketContext: Object.freeze({ marketCapitalization: '₹48,000 Cr', asOf: 'demo snapshot' }),
  businessProfile: Object.freeze({
    description: 'Apex Consumer Products manufactures and distributes packaged foods, beverages, and household essentials through retail, modern trade, and digital channels.',
    productsAndServices: Object.freeze(['Packaged foods', 'Beverages', 'Household essentials', 'Digital direct-to-consumer sales']),
    revenueSegments: Object.freeze([
      Object.freeze({ name: 'Packaged foods', percentage: 52 }),
      Object.freeze({ name: 'Beverages', percentage: 28 }),
      Object.freeze({ name: 'Household essentials', percentage: 20 })
    ]),
    geographicExposure: Object.freeze([
      Object.freeze({ region: 'India', percentage: 82 }),
      Object.freeze({ region: 'International', percentage: 18 })
    ])
  })
});

export function createBusinessSnapshot(input = DEFAULT_BUSINESS_SNAPSHOT_INPUT) {
  const normalized = normalizeInput(input);
  const facts = createFacts(normalized);
  const generatedExplanations = createGeneratedExplanations(normalized);
  const sections = Object.freeze({
    companyHeader: createCompanyHeader(normalized),
    identityCard: createIdentityCard(normalized),
    businessSummary: createBusinessSummary(normalized, generatedExplanations),
    revenueMix: createRevenueMix(normalized),
    geographicMix: createGeographicMix(normalized),
    investmentContext: createInvestmentContext(normalized)
  });
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'High',
    coverage: 95,
    rationale: 'Business Snapshot is highly supported because identity, listing, sector, business description, revenue mix, and geographic exposure are present.',
    evidenceItems: ['company identity', 'listing details', 'sector and industry', 'business description', 'revenue mix', 'geographic exposure'],
    missingEvidence: ['source document links for each snapshot input']
  });
  const futureExtensions = Object.freeze(['AI-generated thesis starter', 'peer context', 'segment trend analysis', 'business model risk flags']);

  return deepFreeze({
    type: 'business-snapshot',
    feature: FEATURE_META,
    businessLogic: false,
    selfContained: true,
    responsive: Object.freeze({ supportsCompact: true, supportsWide: true, minimumContentWidth: 320 }),
    sourceBoundary: 'Domain identity plus product snapshot inputs; market and segment facts are not written into the Company/Security domain.',
    evidenceConfidence,
    sections,
    overviewFeatureView: createOverviewFeatureView({
      type: 'business-snapshot',
      feature: FEATURE_META,
      facts,
      aiInterpretation: generatedExplanations[0],
      investorJudgment: sections.investmentContext,
      evidenceConfidence,
      guardrails: { noValuation: true, noScoring: true, noRecommendation: true, noExecution: true },
      futureExtensions,
      sections
    }),
    facts,
    generatedExplanations,
    acceptance: Object.freeze({
      oneMinuteComprehension: true,
      userCanUnderstand: Object.freeze(['what it does', 'how it earns money', 'where it operates', 'whether it deserves deeper analysis']),
      noValuationLogic: true,
      noScoringLogic: true,
      noRecommendationLogic: true,
      noExecutionLogic: true
    }),
    futureExtensions
  });
}

export function createCompanyWorkspaceView({ workspaceId = 'company', label = 'Company', snapshotInput, thesisInput, profileInput, industrySectorInput, productsServicesInput, revenueSegmentsInput, geographicExposureInput, marketListingInput } = {}) {
  const snapshot = createBusinessSnapshot(snapshotInput);
  const thesis = createInvestmentThesis(thesisInput);
  const profile = createCompanyProfile(profileInput);
  const industrySector = createIndustrySector(industrySectorInput);
  const productsServices = createProductsServices(productsServicesInput);
  const revenueSegments = createRevenueSegments(revenueSegmentsInput);
  const geographicExposure = createGeographicExposure(geographicExposureInput);
  const marketListingDetails = createMarketListingDetails(marketListingInput);
  const releasedOverviewFeatures = Object.freeze([snapshot, thesis, profile, industrySector, productsServices, revenueSegments, geographicExposure, marketListingDetails]);
  const overviewProgress = createOverviewProgress(releasedOverviewFeatures.map(feature => feature.feature));
  const overviewEvidence = createOverviewEvidenceSummary(releasedOverviewFeatures);
  return deepFreeze({
    type: 'company-workspace',
    workspaceId,
    label,
    title: 'Company Workspace',
    investorQuestion: 'Should I own this business?',
    activeEpic: 'Overview',
    activeFeature: marketListingDetails.feature,
    releasedFeatures: releasedOverviewFeatures.map(feature => feature.feature),
    layout: Object.freeze({ primary: 'overview', secondary: Object.freeze(['business-quality', 'valuation', 'decision', 'portfolio-context']) }),
    content: Object.freeze({
      type: 'company-overview',
      overviewProgress,
      overviewRelease: createOverviewRelease(overviewProgress, releasedOverviewFeatures),
      overviewEvidence,
      overviewFeatureViews: releasedOverviewFeatures.map(feature => feature.overviewFeatureView),
      features: releasedOverviewFeatures,
      businessSnapshot: snapshot,
      investmentThesis: thesis,
      companyProfile: profile,
      industrySector,
      productsServices,
      revenueSegments,
      geographicExposure,
      marketListingDetails,
      factsAiJudgmentSeparated: true
    }),
    businessLogic: false
  });
}

export function getDefaultBusinessSnapshotInput() {
  return clone(DEFAULT_BUSINESS_SNAPSHOT_INPUT);
}

function createOverviewProgress(releasedFeatures) {
  const released = new Set(releasedFeatures.map(feature => feature.stableId));
  const items = [
    { stableId: 'CW-OV-001', label: 'Business Snapshot' },
    { stableId: 'CW-OV-002', label: 'Investment Thesis' },
    { stableId: 'CW-OV-003', label: 'Company Profile' },
    { stableId: 'CW-OV-004', label: 'Industry & Sector' },
    { stableId: 'CW-OV-005', label: 'Products & Services' },
    { stableId: 'CW-OV-006', label: 'Revenue Segments' },
    { stableId: 'CW-OV-007', label: 'Geographic Exposure' },
    { stableId: 'CW-OV-008', label: 'Market Cap & Listing Details' }
  ].map(item => Object.freeze({ ...item, status: released.has(item.stableId) ? 'Released' : 'Planned', complete: released.has(item.stableId) }));
  const completed = items.filter(item => item.complete).length;
  return Object.freeze({
    component: 'OverviewCompleteness',
    completed,
    total: items.length,
    label: `Overview Completion: ${completed} / ${items.length}`,
    items: Object.freeze(items)
  });
}

function createOverviewRelease(progress, features) {
  const complete = progress.completed === progress.total;
  return Object.freeze({
    component: 'OverviewReleaseStatus',
    epic: 'Overview',
    status: complete ? 'Complete' : 'In Progress',
    version: complete ? '1.0' : '0.x',
    releasedFeatures: features.length,
    investorQuestionsAnswered: features.length,
    evidenceRollupEnabled: true,
    presentationContract: 'Stable',
    complete
  });
}

function createOverviewEvidenceSummary(features) {
  const coverages = features.map(feature => feature.evidenceConfidence?.coverage).filter(value => Number.isFinite(Number(value)));
  const evidenceCompleteness = coverages.length ? Math.round(coverages.reduce((sum, value) => sum + Number(value), 0) / coverages.length) : 0;
  const overallEvidenceConfidence = evidenceCompleteness >= 85 ? 'High' : evidenceCompleteness >= 60 ? 'Medium' : evidenceCompleteness > 0 ? 'Low' : 'Unknown';
  return Object.freeze({
    component: 'OverviewEvidenceSummary',
    evidenceCompleteness,
    evidenceCompletenessLabel: `Evidence Completeness: ${evidenceCompleteness}%`,
    overallEvidenceConfidence,
    overallEvidenceConfidenceLabel: `Overall Evidence Confidence: ${overallEvidenceConfidence}`,
    notInvestmentConfidence: true,
    inputs: Object.freeze(features.map(feature => Object.freeze({
      stableId: feature.feature.stableId,
      title: feature.feature.featureName,
      confidence: feature.evidenceConfidence.confidence,
      coverage: feature.evidenceConfidence.coverage
    })))
  });
}

function normalizeInput(input) {
  const company = input.company || {};
  const security = input.security || {};
  const listing = input.listing || {};
  const classification = input.classification || {};
  const businessProfile = input.businessProfile || {};
  const marketContext = input.marketContext || {};
  requireText(company.displayName || company.legalName, 'company.displayName');
  requireText(businessProfile.description, 'businessProfile.description');
  return Object.freeze({
    company: Object.freeze({
      companyId: valueOrUnknown(company.companyId),
      legalName: valueOrUnknown(company.legalName),
      displayName: company.displayName || company.legalName,
      domicileCountry: valueOrUnknown(company.domicileCountry),
      incorporationCountry: valueOrUnknown(company.incorporationCountry),
      status: valueOrUnknown(company.status)
    }),
    security: Object.freeze({
      securityId: valueOrUnknown(security.securityId),
      securityType: valueOrUnknown(security.securityType),
      name: valueOrUnknown(security.name),
      currency: valueOrUnknown(security.currency)
    }),
    listing: Object.freeze({
      tradingSymbol: valueOrUnknown(listing.tradingSymbol),
      listingCurrency: valueOrUnknown(listing.listingCurrency),
      exchange: Object.freeze({
        name: valueOrUnknown(listing.exchange?.name),
        mic: valueOrUnknown(listing.exchange?.mic),
        country: valueOrUnknown(listing.exchange?.country)
      })
    }),
    classification: Object.freeze({ sector: valueOrUnknown(classification.sector), industry: valueOrUnknown(classification.industry) }),
    marketContext: Object.freeze({ marketCapitalization: valueOrUnknown(marketContext.marketCapitalization), asOf: valueOrUnknown(marketContext.asOf) }),
    businessProfile: Object.freeze({
      description: businessProfile.description,
      productsAndServices: freezeList(businessProfile.productsAndServices),
      revenueSegments: freezeList(businessProfile.revenueSegments).map(segment => Object.freeze({ name: segment.name, percentage: segment.percentage })),
      geographicExposure: freezeList(businessProfile.geographicExposure).map(region => Object.freeze({ region: region.region, percentage: region.percentage }))
    })
  });
}

function createCompanyHeader(input) {
  return Object.freeze({
    component: 'CompanyHeader',
    title: input.company.displayName,
    subtitle: input.classification.industry === 'Unknown' ? input.classification.sector : `${input.classification.sector} • ${input.classification.industry}`,
    ticker: input.listing.tradingSymbol,
    exchange: input.listing.exchange.name,
    marketCapitalization: input.marketContext.marketCapitalization,
    dataAsOf: input.marketContext.asOf,
    factsOnly: true
  });
}

function createIdentityCard(input) {
  return Object.freeze({
    component: 'IdentityCard',
    legalName: input.company.legalName,
    domicileCountry: input.company.domicileCountry,
    incorporationCountry: input.company.incorporationCountry,
    securityType: input.security.securityType,
    currency: input.security.currency,
    listingCurrency: input.listing.listingCurrency,
    exchangeMic: input.listing.exchange.mic,
    factsOnly: true
  });
}

function createBusinessSummary(input, generatedExplanations) {
  return Object.freeze({
    component: 'BusinessSummary',
    factualDescription: input.businessProfile.description,
    plainLanguageSummary: generatedExplanations.find(item => item.id === 'plain-language-business-summary'),
    productsAndServices: input.businessProfile.productsAndServices,
    factsAndExplanationsSeparated: true
  });
}

function createRevenueMix(input) {
  return Object.freeze({ component: 'RevenueMix', segments: input.businessProfile.revenueSegments, factsOnly: true });
}

function createGeographicMix(input) {
  return Object.freeze({ component: 'GeographicMix', regions: input.businessProfile.geographicExposure, factsOnly: true });
}

function createInvestmentContext(input) {
  return Object.freeze({
    component: 'InvestmentContext',
    prompt: 'Use this snapshot to decide whether the company deserves deeper research.',
    contextPoints: Object.freeze([
      `${input.company.displayName} operates in ${input.classification.sector}.`,
      `Main listed symbol: ${input.listing.tradingSymbol} on ${input.listing.exchange.name}.`,
      `Largest revenue segment: ${largestLabel(input.businessProfile.revenueSegments, 'name')}.`,
      `Largest geographic exposure: ${largestLabel(input.businessProfile.geographicExposure, 'region')}.`
    ]),
    noRecommendation: true
  });
}

function createFacts(input) {
  return deepFreeze([
    { id: 'company-identity', kind: 'fact', source: 'company-security-domain', value: input.company.displayName },
    { id: 'listing', kind: 'fact', source: 'company-security-domain', value: `${input.listing.tradingSymbol} / ${input.listing.exchange.name}` },
    { id: 'sector-industry', kind: 'fact', source: 'classification-input', value: `${input.classification.sector} / ${input.classification.industry}` },
    { id: 'market-cap', kind: 'fact', source: 'product-snapshot-input', value: input.marketContext.marketCapitalization },
    { id: 'business-description', kind: 'fact', source: 'product-snapshot-input', value: input.businessProfile.description }
  ]);
}

function createGeneratedExplanations(input) {
  return deepFreeze([
    {
      id: 'plain-language-business-summary',
      kind: 'generated_explanation',
      source: 'deterministic-product-summary',
      basedOnFacts: Object.freeze(['business-description', 'products-and-services', 'revenue-mix', 'geographic-mix']),
      text: `${input.company.displayName} is a ${input.classification.industry.toLowerCase()} business that earns money mainly from ${joinNames(input.businessProfile.revenueSegments, 'name')} and operates primarily in ${joinNames(input.businessProfile.geographicExposure, 'region')}.`,
      disclaimer: 'Generated explanation for readability; verify against source facts before using in an investment conclusion.'
    },
    {
      id: 'unusual-characteristics',
      kind: 'generated_explanation',
      source: 'deterministic-product-summary',
      basedOnFacts: Object.freeze(['revenue-mix', 'geographic-mix']),
      text: summarizeConcentration(input),
      disclaimer: 'This is an explanatory observation, not a score, recommendation, or valuation.'
    }
  ]);
}

function summarizeConcentration(input) {
  const segment = largest(input.businessProfile.revenueSegments, 'percentage');
  const region = largest(input.businessProfile.geographicExposure, 'percentage');
  const points = [];
  if (segment?.percentage >= 50) points.push(`${segment.name} contributes ${segment.percentage}% of revenue`);
  if (region?.percentage >= 70) points.push(`${region.region} contributes ${region.percentage}% of geographic exposure`);
  return points.length ? `Notable concentration: ${points.join('; ')}.` : 'No single segment or geography dominates the snapshot inputs.';
}

function largestLabel(items, labelKey) {
  const item = largest(items, 'percentage');
  if (!item) return 'Unknown';
  return `${item[labelKey]} (${item.percentage}%)`;
}

function largest(items, valueKey) {
  return [...items].sort((a, b) => Number(b[valueKey] || 0) - Number(a[valueKey] || 0))[0] || null;
}

function joinNames(items, key) {
  const names = items.map(item => item[key]).filter(Boolean);
  if (names.length === 0) return 'the listed business lines';
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

function freezeList(value) {
  return Object.freeze([...(Array.isArray(value) ? value : [])]);
}

function valueOrUnknown(value) {
  return value === undefined || value === null || value === '' ? 'Unknown' : value;
}

function requireText(value, label) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
