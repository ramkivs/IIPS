import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/bootstrap/createApp.js';
import { createApplicationShell } from '../src/shell/index.js';
import { createWorkflowPlatform } from '../src/workflow/index.js';
import { createProductModuleFramework } from '../src/product/index.js';
import { createResearchModuleFoundation } from '../src/product-modules/research/index.js';
import { createResearchIntelligenceFoundation } from '../src/product-modules/research-intelligence/index.js';
import { createEvidenceGovernanceFoundation } from '../src/evidence/index.js';
import { createMethodologyFrameworkFoundation } from '../src/methodology-framework/index.js';
import {
  COMPANY_SECURITY_FEATURE_FLAG,
  DOMAIN_SCHEMA_VERSION,
  DomainCapability,
  CompanySecurityEventType,
  CompanySecurityCommandType,
  CompanyStatus,
  SecurityStatus,
  SecurityType,
  IdentifierType,
  ClassificationScheme,
  CorporateActionType,
  validateDomainCommand,
  createDomainAuditIdentity,
  CompanyRegistry,
  CompanyLifecycle,
  SecurityRegistry,
  SecurityLifecycle,
  ExchangeRegistry,
  ListingRegistry,
  IdentifierRegistry,
  IdentifierMappingService,
  ClassificationRegistry,
  CorporateActionRegistry,
  CompanySecurityDomainValidator,
  CompanySecurityPermissionRegistry,
  CompanySecurityPermissionGate,
  registerDefaultDomainPermissions,
  CompanySecurityContributionRegistry,
  CompanySecurityProjectionRegistry,
  CompanySecurityDiagnostics,
  CompanySecurityTelemetry,
  createCompanySecurityDomainFoundation
} from '../src/domain/company-security/index.js';

function runtime() {
  const app = createApp({ env: { NODE_ENV: 'test' } });
  const shellRuntime = createApplicationShell({ app });
  const workflowRuntime = createWorkflowPlatform({ app, shellRuntime });
  const productRuntime = createProductModuleFramework({ app, workflowRuntime });
  const researchRuntime = createResearchModuleFoundation({ app, productRuntime, workflowRuntime });
  const researchIntelligenceRuntime = createResearchIntelligenceFoundation({ app, researchRuntime });
  const evidenceRuntime = createEvidenceGovernanceFoundation({ app, researchIntelligenceRuntime });
  const methodologyRuntime = createMethodologyFrameworkFoundation({ app, evidenceRuntime });
  const companySecurityRuntime = createCompanySecurityDomainFoundation({ app, methodologyRuntime });
  return { app, shellRuntime, workflowRuntime, productRuntime, researchRuntime, researchIntelligenceRuntime, evidenceRuntime, methodologyRuntime, companySecurityRuntime };
}

function basicCompany(registry = new CompanyRegistry()) { return registry.register({ legalName: 'Example Industries Limited', displayName: 'Example Industries', domicileCountry: 'IN', incorporationCountry: 'IN', entityOrigin: 'test-fixture' }); }

test('Company/Security contracts define structural commands, feature flag, capabilities, and audit', () => {
  assert.equal(CompanySecurityEventType.CompanyRegistered, 'CompanyRegistered');
  assert.equal(CompanySecurityCommandType.RegisterCompany, 'RegisterCompany');
  assert.equal(DomainCapability.identity, 'identity');
  assert.equal(validateDomainCommand(CompanySecurityCommandType.RegisterSecurity), true);
  assert.throws(() => validateDomainCommand('CalculateValuation'));
  const audit = createDomainAuditIdentity({ companyId: 'CMP_1', securityId: 'SEC_1', listingId: 'LST_1', userId: 'u1', correlationId: 'CORR_1' });
  assert.match(audit.domainActionId, /^DACT_/);
});

test('Company/Security feature flag initializes', () => {
  const { app } = runtime();
  assert.equal(app.container.resolve('featureFlagRegistry').get(COMPANY_SECURITY_FEATURE_FLAG).default_enabled, true);
});

test('Company aggregate registers, validates identity, transitions, and rejects financial fields', () => {
  const registry = new CompanyRegistry();
  const company = basicCompany(registry);
  assert.match(company.companyId, /^CMP_/);
  assert.equal(company.domainSchemaVersion, DOMAIN_SCHEMA_VERSION);
  assert.equal(company.entityOrigin, 'test-fixture');
  const active = new CompanyLifecycle().transition(company, CompanyStatus.Active);
  assert.equal(active.status, CompanyStatus.Active);
  assert.throws(() => registry.register({ companyId: company.companyId, legalName: 'Duplicate', displayName: 'Duplicate', domicileCountry: 'IN', incorporationCountry: 'IN' }));
  assert.throws(() => registry.register({ legalName: 'Revenue Co', displayName: 'Revenue Co', domicileCountry: 'IN', incorporationCountry: 'IN', revenue: 100 }));
});

test('Security aggregate registers with issuer and rejects price/portfolio fields', () => {
  const companies = new CompanyRegistry();
  const company = basicCompany(companies);
  const securities = new SecurityRegistry({ companyRegistry: companies });
  const security = securities.register({ issuerCompanyId: company.companyId, securityType: SecurityType.equity, name: 'Example Equity', currency: 'INR', entityOrigin: 'test-fixture' });
  assert.match(security.securityId, /^SEC_/);
  assert.equal(new SecurityLifecycle().transition(security, SecurityStatus.Active).status, SecurityStatus.Active);
  assert.throws(() => securities.register({ issuerCompanyId: 'CMP_MISSING', securityType: SecurityType.equity, name: 'Missing', currency: 'INR' }));
  assert.throws(() => securities.register({ issuerCompanyId: company.companyId, securityType: SecurityType.equity, name: 'Price Security', currency: 'INR', price: 10 }));
});

test('Exchange and listing models register and reject duplicate active symbols', () => {
  const companies = new CompanyRegistry();
  const company = basicCompany(companies);
  const securities = new SecurityRegistry({ companyRegistry: companies });
  const security = securities.register({ issuerCompanyId: company.companyId, securityType: SecurityType.equity, name: 'Example Equity', currency: 'INR' });
  const exchanges = new ExchangeRegistry();
  const exchange = exchanges.register({ name: 'National Stock Exchange of India', country: 'IN', mic: 'XNSE', timezone: 'Asia/Kolkata' });
  const listings = new ListingRegistry({ securityRegistry: securities, exchangeRegistry: exchanges });
  const listing = listings.register({ securityId: security.securityId, exchangeId: exchange.exchangeId, tradingSymbol: 'EXAMPLE', listingCurrency: 'INR' });
  assert.match(listing.listingId, /^LST_/);
  assert.throws(() => listings.register({ securityId: security.securityId, exchangeId: exchange.exchangeId, tradingSymbol: 'EXAMPLE', listingCurrency: 'INR' }));
  assert.equal(listings.transition(listing.listingId, 'Delisted').status, 'Delisted');
});

test('Identifier registry maps canonical identifiers with confidence and rejects conflicts', () => {
  const identifiers = new IdentifierRegistry();
  const service = new IdentifierMappingService({ identifierRegistry: identifiers });
  const mapping = service.map({ identifierType: IdentifierType.ISIN, identifierValue: 'INE123A01016', entityType: 'security', entityId: 'SEC_1', mappingConfidence: 'authoritative' });
  assert.match(mapping.mappingId, /^IDMAP_/);
  assert.equal(mapping.mappingConfidence, 'authoritative');
  assert.equal(service.resolve(IdentifierType.ISIN, 'INE123A01016')[0].entityId, 'SEC_1');
  assert.throws(() => service.map({ identifierType: IdentifierType.ISIN, identifierValue: 'INE123A01016', entityType: 'security', entityId: 'SEC_2' }));
  assert.throws(() => identifiers.register({ identifierType: IdentifierType.ISIN, identifierValue: 'BAD' }));
});

test('Classification assignments preserve history and reject scoring fields', () => {
  const registry = new ClassificationRegistry();
  const assignment = registry.assign({ entityType: 'company', entityId: 'CMP_1', scheme: ClassificationScheme.IIPS_INTERNAL, sector: 'Industrials', industryGroup: 'Industrial Goods', industry: 'General Industrial', subIndustry: 'General' });
  assert.match(assignment.assignmentId, /^CLAS_/);
  assert.throws(() => registry.assign({ entityType: 'company', entityId: 'CMP_1', scheme: ClassificationScheme.IIPS_INTERNAL, sector: 'Industrials' }));
  const historical = registry.assign({ entityType: 'company', entityId: 'CMP_1', scheme: ClassificationScheme.GICS, sector: 'Industrials', effectiveTo: new Date().toISOString() });
  assert.ok(historical.effectiveTo);
  assert.throws(() => registry.assign({ entityType: 'company', entityId: 'CMP_2', scheme: ClassificationScheme.IIPS_INTERNAL, sector: 'High rating' }));
});

test('Corporate action metadata records without adjustment or return calculations', () => {
  const registry = new CorporateActionRegistry();
  const action = registry.record({ corporateActionType: CorporateActionType.nameChange, companyId: 'CMP_1', effectiveDate: new Date().toISOString(), sourceReference: { label: 'manual metadata' } });
  assert.match(action.corporateActionId, /^CACT_/);
  assert.equal(registry.byEntity({ companyId: 'CMP_1' }).length, 1);
  assert.throws(() => registry.record({ corporateActionType: CorporateActionType.split, companyId: 'CMP_1', effectiveDate: new Date().toISOString(), sourceReference: { label: 'manual' }, priceAdjustment: 0.5 }));
});

test('Domain validation detects graph invariants', () => {
  const companies = new CompanyRegistry();
  const company = basicCompany(companies);
  const securities = new SecurityRegistry({ companyRegistry: companies });
  const security = securities.register({ issuerCompanyId: company.companyId, securityType: SecurityType.equity, name: 'Example Equity', currency: 'INR' });
  const exchanges = new ExchangeRegistry();
  const exchange = exchanges.register({ name: 'NSE', country: 'IN', mic: 'XNSE', timezone: 'Asia/Kolkata' });
  const listings = new ListingRegistry({ securityRegistry: securities, exchangeRegistry: exchanges });
  const listing = listings.register({ securityId: security.securityId, exchangeId: exchange.exchangeId, tradingSymbol: 'EXAMPLE', listingCurrency: 'INR' });
  const validator = new CompanySecurityDomainValidator();
  assert.equal(validator.validate({ companies: [company], securities: [security], exchanges: [exchange], listings: [listing] }).status, 'PASS');
  assert.equal(validator.validate({ companies: [], securities: [security], exchanges: [exchange], listings: [listing] }).status, 'FAIL');
});

test('Domain permissions and contributions fail closed and reject investment permissions', () => {
  const { app } = runtime();
  const registry = registerDefaultDomainPermissions(new CompanySecurityPermissionRegistry());
  const gate = new CompanySecurityPermissionGate({ registry });
  assert.equal(gate.require('registerCompany'), true);
  assert.throws(() => gate.require('missingPermission'));
  assert.throws(() => registry.register({ action: 'calculateValuation' }));
  const contributions = new CompanySecurityContributionRegistry({ featureFlagRegistry: app.container.resolve('featureFlagRegistry'), permissionGate: gate });
  contributions.register({ contributionId: 'register-company', permission: 'registerCompany' });
  assert.equal(contributions.execute('register-company').status, 'executed');
  app.container.resolve('featureFlagRegistry').register({ flag_id: 'disabled_domain', default_enabled: false, owner: 'test', status: 'active' });
  contributions.register({ contributionId: 'blocked-domain', featureFlag: 'disabled_domain', permission: 'viewCompany' });
  assert.equal(contributions.execute('blocked-domain').status, 'blocked');
});

test('Domain projections, snapshots, diagnostics, and harness are structural only', () => {
  const projections = new CompanySecurityProjectionRegistry().registerDefaults();
  const state = projections.update('domain.company', { type: CompanySecurityEventType.CompanyRegistered, payload: { companyId: 'CMP_1' } });
  assert.equal(state.lastEventType, CompanySecurityEventType.CompanyRegistered);
  assert.throws(() => projections.update('domain.company', { type: 'ValuationCalculated', payload: {} }));
  const diagnostics = new CompanySecurityDiagnostics({ telemetry: new CompanySecurityTelemetry() });
  diagnostics.record('companiesRegistered');
  assert.equal(diagnostics.health().status, 'Healthy');
  assert.throws(() => diagnostics.record('investmentReturns'));
  const { companySecurityRuntime } = runtime();
  const flow = companySecurityRuntime.domainTestHarness.runFlow();
  assert.equal(flow.validation.status, 'PASS');
  assert.equal(flow.snapshot.manifest.snapshotSchemaVersion, DOMAIN_SCHEMA_VERSION);
  assert.equal(companySecurityRuntime.domainTestHarness.assertNoForbiddenDomainLogic(flow), true);
});

test('Sprint 8 integrated flow creates canonical company/security domain without analysis', () => {
  const { shellRuntime, companySecurityRuntime } = runtime();
  assert.equal(shellRuntime.shell.start('/').status, 'mounted');
  const result = companySecurityRuntime.domainTestHarness.runFlow();
  companySecurityRuntime.projectionRegistry.update('domain.company', { type: CompanySecurityEventType.CompanyRegistered, payload: { companyId: result.company.companyId } });
  companySecurityRuntime.projectionRegistry.update('domain.security', { type: CompanySecurityEventType.SecurityRegistered, payload: { securityId: result.security.securityId } });
  companySecurityRuntime.projectionRegistry.update('domain.listing', { type: CompanySecurityEventType.ListingRegistered, payload: { listingId: result.listing.listingId } });
  assert.equal(result.company.domainSchemaVersion, DOMAIN_SCHEMA_VERSION);
  assert.equal(result.security.issuerCompanyId, result.company.companyId);
  assert.equal(result.identifiers.length, 2);
  assert.equal(result.validation.status, 'PASS');
  const serialized = JSON.stringify(result).toLowerCase();
  for (const forbidden of ['discounted cash flow','stock scoring','buy recommendation','market data provider','target price','decision automation']) assert.equal(serialized.includes(forbidden), false);
});
