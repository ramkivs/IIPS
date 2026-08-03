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
import {
  RELATIVE_VALUATION_PLUGIN_ID,
  RELATIVE_VALUATION_FORMULA_VERSION,
  RelativeValuationMethod,
  RelativeValuationOutlierPolicy,
  RelativeValuationPluginEventType,
  RelativeValuationPluginCommandType,
  RelativeValuationErrorCode,
  validateRelativeValuationCommand,
  createRelativeValuationAuditIdentity,
  createRelativeValuationPluginManifest,
  RelativeValuationPluginManifestValidator,
  RelativeValuationMethodRegistry,
  RelativeValuationInputValidator,
  RelativeValuationAssumptionBundle,
  MultipleStatisticsEngine,
  RelativeValuationFormulaEngine,
  RelativeValuationExecutionAdapter,
  RelativeValuationOutputNormalizer,
  RelativeValuationPermissionRegistry,
  RelativeValuationPermissionGate,
  registerDefaultRelativeValuationPermissions,
  RelativeValuationDiagnostics,
  RelativeValuationTelemetry,
  RelativeValuationProjectionRegistry,
  createRelativeValuationPlugin
} from '../src/valuation-plugins/relative/index.js';

function runtime(){ const app=createApp({ env:{ NODE_ENV:'test' } }); const shellRuntime=createApplicationShell({ app }); const workflowRuntime=createWorkflowPlatform({ app, shellRuntime }); const productRuntime=createProductModuleFramework({ app, workflowRuntime }); const researchRuntime=createResearchModuleFoundation({ app, productRuntime, workflowRuntime }); const researchIntelligenceRuntime=createResearchIntelligenceFoundation({ app, researchRuntime }); const evidenceRuntime=createEvidenceGovernanceFoundation({ app, researchIntelligenceRuntime }); const methodologyRuntime=createMethodologyFrameworkFoundation({ app, evidenceRuntime }); const companySecurityRuntime=createCompanySecurityDomainFoundation({ app, methodologyRuntime }); const valuationRuntime=createValuationFrameworkFoundation({ app, companySecurityRuntime, methodologyRuntime, evidenceRuntime }); const valuationPluginRuntime=createValuationPluginFoundation({ app, valuationRuntime }); const relativeValuationRuntime=createRelativeValuationPlugin({ app, valuationRuntime, valuationPluginRuntime }); return { app, shellRuntime, relativeValuationRuntime }; }
function input(overrides={}){ const peerSet=[{ peerId:'P1', peerName:'Peer One', source:'manual', includedBy:'analyst', includedAt:'2026-07-21T00:00:00.000Z', multipleValue:8, metricValue:100, marketValueInput:800, currency:'INR' }, { peerId:'P2', peerName:'Peer Two', source:'manual', includedBy:'analyst', includedAt:'2026-07-21T00:00:00.000Z', multipleValue:10, metricValue:100, marketValueInput:1000, currency:'INR' }, { peerId:'P3', peerName:'Peer Three', source:'manual', includedBy:'analyst', includedAt:'2026-07-21T00:00:00.000Z', multipleValue:12, metricValue:100, marketValueInput:1200, currency:'INR' }]; return { valuationInputPackageId:'VINP_REL', companyId:'CMP_REL', securityId:'SEC_REL', currency:'INR', selectedMethod:RelativeValuationMethod.EV_EBITDA, peerSet, companyMetric:100, shareCount:10, customInputs:{ netDebt:50, investmentsAndCash:20 }, outlierPolicy:RelativeValuationOutlierPolicy.median, statisticalMethod:'median', assumptionsVersion:'RELATIVE_ASSUMPTIONS_1.0', ...overrides }; }

test('Relative valuation contracts define methods, formula version, commands and audit', () => { assert.equal(RELATIVE_VALUATION_FORMULA_VERSION,'RELATIVE_VALUATION_FORMULA_VERSION_1.0'); assert.equal(RelativeValuationPluginEventType.RelativeValuationResultCreated,'RelativeValuationResultCreated'); assert.equal(validateRelativeValuationCommand(RelativeValuationPluginCommandType.ValidateRelativeValuationInputs), true); assert.throws(()=>validateRelativeValuationCommand('RankPeers')); const audit=createRelativeValuationAuditIdentity({ pluginVersion:'1.0.0', valuationExecutionId:'VEXEC_1', valuationInputPackageId:'VINP_1', companyId:'CMP_1', securityId:'SEC_1', correlationId:'CORR_1' }); assert.match(audit.relativeValuationActionId,/^RVALACT_/); });

test('Relative valuation manifest validates method capability declarations', () => { const manifest=createRelativeValuationPluginManifest(); assert.equal(manifest.valuationPluginId, RELATIVE_VALUATION_PLUGIN_ID); assert.equal(new RelativeValuationPluginManifestValidator().validate(manifest), true); assert.throws(()=>new RelativeValuationPluginManifestValidator().validate({ ...manifest, methodCapabilities:{ supportsEVEBITDA:true } })); assert.throws(()=>new RelativeValuationPluginManifestValidator().validate({ ...manifest, outputContract:['recommendation'] })); });

test('Relative method registry exposes definitions and capability matrix', () => { const registry=new RelativeValuationMethodRegistry(); assert.equal(registry.get(RelativeValuationMethod.EV_EBITDA).valuationBasis,'enterprise'); assert.equal(registry.get(RelativeValuationMethod.PE).valuationBasis,'equity'); assert.equal(registry.capabilityMatrix().EV_EBITDA, true); assert.throws(()=>registry.get('BAD_METHOD')); });

test('Relative inputs validate peer provenance, currency and missing metrics', () => { assert.equal(new RelativeValuationInputValidator().validate(input()).status,'Passed'); assert.equal(new RelativeValuationAssumptionBundle(input()).selectedMethod, RelativeValuationMethod.EV_EBITDA); assert.equal(new RelativeValuationInputValidator().validate(input({ peerSet:[] })).errors[0].code, RelativeValuationErrorCode.MISSING_PEER_SET); const noProv=input(); noProv.peerSet=[{ multipleValue:1, currency:'INR' }]; assert.equal(new RelativeValuationInputValidator().validate(noProv).errors[0].code, RelativeValuationErrorCode.MISSING_PEER_PROVENANCE); const mixed=input(); mixed.peerSet=[...mixed.peerSet]; mixed.peerSet[0]={ ...mixed.peerSet[0], currency:'USD' }; assert.equal(new RelativeValuationInputValidator().validate(mixed).errors.some(e=>e.code===RelativeValuationErrorCode.MIXED_CURRENCY), true); assert.equal(new RelativeValuationInputValidator().validate(input({ marketData:{ price:1 } })).status,'Failed'); });

test('Multiple statistics engine calculates mean, median, trimmed, winsorized and selected multiple', () => { const stats=new MultipleStatisticsEngine().calculate(new RelativeValuationAssumptionBundle(input())); assert.equal(stats.mean,10); assert.equal(stats.median,10); assert.equal(stats.selectedMultiple,10); assert.equal(stats.trace.some(s=>s.step==='selected-multiple'), true); const manual=new MultipleStatisticsEngine().calculate(new RelativeValuationAssumptionBundle(input({ outlierPolicy:'manual', statisticalMethod:'manual', selectedMultiple:9 }))); assert.equal(manual.selectedMultiple,9); });

test('Relative valuation formula supports all configured methods', () => { const methods=[RelativeValuationMethod.EV_EBITDA, RelativeValuationMethod.EV_EBIT, RelativeValuationMethod.EV_SALES, RelativeValuationMethod.PE, RelativeValuationMethod.PB, RelativeValuationMethod.PCFO, RelativeValuationMethod.PEG, RelativeValuationMethod.CUSTOM_MULTIPLE]; for(const method of methods){ const assumptions=new RelativeValuationAssumptionBundle(input({ selectedMethod:method, selectedMultiple: method===RelativeValuationMethod.CUSTOM_MULTIPLE?7:undefined, outlierPolicy: method===RelativeValuationMethod.CUSTOM_MULTIPLE?'manual':'median', statisticalMethod: method===RelativeValuationMethod.CUSTOM_MULTIPLE?'manual':'median' })); const stats=new MultipleStatisticsEngine().calculate(assumptions); const result=new RelativeValuationFormulaEngine().execute(assumptions, stats.selectedMultiple); assert.equal(result.equityValue !== null || result.enterpriseValue !== null, true); } });

test('Relative valuation execution produces deterministic artifact without ranking/recommendations', () => { const adapter=new RelativeValuationExecutionAdapter(); const context=adapter.createContext({ valuationExecutionId:'VEXEC_1', valuationInputPackageId:'VINP_1', input:input() }); assert.equal(adapter.dryRun(context).validationResult.status,'Passed'); assert.equal(adapter.validate(context).validationResult.status,'Passed'); const result=adapter.calculate(context); assert.equal(result.selectedMultiple,10); assert.equal(result.enterpriseValue,1000); assert.equal(result.equityValue,970); assert.equal(result.perShareValue,97); assert.equal(JSON.stringify(result).toLowerCase().includes('recommendation'), false); });

test('Relative output envelope separates metadata, results and diagnostics', () => { const context=new RelativeValuationExecutionAdapter().createContext({ valuationExecutionId:'VEXEC_1', valuationInputPackageId:'VINP_1', input:input() }); const output=new RelativeValuationOutputNormalizer().normalize(new RelativeValuationExecutionAdapter().calculate(context)); assert.equal(output.metadata.formulaVersion, RELATIVE_VALUATION_FORMULA_VERSION); assert.equal(output.metadata.outlierPolicy, 'median'); assert.equal(output.results.perShareValue,97); assert.equal(output.diagnostics.peerStatisticsTrace.some(s=>s.step==='median'), true); assert.throws(()=>new RelativeValuationOutputNormalizer().validator.validate({ recommendation:'buy' })); });

test('Relative valuation audit, snapshot and replay reproduce artifact', () => { const { relativeValuationRuntime }=runtime(); const flow=relativeValuationRuntime.relativeValuationTestHarness.runFlow(input()); assert.match(flow.audit.relativeValuationActionId,/^RVALACT_/); assert.equal(flow.snapshot.relativeManifest.formulaVersion, RELATIVE_VALUATION_FORMULA_VERSION); assert.equal(flow.replay.perShareValue, flow.output.results.perShareValue); assert.equal(JSON.stringify(flow.snapshot).toLowerCase().includes('recommendation'), false); });

test('Relative permissions, diagnostics and projections are governed', () => { const registry=registerDefaultRelativeValuationPermissions(new RelativeValuationPermissionRegistry()); const gate=new RelativeValuationPermissionGate({ registry }); assert.equal(gate.require('runRelativeValuationCalculation'), true); assert.throws(()=>gate.require('missing')); assert.throws(()=>registry.register({ action:'recommendInvestment' })); const diagnostics=new RelativeValuationDiagnostics({ telemetry:new RelativeValuationTelemetry() }); diagnostics.record('relativeValuationExecutionsCompleted'); assert.equal(diagnostics.health().status,'Healthy'); assert.throws(()=>diagnostics.record('rankingsProduced')); const projections=new RelativeValuationProjectionRegistry().registerDefaults(); assert.equal(projections.update('relative.execution', { type:RelativeValuationPluginEventType.RelativeValuationExecutionCompleted, payload:{ relativeValuationExecutionId:'RVALEX_1' } }).lastEventType, RelativeValuationPluginEventType.RelativeValuationExecutionCompleted); });

test('Sprint 12 integrated flow executes relative valuation without peer selection or decision logic', () => { const { shellRuntime, relativeValuationRuntime }=runtime(); assert.equal(shellRuntime.shell.start('/').status,'mounted'); const flow=relativeValuationRuntime.relativeValuationTestHarness.runFlow(input()); relativeValuationRuntime.projectionRegistry.update('relative.execution', { type:RelativeValuationPluginEventType.RelativeValuationExecutionCompleted, payload:{ relativeValuationExecutionId:flow.result.relativeValuationExecutionId } }); relativeValuationRuntime.projectionRegistry.update('relative.artifact', { type:RelativeValuationPluginEventType.RelativeValuationResultCreated, payload:{ relativeValuationExecutionId:flow.result.relativeValuationExecutionId } }); assert.equal(flow.output.results.enterpriseValue,1000); assert.equal(flow.output.results.perShareValue,97); assert.equal(relativeValuationRuntime.relativeValuationTestHarness.assertNoForbiddenRelativeLogic(flow), true); const serialized=JSON.stringify(flow).toLowerCase(); for(const forbidden of ['peer selection','market data provider','ranking engine','buy recommendation','decision automation']) assert.equal(serialized.includes(forbidden), false); });
