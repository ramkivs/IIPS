import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/bootstrap/createApp.js';
import { createApplicationShell } from '../src/shell/index.js';
import {
  createBusinessSnapshot,
  getDefaultBusinessSnapshotInput,
  createInvestmentThesis,
  getDefaultInvestmentThesisInput,
  createCompanyProfile,
  getDefaultCompanyProfileInput,
  createIndustrySector,
  getDefaultIndustrySectorInput,
  createProductsServices,
  getDefaultProductsServicesInput,
  createRevenueSegments,
  getDefaultRevenueSegmentsInput,
  createGeographicExposure,
  getDefaultGeographicExposureInput,
  createMarketListingDetails,
  getDefaultMarketListingDetailsInput,
  createCompanyWorkspaceView
} from '../src/workspaces/index.js';
import {
  CompanyRegistry,
  SecurityRegistry,
  ExchangeRegistry,
  ListingRegistry,
  ClassificationRegistry,
  ClassificationScheme,
  SecurityType
} from '../src/domain/company-security/index.js';

function createDomainBackedSnapshotInput() {
  const companyRegistry = new CompanyRegistry();
  const company = companyRegistry.register({
    legalName: 'Apex Consumer Products Limited',
    displayName: 'Apex Consumer Products',
    domicileCountry: 'IN',
    incorporationCountry: 'IN',
    entityOrigin: 'test-fixture',
    status: 'Active'
  });
  const securityRegistry = new SecurityRegistry({ companyRegistry });
  const security = securityRegistry.register({
    issuerCompanyId: company.companyId,
    securityType: SecurityType.equity,
    name: 'Apex Consumer Products Equity',
    currency: 'INR',
    entityOrigin: 'test-fixture',
    status: 'Active'
  });
  const exchangeRegistry = new ExchangeRegistry();
  const exchange = exchangeRegistry.register({ name: 'National Stock Exchange of India', country: 'IN', mic: 'XNSE', timezone: 'Asia/Kolkata' });
  const listingRegistry = new ListingRegistry({ securityRegistry, exchangeRegistry });
  const listing = listingRegistry.register({ securityId: security.securityId, exchangeId: exchange.exchangeId, tradingSymbol: 'APEX', listingCurrency: 'INR' });
  const classificationRegistry = new ClassificationRegistry();
  const classification = classificationRegistry.assign({
    entityType: 'company',
    entityId: company.companyId,
    scheme: ClassificationScheme.IIPS_INTERNAL,
    sector: 'Consumer Staples',
    industryGroup: 'Consumer Products',
    industry: 'Packaged Foods',
    subIndustry: 'Staples'
  });

  return {
    company,
    security,
    listing: { ...listing, exchange },
    classification,
    marketContext: { marketCapitalization: '₹48,000 Cr', asOf: 'FY2026 demo snapshot' },
    businessProfile: {
      description: 'Apex Consumer Products manufactures and distributes packaged foods, beverages, and household essentials through retail, modern trade, and digital channels.',
      productsAndServices: ['Packaged foods', 'Beverages', 'Household essentials', 'Digital direct-to-consumer sales'],
      revenueSegments: [
        { name: 'Packaged foods', percentage: 52 },
        { name: 'Beverages', percentage: 28 },
        { name: 'Household essentials', percentage: 20 }
      ],
      geographicExposure: [
        { region: 'India', percentage: 82 },
        { region: 'International', percentage: 18 }
      ]
    }
  };
}

test('CW-OV-001 Business Snapshot creates a self-contained, one-minute company overview', () => {
  const snapshot = createBusinessSnapshot(createDomainBackedSnapshotInput());

  assert.equal(snapshot.type, 'business-snapshot');
  assert.equal(snapshot.feature.stableId, 'CW-OV-001');
  assert.equal(snapshot.feature.status, 'Released');
  assert.equal(snapshot.feature.version, '1.0');
  assert.equal(snapshot.feature.workspace, 'Company Workspace');
  assert.equal(snapshot.feature.epic, 'Overview');
  assert.equal(snapshot.feature.featureId, '1.1');
  assert.equal(snapshot.feature.investorQuestion, 'Should I spend time researching this company?');
  assert.equal(snapshot.selfContained, true);
  assert.equal(snapshot.acceptance.oneMinuteComprehension, true);
  assert.deepEqual(snapshot.acceptance.userCanUnderstand, ['what it does', 'how it earns money', 'where it operates', 'whether it deserves deeper analysis']);

  assert.equal(snapshot.sections.companyHeader.title, 'Apex Consumer Products');
  assert.equal(snapshot.sections.companyHeader.ticker, 'APEX');
  assert.equal(snapshot.sections.companyHeader.marketCapitalization, '₹48,000 Cr');
  assert.equal(snapshot.sections.identityCard.exchangeMic, 'XNSE');
  assert.equal(snapshot.sections.revenueMix.segments[0].name, 'Packaged foods');
  assert.equal(snapshot.sections.geographicMix.regions[0].region, 'India');
  assert.equal(snapshot.sections.investmentContext.noRecommendation, true);
});

test('CW-OV-001 separates facts from generated explanations', () => {
  const snapshot = createBusinessSnapshot(createDomainBackedSnapshotInput());

  assert.equal(snapshot.facts.every(item => item.kind === 'fact'), true);
  assert.equal(snapshot.generatedExplanations.every(item => item.kind === 'generated_explanation'), true);
  assert.equal(snapshot.sections.businessSummary.factsAndExplanationsSeparated, true);
  assert.equal(snapshot.sections.businessSummary.factualDescription.includes('manufactures and distributes'), true);
  assert.equal(snapshot.sections.businessSummary.plainLanguageSummary.disclaimer.includes('Generated explanation'), true);
  assert.deepEqual(snapshot.sections.businessSummary.plainLanguageSummary.basedOnFacts, ['business-description', 'products-and-services', 'revenue-mix', 'geographic-mix']);
});

test('CW-OV-002 Investment Thesis captures why the business may deserve ownership', () => {
  const thesis = createInvestmentThesis(getDefaultInvestmentThesisInput());

  assert.equal(thesis.type, 'investment-thesis');
  assert.equal(thesis.feature.stableId, 'CW-OV-002');
  assert.equal(thesis.feature.status, 'Released');
  assert.equal(thesis.feature.version, '1.0');
  assert.equal(thesis.feature.investorQuestion, 'Why might this business deserve ownership?');
  assert.equal(thesis.selfContained, true);
  assert.deepEqual(thesis.acceptance.userCanUnderstand, [
    'why the business may deserve ownership',
    'what facts support the thesis',
    'what could break the thesis',
    'what evidence is still missing'
  ]);

  assert.equal(thesis.sections.thesisHeader.component, 'ThesisHeader');
  assert.equal(thesis.sections.supportingFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(thesis.sections.thesisPoints.items.every(item => item.kind === 'investor_thesis_point'), true);
  assert.equal(thesis.sections.counterpoints.items.every(item => item.kind === 'counter_thesis_point'), true);
  assert.equal(thesis.sections.evidenceGaps.items[0].priority, 'High');
});

test('CW-OV-002 keeps Facts, AI Interpretation, and Investor Judgment distinct', () => {
  const thesis = createInvestmentThesis(getDefaultInvestmentThesisInput());

  assert.equal(thesis.sections.supportingFacts.factsOnly, true);
  assert.equal(thesis.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(thesis.sections.aiInterpretation.caution.includes('does not create conviction'), true);
  assert.equal(thesis.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(thesis.sections.investorJudgment.finalConclusionRequiredFromInvestor, true);
  assert.equal(thesis.sections.investorJudgment.noAutomation, true);
  assert.equal(thesis.acceptance.factsAiJudgmentSeparated, true);
});

test('CW-OV-003 Company Profile explains how the business is organized structurally', () => {
  const profile = createCompanyProfile(getDefaultCompanyProfileInput());

  assert.equal(profile.type, 'company-profile');
  assert.equal(profile.feature.stableId, 'CW-OV-003');
  assert.equal(profile.feature.status, 'Released');
  assert.equal(profile.feature.version, '1.0');
  assert.equal(profile.feature.investorQuestion, 'How is this business organized?');
  assert.equal(profile.acceptance.structuralNotDescriptive, true);
  assert.deepEqual(profile.acceptance.userCanUnderstand, [
    'corporate structure',
    'operating model',
    'customer categories',
    'distribution model',
    'revenue model',
    'capital intensity',
    'regulatory environment'
  ]);
  assert.equal(profile.sections.corporateStructure.component, 'CorporateStructure');
  assert.equal(profile.sections.operatingModel.component, 'OperatingModel');
  assert.equal(profile.sections.customerCategories.items.some(item => item.category === 'B2C'), true);
  assert.equal(profile.sections.revenueModel.primaryModel, 'Product sales');
  assert.equal(profile.sections.regulatoryEnvironment.level, 'Medium');
});

test('CW-OV-003 keeps structural facts, AI interpretation, and investor judgment distinct', () => {
  const profile = createCompanyProfile(getDefaultCompanyProfileInput());

  assert.equal(profile.sections.structuralFacts.items.every(item => item.kind === 'fact'), true);
  assert.equal(profile.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(profile.sections.aiInterpretation.caution.includes('does not determine business quality'), true);
  assert.equal(profile.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(profile.sections.investorJudgment.noAutomation, true);
  assert.equal(profile.acceptance.factsAiJudgmentSeparated, true);
});



test('Overview features expose the shared OverviewFeatureView presentation contract', () => {
  const features = [
    createBusinessSnapshot(createDomainBackedSnapshotInput()),
    createInvestmentThesis(getDefaultInvestmentThesisInput()),
    createCompanyProfile(getDefaultCompanyProfileInput()),
    createIndustrySector(getDefaultIndustrySectorInput()),
    createProductsServices(getDefaultProductsServicesInput()),
    createRevenueSegments(getDefaultRevenueSegmentsInput()),
    createGeographicExposure(getDefaultGeographicExposureInput()),
    createMarketListingDetails(getDefaultMarketListingDetailsInput())
  ];

  assert.deepEqual(features.map(feature => feature.overviewFeatureView.contract), [
    'OverviewFeatureView',
    'OverviewFeatureView',
    'OverviewFeatureView',
    'OverviewFeatureView',
    'OverviewFeatureView',
    'OverviewFeatureView',
    'OverviewFeatureView',
    'OverviewFeatureView'
  ]);
  for (const feature of features) {
    assert.equal(feature.overviewFeatureView.id, feature.feature.stableId);
    assert.equal(feature.overviewFeatureView.title, feature.feature.featureName);
    assert.equal(feature.overviewFeatureView.investorQuestion, feature.feature.investorQuestion);
    assert.equal(feature.overviewFeatureView.evidenceConfidence.notInvestmentConfidence, true);
    assert.equal(feature.overviewFeatureView.guardrails.noRecommendation, true);
    assert.equal(feature.overviewFeatureView.guardrails.noExecution, true);
  }
});

test('Overview features expose Evidence Confidence without treating it as investment confidence', () => {
  const snapshot = createBusinessSnapshot(createDomainBackedSnapshotInput());
  const thesis = createInvestmentThesis(getDefaultInvestmentThesisInput());
  const profile = createCompanyProfile(getDefaultCompanyProfileInput());
  const industry = createIndustrySector(getDefaultIndustrySectorInput());
  const products = createProductsServices(getDefaultProductsServicesInput());
  const revenue = createRevenueSegments(getDefaultRevenueSegmentsInput());
  const geography = createGeographicExposure(getDefaultGeographicExposureInput());
  const market = createMarketListingDetails(getDefaultMarketListingDetailsInput());

  assert.equal(snapshot.evidenceConfidence.confidence, 'High');
  assert.equal(snapshot.evidenceConfidence.coverage, 95);
  assert.equal(thesis.evidenceConfidence.confidence, 'Medium');
  assert.equal(thesis.evidenceConfidence.coverage, 68);
  assert.equal(profile.evidenceConfidence.confidence, 'Medium');
  assert.equal(profile.evidenceConfidence.coverage, 72);
  assert.equal(industry.evidenceConfidence.confidence, 'Medium');
  assert.equal(industry.evidenceConfidence.coverage, 70);
  assert.equal(products.evidenceConfidence.confidence, 'Medium');
  assert.equal(products.evidenceConfidence.coverage, 74);
  assert.equal(revenue.evidenceConfidence.confidence, 'Medium');
  assert.equal(revenue.evidenceConfidence.coverage, 78);
  assert.equal(geography.evidenceConfidence.confidence, 'Medium');
  assert.equal(geography.evidenceConfidence.coverage, 73);
  assert.equal(market.evidenceConfidence.confidence, 'Medium');
  assert.equal(market.evidenceConfidence.coverage, 80);
  assert.equal(snapshot.evidenceConfidence.notInvestmentConfidence, true);
  assert.equal(thesis.evidenceConfidence.notInvestmentConfidence, true);
  assert.equal(profile.evidenceConfidence.notInvestmentConfidence, true);
  assert.equal(industry.evidenceConfidence.notInvestmentConfidence, true);
  assert.equal(products.evidenceConfidence.notInvestmentConfidence, true);
  assert.equal(revenue.evidenceConfidence.notInvestmentConfidence, true);
  assert.equal(revenue.evidenceConfidence.missingEvidenceChecklist.every(item => item.complete === false), true);
  assert.equal(geography.evidenceConfidence.missingEvidenceChecklist.some(item => item.status === 'partial'), true);
  assert.equal(geography.evidenceConfidence.missingEvidenceChecklist.every(item => ['missing', 'partial', 'verified'].includes(item.status)), true);
  assert.equal(geography.evidenceConfidence.missingEvidenceChecklist.every(item => typeof item.sourceCount === 'number'), true);
  assert.equal(geography.evidenceConfidence.missingEvidenceChecklist.every(item => ['High', 'Medium', 'Low'].includes(item.priority)), true);
  assert.equal(market.evidenceConfidence.missingEvidenceChecklist.some(item => item.status === 'partial'), true);
});

test('CW-OV-004 Industry & Sector explains the competitive environment without financial analysis', () => {
  const industry = createIndustrySector(getDefaultIndustrySectorInput());

  assert.equal(industry.type, 'industry-sector');
  assert.equal(industry.feature.stableId, 'CW-OV-004');
  assert.equal(industry.feature.status, 'Released');
  assert.equal(industry.feature.version, '1.0');
  assert.equal(industry.feature.investorQuestion, 'What environment does this business compete in?');
  assert.equal(industry.acceptance.stillMakesSenseWithoutFinancialNumbers, true);
  assert.deepEqual(industry.acceptance.userCanUnderstand, [
    'industry overview',
    'sector characteristics',
    'market structure',
    'competitive landscape',
    'growth drivers',
    'industry headwinds',
    'industry-level regulation',
    'industry lifecycle',
    'structural risks'
  ]);
  assert.equal(industry.sections.industryOverview.component, 'IndustryOverview');
  assert.equal(industry.sections.marketStructure.component, 'MarketStructure');
  assert.equal(industry.sections.competitiveLandscape.items.length, 3);
  assert.equal(industry.sections.regulatoryEnvironment.component, 'IndustryRegulatoryEnvironment');
  assert.equal(industry.evidenceConfidence.confidence, 'Medium');
  assert.equal(industry.evidenceConfidence.coverage, 70);
});

test('CW-OV-004 keeps industry facts, AI interpretation, and investor judgment distinct', () => {
  const industry = createIndustrySector(getDefaultIndustrySectorInput());

  assert.equal(industry.sections.industryOverview.factsOnly, true);
  assert.equal(industry.sections.sectorCharacteristics.factsOnly, true);
  assert.equal(industry.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(industry.sections.aiInterpretation.caution.includes('excludes ROE, margins, valuation'), true);
  assert.equal(industry.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(industry.sections.investorJudgment.noAutomation, true);
  assert.equal(industry.acceptance.factsAiJudgmentSeparated, true);
});


test('CW-OV-005 Products & Services explains what the company sells from the customer perspective', () => {
  const products = createProductsServices(getDefaultProductsServicesInput());

  assert.equal(products.type, 'products-services');
  assert.equal(products.feature.stableId, 'CW-OV-005');
  assert.equal(products.feature.status, 'Released');
  assert.equal(products.feature.version, '1.0');
  assert.equal(products.feature.investorQuestion, 'What exactly does this company sell, and who uses it?');
  assert.equal(products.acceptance.customerPerspective, true);
  assert.equal(products.acceptance.qualitativeRevenueDriversOnly, true);
  assert.equal(products.acceptance.doesNotDuplicateRevenueSegments, true);
  assert.deepEqual(products.acceptance.userCanUnderstand, [
    'product portfolio',
    'core offerings',
    'customer segments',
    'primary use cases',
    'value proposition',
    'qualitative revenue drivers',
    'product differentiation',
    'product lifecycle'
  ]);
  assert.equal(products.sections.coreOfferings.items.length, 3);
  assert.equal(products.sections.customerSegments.items.some(item => item.type === 'B2C'), true);
  assert.equal(products.sections.qualitativeRevenueDrivers.qualitativeOnly, true);
  assert.equal(products.sections.productFacts.items.every(item => item.kind === 'fact'), true);
});

test('CW-OV-005 distinguishes qualitative revenue drivers from reported revenue segments', () => {
  const products = createProductsServices(getDefaultProductsServicesInput());

  assert.equal(products.boundaries.qualitativeRevenueOnly, true);
  assert.equal(products.boundaries.noReportedSegmentRevenue, true);
  assert.equal(products.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(products.sections.aiInterpretation.caution.includes('not reported revenue segments'), true);
  assert.equal(products.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(products.sections.investorJudgment.noAutomation, true);
});


test('CW-OV-006 Revenue Segments explains reported revenue composition without re-explaining products', () => {
  const revenue = createRevenueSegments(getDefaultRevenueSegmentsInput());

  assert.equal(revenue.type, 'revenue-segments');
  assert.equal(revenue.feature.stableId, 'CW-OV-006');
  assert.equal(revenue.feature.status, 'Released');
  assert.equal(revenue.feature.version, '1.0');
  assert.equal(revenue.feature.investorQuestion, "Where does this company's reported revenue come from?");
  assert.equal(revenue.acceptance.reportedCompositionOnly, true);
  assert.equal(revenue.acceptance.doesNotDuplicateProductsServices, true);
  assert.deepEqual(revenue.acceptance.userCanUnderstand, [
    'reported revenue segments',
    'segment contribution',
    'geographic revenue split',
    'historical segment growth',
    'segment concentration',
    'cyclical exposure',
    'segment trends'
  ]);
  assert.equal(revenue.sections.reportedRevenueSegments.items.length, 3);
  assert.equal(revenue.sections.segmentConcentration.largestSegment, 'Packaged foods');
  assert.equal(revenue.sections.segmentConcentration.concentrationLevel, 'Medium');
  assert.equal(revenue.sections.geographicRevenueSplit.items[0].geography, 'India');
});

test('CW-OV-006 keeps reported composition separate from product explanation and investment analysis', () => {
  const revenue = createRevenueSegments(getDefaultRevenueSegmentsInput());

  assert.equal(revenue.boundaries.reportedCompositionOnly, true);
  assert.equal(revenue.boundaries.noProductPortfolioExplanation, true);
  assert.equal(revenue.boundaries.noMarginAnalysis, true);
  assert.equal(revenue.boundaries.noProfitabilityAnalysis, true);
  assert.equal(revenue.boundaries.noValuation, true);
  assert.equal(revenue.boundaries.noScoring, true);
  assert.equal(revenue.boundaries.noRecommendation, true);
  assert.equal(revenue.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(revenue.sections.aiInterpretation.caution.includes('does not explain product value propositions'), true);
  assert.equal(revenue.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(revenue.sections.segmentFacts.items.every(item => item.kind === 'fact'), true);
});


test('CW-OV-007 Geographic Exposure explains geographic risks and opportunities, not just presence', () => {
  const geography = createGeographicExposure(getDefaultGeographicExposureInput());

  assert.equal(geography.type, 'geographic-exposure');
  assert.equal(geography.feature.stableId, 'CW-OV-007');
  assert.equal(geography.feature.status, 'Released');
  assert.equal(geography.feature.version, '1.0');
  assert.equal(geography.feature.investorQuestion, 'Where is this business exposed geographically?');
  assert.equal(geography.acceptance.exposureFocused, true);
  assert.deepEqual(geography.acceptance.userCanUnderstand, [
    'operating footprint',
    'revenue exposure',
    'manufacturing footprint',
    'supply chain exposure',
    'customer exposure',
    'currency exposure',
    'geopolitical exposure',
    'country concentration',
    'growth markets',
    'structural geographic risks'
  ]);
  assert.equal(geography.sections.countryConcentration.largestGeography, 'India');
  assert.equal(geography.sections.countryConcentration.concentrationLevel, 'High');
  assert.equal(geography.sections.currencyExposure.items.some(item => item.currency === 'USD'), true);
});

test('CW-OV-007 complements Revenue Segments and preserves investment guardrails', () => {
  const geography = createGeographicExposure(getDefaultGeographicExposureInput());

  assert.equal(geography.boundaries.exposureNotPresenceOnly, true);
  assert.equal(geography.boundaries.complementsRevenueSegments, true);
  assert.equal(geography.boundaries.noValuation, true);
  assert.equal(geography.boundaries.noScoring, true);
  assert.equal(geography.boundaries.noRecommendation, true);
  assert.equal(geography.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(geography.sections.aiInterpretation.caution.includes('does not value the company'), true);
  assert.equal(geography.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(geography.sections.geographicFacts.items.every(item => item.kind === 'fact'), true);
});


test('CW-OV-008 Market Cap & Listing Details explains market identity without valuation', () => {
  const market = createMarketListingDetails(getDefaultMarketListingDetailsInput());

  assert.equal(market.type, 'market-listing-details');
  assert.equal(market.feature.stableId, 'CW-OV-008');
  assert.equal(market.feature.status, 'Released');
  assert.equal(market.feature.version, '1.0');
  assert.equal(market.feature.investorQuestion, 'How does this company exist in the public markets?');
  assert.equal(market.acceptance.marketIdentityOnly, true);
  assert.equal(market.acceptance.valuationEpicExcluded, true);
  assert.deepEqual(market.acceptance.userCanUnderstand, [
    'market identity',
    'exchange',
    'ticker',
    'ISIN',
    'trading currency',
    'primary listing',
    'secondary listings',
    'market capitalization',
    'free float',
    'share classes',
    'index membership',
    'listing history',
    'corporate actions summary'
  ]);
  assert.equal(market.sections.primaryListing.ticker, 'APEX');
  assert.equal(market.sections.marketCapitalization.noValuationInterpretation, true);
  assert.equal(market.sections.corporateActionsSummary.marketIdentityContextOnly, true);
});

test('CW-OV-008 excludes valuation concepts and preserves investor control', () => {
  const market = createMarketListingDetails(getDefaultMarketListingDetailsInput());

  assert.equal(market.boundaries.marketIdentityOnly, true);
  assert.equal(market.boundaries.noValuationMultiples, true);
  assert.equal(market.boundaries.noIntrinsicValue, true);
  assert.equal(market.boundaries.noExpectedReturn, true);
  assert.equal(market.boundaries.noMarginOfSafety, true);
  assert.equal(market.boundaries.noValuation, true);
  assert.equal(market.boundaries.noRecommendation, true);
  assert.equal(market.sections.aiInterpretation.kind, 'generated_explanation');
  assert.equal(market.sections.aiInterpretation.caution.includes('excludes valuation multiples'), true);
  assert.equal(market.sections.investorJudgment.controlledBy, 'Investor');
  assert.equal(market.sections.marketFacts.items.every(item => item.kind === 'fact'), true);
});

test('Company Overview features preserve product boundaries and do not perform investment decisions', () => {
  const snapshot = createBusinessSnapshot(createDomainBackedSnapshotInput());
  const thesis = createInvestmentThesis(getDefaultInvestmentThesisInput());
  const profile = createCompanyProfile(getDefaultCompanyProfileInput());
  const industry = createIndustrySector(getDefaultIndustrySectorInput());
  const products = createProductsServices(getDefaultProductsServicesInput());
  const revenue = createRevenueSegments(getDefaultRevenueSegmentsInput());
  const geography = createGeographicExposure(getDefaultGeographicExposureInput());
  const market = createMarketListingDetails(getDefaultMarketListingDetailsInput());
  const serialized = JSON.stringify({ snapshot, thesis, profile, industry, products, revenue, geography, market }).toLowerCase();

  assert.equal(snapshot.acceptance.noValuationLogic, true);
  assert.equal(snapshot.acceptance.noScoringLogic, true);
  assert.equal(snapshot.acceptance.noRecommendationLogic, true);
  assert.equal(thesis.boundaries.noRecommendation, true);
  assert.equal(thesis.boundaries.noValuation, true);
  assert.equal(thesis.boundaries.noScoring, true);
  assert.equal(thesis.boundaries.noExecution, true);
  assert.equal(thesis.acceptance.noAutomatedDecision, true);
  assert.equal(profile.boundaries.noRecommendation, true);
  assert.equal(profile.boundaries.noValuation, true);
  assert.equal(profile.boundaries.noScoring, true);
  assert.equal(profile.boundaries.noExecution, true);
  assert.equal(profile.acceptance.noAutomatedDecision, true);
  assert.equal(industry.boundaries.noRoe, true);
  assert.equal(industry.boundaries.noMargins, true);
  assert.equal(industry.boundaries.noValuation, true);
  assert.equal(industry.boundaries.noMoatRating, true);
  assert.equal(industry.boundaries.noFinancialQuality, true);
  assert.equal(industry.boundaries.noScoring, true);
  assert.equal(industry.boundaries.noRecommendation, true);
  assert.equal(industry.boundaries.noExecution, true);
  assert.equal(products.boundaries.qualitativeRevenueOnly, true);
  assert.equal(products.boundaries.noReportedSegmentRevenue, true);
  assert.equal(products.boundaries.noValuation, true);
  assert.equal(products.boundaries.noScoring, true);
  assert.equal(products.boundaries.noRecommendation, true);
  assert.equal(products.boundaries.noExecution, true);
  assert.equal(revenue.boundaries.reportedCompositionOnly, true);
  assert.equal(revenue.boundaries.noProductPortfolioExplanation, true);
  assert.equal(revenue.boundaries.noMarginAnalysis, true);
  assert.equal(revenue.boundaries.noProfitabilityAnalysis, true);
  assert.equal(revenue.boundaries.noValuation, true);
  assert.equal(revenue.boundaries.noScoring, true);
  assert.equal(revenue.boundaries.noRecommendation, true);
  assert.equal(revenue.boundaries.noExecution, true);
  assert.equal(geography.boundaries.exposureNotPresenceOnly, true);
  assert.equal(geography.boundaries.noValuation, true);
  assert.equal(geography.boundaries.noScoring, true);
  assert.equal(geography.boundaries.noRecommendation, true);
  assert.equal(geography.boundaries.noExecution, true);
  assert.equal(market.boundaries.marketIdentityOnly, true);
  assert.equal(market.boundaries.noValuationMultiples, true);
  assert.equal(market.boundaries.noIntrinsicValue, true);
  assert.equal(market.boundaries.noExpectedReturn, true);
  assert.equal(market.boundaries.noMarginOfSafety, true);
  assert.equal(market.boundaries.noValuation, true);
  assert.equal(market.boundaries.noScoring, true);
  assert.equal(market.boundaries.noRecommendation, true);
  assert.equal(market.boundaries.noExecution, true);

  for (const forbidden of ['discounted cash flow', 'buy recommendation', 'sell recommendation', 'place order', 'broker connector', 'ebitda margin']) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test('Company Workspace route mounts released Overview features as usable product functionality', () => {
  const app = createApp({ env: { NODE_ENV: 'test' } });
  const runtime = createApplicationShell({ app });
  const result = runtime.shell.start('/company');

  assert.equal(result.status, 'mounted');
  assert.equal(result.workspaceId, 'company');
  const view = result.view.regions.content.content;
  assert.equal(view.type, 'company-workspace');
  assert.equal(view.activeEpic, 'Overview');
  assert.equal(view.activeFeature.stableId, 'CW-OV-008');
  assert.deepEqual(view.releasedFeatures.map(feature => feature.stableId), ['CW-OV-001', 'CW-OV-002', 'CW-OV-003', 'CW-OV-004', 'CW-OV-005', 'CW-OV-006', 'CW-OV-007', 'CW-OV-008']);
  assert.equal(view.content.type, 'company-overview');
  assert.equal(view.content.businessSnapshot.type, 'business-snapshot');
  assert.equal(view.content.investmentThesis.type, 'investment-thesis');
  assert.equal(view.content.companyProfile.type, 'company-profile');
  assert.equal(view.content.industrySector.type, 'industry-sector');
  assert.equal(view.content.productsServices.type, 'products-services');
  assert.equal(view.content.revenueSegments.type, 'revenue-segments');
  assert.equal(view.content.geographicExposure.type, 'geographic-exposure');
  assert.equal(view.content.marketListingDetails.type, 'market-listing-details');
  assert.equal(view.content.overviewProgress.label, 'Overview Completion: 8 / 8');
  assert.equal(view.content.overviewProgress.completed, 8);
  assert.equal(view.content.overviewRelease.status, 'Complete');
  assert.equal(view.content.overviewRelease.version, '1.0');
  assert.equal(view.content.overviewRelease.releasedFeatures, 8);
  assert.equal(view.content.overviewRelease.investorQuestionsAnswered, 8);
  assert.equal(view.content.overviewRelease.presentationContract, 'Stable');
  assert.equal(view.content.overviewProgress.total, 8);
  assert.deepEqual(view.content.overviewProgress.items.filter(item => item.complete).map(item => item.stableId), ['CW-OV-001', 'CW-OV-002', 'CW-OV-003', 'CW-OV-004', 'CW-OV-005', 'CW-OV-006', 'CW-OV-007', 'CW-OV-008']);
  assert.equal(view.content.overviewEvidence.evidenceCompleteness, 76);
  assert.equal(view.content.overviewEvidence.overallEvidenceConfidence, 'Medium');
  assert.equal(view.content.overviewEvidence.notInvestmentConfidence, true);
  assert.equal(view.content.overviewFeatureViews.every(item => item.contract === 'OverviewFeatureView'), true);
  assert.equal(view.content.factsAiJudgmentSeparated, true);
});

test('Company Workspace Overview declares responsive and extensible UI sections', () => {
  const view = createCompanyWorkspaceView({ workspaceId: 'company', label: 'Company', snapshotInput: getDefaultBusinessSnapshotInput(), thesisInput: getDefaultInvestmentThesisInput(), profileInput: getDefaultCompanyProfileInput(), industrySectorInput: getDefaultIndustrySectorInput(), productsServicesInput: getDefaultProductsServicesInput(), revenueSegmentsInput: getDefaultRevenueSegmentsInput(), geographicExposureInput: getDefaultGeographicExposureInput(), marketListingInput: getDefaultMarketListingDetailsInput() });
  const snapshot = view.content.businessSnapshot;
  const thesis = view.content.investmentThesis;
  const profile = view.content.companyProfile;
  const industry = view.content.industrySector;
  const products = view.content.productsServices;
  const revenue = view.content.revenueSegments;
  const geography = view.content.geographicExposure;
  const market = view.content.marketListingDetails;

  assert.equal(view.businessLogic, false);
  assert.equal(snapshot.responsive.supportsCompact, true);
  assert.equal(thesis.responsive.supportsCompact, true);
  assert.equal(profile.responsive.supportsCompact, true);
  assert.equal(industry.responsive.supportsCompact, true);
  assert.equal(products.responsive.supportsCompact, true);
  assert.equal(revenue.responsive.supportsCompact, true);
  assert.equal(geography.responsive.supportsCompact, true);
  assert.equal(market.responsive.supportsCompact, true);
  assert.deepEqual(Object.values(snapshot.sections).map(section => section.component), [
    'CompanyHeader',
    'IdentityCard',
    'BusinessSummary',
    'RevenueMix',
    'GeographicMix',
    'InvestmentContext'
  ]);
  assert.deepEqual(Object.values(thesis.sections).map(section => section.component), [
    'ThesisHeader',
    'ThesisSummary',
    'SupportingFacts',
    'ThesisPoints',
    'Counterpoints',
    'Assumptions',
    'EvidenceGaps',
    'AIInterpretation',
    'InvestorJudgment'
  ]);
  assert.deepEqual(Object.values(profile.sections).map(section => section.component), [
    'ProfileHeader',
    'CorporateStructure',
    'OperatingModel',
    'BusinessSegments',
    'GeographicFootprint',
    'CustomerCategories',
    'DistributionModel',
    'RevenueModel',
    'CapitalIntensity',
    'RegulatoryEnvironment',
    'StructuralFacts',
    'ProfileAIInterpretation',
    'ProfileInvestorJudgment'
  ]);
  assert.equal(thesis.futureExtensions.includes('AI thesis challenger'), true);
  assert.deepEqual(Object.values(industry.sections).map(section => section.component), [
    'IndustryHeader',
    'IndustryOverview',
    'SectorCharacteristics',
    'MarketStructure',
    'CompetitiveLandscape',
    'GrowthDrivers',
    'IndustryHeadwinds',
    'IndustryRegulatoryEnvironment',
    'IndustryLifecycle',
    'StructuralRisks',
    'IndustryFacts',
    'IndustryAIInterpretation',
    'IndustryInvestorJudgment'
  ]);
  assert.equal(profile.futureExtensions.includes('subsidiary map'), true);
  assert.deepEqual(Object.values(products.sections).map(section => section.component), [
    'ProductsHeader',
    'ProductPortfolio',
    'CoreOfferings',
    'CustomerSegments',
    'PrimaryUseCases',
    'ValueProposition',
    'QualitativeRevenueDrivers',
    'ProductDifferentiation',
    'ProductLifecycle',
    'ProductFacts',
    'ProductsAIInterpretation',
    'ProductsInvestorJudgment'
  ]);
  assert.equal(industry.futureExtensions.includes('source-linked industry reports'), true);
  assert.deepEqual(Object.values(revenue.sections).map(section => section.component), [
    'RevenueSegmentsHeader',
    'ReportedRevenueSegments',
    'SegmentContribution',
    'GeographicRevenueSplit',
    'SegmentGrowth',
    'SegmentConcentration',
    'CyclicalExposure',
    'SegmentTrends',
    'RevenueSegmentFacts',
    'RevenueSegmentsAIInterpretation',
    'RevenueSegmentsInvestorJudgment'
  ]);
  assert.equal(products.futureExtensions.includes('product catalog links'), true);
  assert.deepEqual(Object.values(geography.sections).map(section => section.component), [
    'GeographicExposureHeader',
    'OperatingFootprint',
    'RevenueExposure',
    'ManufacturingFootprint',
    'SupplyChainExposure',
    'CustomerExposure',
    'CurrencyExposure',
    'GeopoliticalExposure',
    'CountryConcentration',
    'GrowthMarkets',
    'StructuralGeographicRisks',
    'GeographicFacts',
    'GeographicExposureAIInterpretation',
    'GeographicExposureInvestorJudgment'
  ]);
  assert.equal(revenue.futureExtensions.includes('source filing links'), true);
  assert.deepEqual(Object.values(market.sections).map(section => section.component), [
    'MarketListingHeader',
    'MarketIdentity',
    'Exchange',
    'Ticker',
    'ISIN',
    'TradingCurrency',
    'PrimaryListing',
    'SecondaryListings',
    'MarketCapitalization',
    'FreeFloat',
    'ShareClasses',
    'IndexMembership',
    'ListingHistory',
    'CorporateActionsSummary',
    'MarketFacts',
    'MarketListingAIInterpretation',
    'MarketListingInvestorJudgment'
  ]);
  assert.equal(geography.futureExtensions.includes('country exposure map'), true);
  assert.equal(market.futureExtensions.includes('live exchange reference link'), true);
});
