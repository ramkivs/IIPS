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
import { createCompanySecurityDomainFoundation } from '../src/domain/company-security/index.js';
import { createValuationFrameworkFoundation } from '../src/valuation-framework/index.js';
import { createValuationPluginFoundation } from '../src/valuation-plugins/index.js';
import { createDCFPlugin } from '../src/valuation-plugins/dcf/index.js';
import { createRelativeValuationPlugin } from '../src/valuation-plugins/relative/index.js';
import { createValuationNormalization } from '../src/valuation-normalization/index.js';
import { createScoringFramework } from '../src/scoring-framework/index.js';
import { createRecommendationFramework } from '../src/recommendation-framework/index.js';
import { createDecisionFramework } from '../src/decision-framework/index.js';
import {
  PORTFOLIO_SCHEMA_VERSION,
  PortfolioFrameworkEventType,
  PortfolioFrameworkCommandType,
  PortfolioType,
  PortfolioStatus,
  PortfolioIntentType,
  validatePortfolioCommand,
  createPortfolioAuditIdentity,
  createPortfolioArtifact,
  PortfolioRegistry,
  PortfolioLifecycleManager,
  PortfolioAccountRegistry,
  HoldingRegistry,
  AllocationRegistry,
  DecisionArtifactPortfolioAdapter,
  PortfolioIntentRegistry,
  PortfolioPolicyRegistry,
  PortfolioConstraintRegistry,
  PortfolioConstraintEvaluator,
  PortfolioExposureCalculator,
  PortfolioCompositionReadModel,
  PortfolioChangeProposalRegistry,
  PortfolioPermissionRegistry,
  PortfolioPermissionGate,
  registerDefaultPortfolioPermissions,
  PortfolioDiagnostics,
  PortfolioTelemetry,
  PortfolioProjectionRegistry,
  createPortfolioFramework
} from '../src/portfolio-framework/index.js';

function runtime(){
  const app=createApp({ env:{ NODE_ENV:'test' } });
  const shellRuntime=createApplicationShell({ app });
  const workflowRuntime=createWorkflowPlatform({ app, shellRuntime });
  const productRuntime=createProductModuleFramework({ app, workflowRuntime });
  const researchRuntime=createResearchModuleFoundation({ app, productRuntime, workflowRuntime });
  const researchIntelligenceRuntime=createResearchIntelligenceFoundation({ app, researchRuntime });
  const evidenceRuntime=createEvidenceGovernanceFoundation({ app, researchIntelligenceRuntime });
  const methodologyRuntime=createMethodologyFrameworkFoundation({ app, evidenceRuntime });
  const companySecurityRuntime=createCompanySecurityDomainFoundation({ app, methodologyRuntime });
  const valuationRuntime=createValuationFrameworkFoundation({ app, companySecurityRuntime, methodologyRuntime, evidenceRuntime });
  const valuationPluginRuntime=createValuationPluginFoundation({ app, valuationRuntime });
  const dcfRuntime=createDCFPlugin({ app, valuationRuntime, valuationPluginRuntime });
  const relativeValuationRuntime=createRelativeValuationPlugin({ app, valuationRuntime, valuationPluginRuntime });
  const valuationNormalizationRuntime=createValuationNormalization({ app, dcfRuntime, relativeValuationRuntime });
  const scoringRuntime=createScoringFramework({ app, valuationNormalizationRuntime });
  const recommendationRuntime=createRecommendationFramework({ app, scoringRuntime });
  const decisionRuntime=createDecisionFramework({ app, recommendationRuntime });
  const portfolioRuntime=createPortfolioFramework({ app, decisionRuntime });
  return { app, shellRuntime, portfolioRuntime };
}
function portfolioInput(){ return { portfolioType:PortfolioType.modelPortfolio, name:'Model Portfolio', baseCurrency:'INR', owner:'test' }; }
function decisionArtifact(){ return { decisionArtifactId:'DART_1', decisionSchemaVersion:'DECISION_SCHEMA_VERSION_1.0', decisionDisposition:'proceed-to-review', approvalDisposition:'approval-required', provenance:{ originatingRecommendationArtifact:'RECART_1' } }; }

test('Portfolio contracts define schema, commands and audit identity', () => {
  assert.equal(PORTFOLIO_SCHEMA_VERSION,'PORTFOLIO_SCHEMA_VERSION_1.0');
  assert.equal(PortfolioFrameworkEventType.PortfolioRegistered,'PortfolioRegistered');
  assert.equal(validatePortfolioCommand(PortfolioFrameworkCommandType.RegisterPortfolio), true);
  assert.throws(()=>validatePortfolioCommand('PlaceOrder'));
  const audit=createPortfolioAuditIdentity({ portfolioId:'PF_1', portfolioArtifactId:'PART_1', userId:'u1', correlationId:'CORR_1' });
  assert.match(audit.portfolioActionId,/^PACT_/);
});

test('Portfolio aggregate registers, versions and rejects execution fields', () => {
  const registry=new PortfolioRegistry();
  const p=registry.register(portfolioInput());
  assert.match(p.portfolioId,/^PF_/);
  assert.equal(p.portfolioSchemaVersion,PORTFOLIO_SCHEMA_VERSION);
  assert.throws(()=>registry.register({ ...portfolioInput(), portfolioId:p.portfolioId }));
  assert.throws(()=>registry.register({ ...portfolioInput(), broker:'ABC' }));
  const artifact=createPortfolioArtifact({ portfolioId:p.portfolioId });
  assert.match(artifact.portfolioArtifactId,/^PART_/);
});

test('Portfolio lifecycle and account/container model work', () => {
  const reg=new PortfolioRegistry();
  const p=reg.register(portfolioInput());
  const lifecycle=new PortfolioLifecycleManager();
  lifecycle.initialize(p.portfolioId);
  lifecycle.transition(p.portfolioId,'Registered');
  lifecycle.transition(p.portfolioId,'Active');
  assert.equal(lifecycle.status(p.portfolioId).lifecycle,'Active');
  const accounts=new PortfolioAccountRegistry({ portfolioRegistry:reg });
  const account=accounts.register({ portfolioId:p.portfolioId, accountType:'model-container', baseCurrency:'INR' });
  assert.match(account.portfolioAccountId,/^PACC_/);
  assert.throws(()=>accounts.register({ portfolioId:p.portfolioId, accountType:'broker', baseCurrency:'INR', broker:'ABC' }));
});

test('Holdings and allocations are structural and reject execution fields', () => {
  const holdings=new HoldingRegistry();
  const h=holdings.register({ portfolioId:'PF_1', securityId:'SEC_1', quantity:100, costBasis:1000, currency:'INR', weight:0.1 });
  assert.match(h.holdingId,/^HLD_/);
  assert.throws(()=>holdings.register({ portfolioId:'PF_1', securityId:'SEC_1', quantity:100, currency:'INR', orderType:'market' }));
  const allocations=new AllocationRegistry();
  const a=allocations.create({ portfolioId:'PF_1', targetType:'security', targetId:'SEC_1', targetWeight:0.15, currentWeight:0.10 });
  assert.equal(Math.round(a.drift*100), -5);
  assert.throws(()=>allocations.create({ portfolioId:'PF_1', targetType:'security', targetId:'SEC_1', targetWeight:0.15, currentWeight:0.10, rebalanceNow:true }));
});

test('Decision input adapter and portfolio intent work', () => {
  const input=new DecisionArtifactPortfolioAdapter().adapt(decisionArtifact());
  assert.equal(input.decisionArtifactId,'DART_1');
  assert.throws(()=>new DecisionArtifactPortfolioAdapter().adapt({ decisionArtifactId:'DART_BAD' }));
  const intents=new PortfolioIntentRegistry();
  const intent=intents.create({ portfolioId:'PF_1', decisionArtifactId:'DART_1', intentType:PortfolioIntentType.considerInclusion, subjectType:'security', subjectId:'SEC_1' });
  assert.match(intent.portfolioIntentId,/^PINT_/);
  assert.throws(()=>intents.create({ portfolioId:'PF_1', decisionArtifactId:'DART_1', intentType:'buy-order', subjectType:'security', subjectId:'SEC_1' }));
});

test('Portfolio policies and constraints evaluate structure only', () => {
  const policy=new PortfolioPolicyRegistry().register({ portfolioId:'PF_1', name:'Policy' });
  assert.match(policy.portfolioPolicyId,/^PPOL_/);
  const constraint=new PortfolioConstraintRegistry().register({ type:'max-weight-by-security', maxWeight:0.2, severity:'warning' });
  const result=new PortfolioConstraintEvaluator().evaluate({ constraint, holdings:[{ securityId:'SEC_1', weight:0.1 }] });
  assert.equal(result.status,'PASS');
  assert.equal(new PortfolioConstraintEvaluator().evaluate({ constraint, holdings:[{ securityId:'SEC_1', weight:0.3 }] }).status,'FAIL');
  assert.throws(()=>new PortfolioConstraintRegistry().register({ type:'auto-compliance', executionAlgo:'auto' }));
});

test('Exposure and composition read models are structural only', () => {
  const exposure=new PortfolioExposureCalculator().calculate({ holdings:[{ securityId:'SEC_1', weight:0.4, sector:'Tech' }, { securityId:'SEC_2', weight:0.6, sector:'Tech' }], dimension:'sector' });
  assert.equal(exposure.exposures[0].value,1);
  assert.throws(()=>new PortfolioExposureCalculator().calculate({ holdings:[], dimension:'VaR' }));
  const composition=new PortfolioCompositionReadModel().create({ portfolio:{ portfolioId:'PF_1' }, holdings:[], allocations:[], exposures:[exposure] });
  assert.equal(composition.portfolioId,'PF_1');
});

test('Portfolio change proposals are not orders', () => {
  const registry=new PortfolioChangeProposalRegistry();
  const proposal=registry.create({ portfolioId:'PF_1', sourceDecisionArtifactId:'DART_1', proposedChanges:[{ type:'include-candidate', subjectId:'SEC_1' }], rationaleReference:'DRAT_1', constraintEvaluation:{ status:'PASS' } });
  assert.match(proposal.proposalId,/^PPROP_/);
  assert.throws(()=>registry.create({ portfolioId:'PF_1', sourceDecisionArtifactId:'DART_1', proposedChanges:[{ type:'include-candidate', orderType:'market' }], rationaleReference:'DRAT_1' }));
});

test('Portfolio permissions, diagnostics and projections are governed', () => {
  const registry=registerDefaultPortfolioPermissions(new PortfolioPermissionRegistry());
  const gate=new PortfolioPermissionGate({ registry });
  assert.equal(gate.require('createPortfolioChangeProposal'), true);
  assert.throws(()=>gate.require('missing'));
  assert.throws(()=>registry.register({ action:'executeTrade' }));
  const diagnostics=new PortfolioDiagnostics({ telemetry:new PortfolioTelemetry() });
  diagnostics.record('portfoliosRegistered'); diagnostics.record('changeProposalsCreated');
  assert.equal(diagnostics.health().status,'Healthy');
  assert.throws(()=>diagnostics.record('ordersPlaced'));
  const projections=new PortfolioProjectionRegistry().registerDefaults();
  assert.equal(projections.update('portfolio.proposals', { type:PortfolioFrameworkEventType.PortfolioChangeProposalCreated, payload:{ proposalId:'PPROP_1' } }).lastEventType, PortfolioFrameworkEventType.PortfolioChangeProposalCreated);
});

test('Sprint 17 integrated flow creates portfolio framework artifacts without execution behavior', () => {
  const { shellRuntime, portfolioRuntime }=runtime();
  assert.equal(shellRuntime.shell.start('/').status,'mounted');
  const flow=portfolioRuntime.portfolioTestHarness.runFlow();
  portfolioRuntime.projectionRegistry.update('portfolio.holdings', { type:PortfolioFrameworkEventType.HoldingRegistered, payload:{ holdingId:flow.holding.holdingId } });
  portfolioRuntime.projectionRegistry.update('portfolio.allocations', { type:PortfolioFrameworkEventType.AllocationCreated, payload:{ allocationId:flow.allocation.allocationId } });
  portfolioRuntime.projectionRegistry.update('portfolio.exposure', { type:PortfolioFrameworkEventType.PortfolioExposureCalculated, payload:{ portfolioId:flow.portfolio.portfolioId } });
  portfolioRuntime.projectionRegistry.update('portfolio.proposals', { type:PortfolioFrameworkEventType.PortfolioChangeProposalCreated, payload:{ proposalId:flow.proposal.proposalId } });
  assert.equal(flow.snapshot.portfolioManifest.portfolioId, flow.portfolio.portfolioId);
  assert.equal(flow.replay.changeProposals.length,1);
  assert.equal(portfolioRuntime.portfolioTestHarness.assertNoForbiddenPortfolioLogic(flow), true);
  const serialized=JSON.stringify(flow).toLowerCase();
  for(const forbidden of ['order placement','broker integration','trade execution','settlement','live market routing','capital deployment']) assert.equal(serialized.includes(forbidden), false);
});
