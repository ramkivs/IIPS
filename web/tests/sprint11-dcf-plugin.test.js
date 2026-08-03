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
  DCF_PLUGIN_ID,
  DCF_FORMULA_VERSION,
  DCFPluginEventType,
  DCFPluginCommandType,
  TerminalValueAssumptionType,
  DCFErrorCode,
  validateDCFCommand,
  createDCFAuditIdentity,
  createDCFPluginManifest,
  DCFPluginManifestValidator,
  DCFInputValidator,
  DCFAssumptionSet,
  DCFFormulaEngine,
  PresentValueCalculator,
  TerminalValueCalculator,
  DCFExecutionAdapter,
  DCFOutputNormalizer,
  DCFPermissionRegistry,
  DCFPermissionGate,
  registerDefaultDCFPermissions,
  DCFDiagnostics,
  DCFTelemetry,
  DCFProjectionRegistry,
  createDCFPlugin
} from '../src/valuation-plugins/dcf/index.js';

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
  return { app, shellRuntime, valuationRuntime, dcfRuntime };
}
function input(overrides={}){ return { valuationInputPackageId:'VINP_DCF', companyId:'CMP_DCF', securityId:'SEC_DCF', currency:'INR', forecastCashFlows:[{ period:1, cashFlow:100, currency:'INR', periodEndDate:'2027-03-31' }, { period:2, cashFlow:110, currency:'INR', periodEndDate:'2028-03-31' }], discountRate:0.10, terminalValueAssumption:{ type:TerminalValueAssumptionType.explicitTerminalValue, terminalValue:1000 }, netDebt:50, minorityInterest:0, investmentsAndCash:20, dilutedSharesOutstanding:10, assumptionsVersion:'DCF_ASSUMPTIONS_1.0', ...overrides }; }

test('DCF contracts define commands, formula version, and audit identity', () => {
  assert.equal(DCFPluginEventType.DCFExecutionCompleted, 'DCFExecutionCompleted');
  assert.equal(DCFPluginCommandType.StartDCFExecution, 'StartDCFExecution');
  assert.equal(DCF_FORMULA_VERSION, 'DCF_FORMULA_VERSION_1.0');
  assert.equal(validateDCFCommand(DCFPluginCommandType.ValidateDCFInputs), true);
  assert.throws(() => validateDCFCommand('RecommendInvestment'));
  const audit=createDCFAuditIdentity({ dcfPluginVersion:'1.0.0', valuationExecutionId:'VEXEC_1', valuationInputPackageId:'VINP_1', companyId:'CMP_1', securityId:'SEC_1', correlationId:'CORR_1' });
  assert.match(audit.dcfActionId, /^DCFACT_/);
});

test('DCF manifest validates through valuation plugin boundary', () => {
  const manifest=createDCFPluginManifest();
  assert.equal(manifest.valuationPluginId, DCF_PLUGIN_ID);
  assert.equal(new DCFPluginManifestValidator().validate(manifest), true);
  assert.throws(() => new DCFPluginManifestValidator().validate({ ...manifest, outputContract:['recommendation'] }));
});

test('DCF inputs validate assumptions and structured errors', () => {
  assert.equal(new DCFInputValidator().validate(input()).status, 'Passed');
  assert.equal(new DCFAssumptionSet(input()).discountRate, 0.10);
  const missing=new DCFInputValidator().validate(input({ forecastCashFlows:[] }));
  assert.equal(missing.errors[0].code, DCFErrorCode.MISSING_ASSUMPTION);
  assert.equal(new DCFInputValidator().validate(input({ discountRate:-1 })).errors[0].code, DCFErrorCode.INVALID_DISCOUNT_RATE);
  assert.equal(new DCFInputValidator().validate(input({ terminalValueAssumption:{ type:TerminalValueAssumptionType.perpetualGrowth, terminalGrowthRate:0.2 } })).errors[0].code, DCFErrorCode.INVALID_TERMINAL_GROWTH);
  assert.equal(new DCFInputValidator().validate(input({ dilutedSharesOutstanding:-1 })).errors[0].code, DCFErrorCode.NEGATIVE_SHARE_COUNT);
  assert.equal(new DCFInputValidator().validate(input({ terminalValueAssumption:{ type:'bad' } })).errors[0].code, DCFErrorCode.UNSUPPORTED_TERMINAL_VALUE_ASSUMPTION);
  assert.equal(new DCFInputValidator().validate(input({ marketData:{ price:1 } })).status, 'Failed');
});

test('DCF formula engine calculates present values, terminal value, EV, equity value and per-share value', () => {
  const pv=new PresentValueCalculator();
  assert.equal(Math.round(pv.presentValue(110,0.10,1)), 100);
  const tv=new TerminalValueCalculator().calculate(new DCFAssumptionSet(input()));
  assert.equal(tv, 1000);
  const result=new DCFFormulaEngine().execute(new DCFAssumptionSet(input()));
  assert.equal(Math.round(result.enterpriseValue), 1008);
  assert.equal(Math.round(result.equityValue), 978);
  assert.equal(Math.round(result.perShareValue), 98);
  assert.equal(result.formulaTrace.some(s => s.step === 'terminal-value'), true);
});

test('DCF formula supports perpetual growth terminal value input', () => {
  const result=new DCFFormulaEngine().execute(new DCFAssumptionSet(input({ terminalValueAssumption:{ type:TerminalValueAssumptionType.perpetualGrowth, terminalGrowthRate:0.03 } })));
  assert.equal(result.enterpriseValue > 0, true);
});

test('DCF execution adapter creates valuation artifact without decisions', () => {
  const adapter=new DCFExecutionAdapter();
  const context=adapter.createContext({ valuationExecutionId:'VEXEC_1', valuationInputPackageId:'VINP_1', input:input() });
  assert.equal(adapter.dryRun(context).validationResult.status, 'Passed');
  assert.equal(adapter.validate(context).validationResult.status, 'Passed');
  const result=adapter.calculate(context);
  assert.match(result.dcfExecutionId, /^DCFEX_/);
  assert.equal(result.dcfFormulaVersion, DCF_FORMULA_VERSION);
  assert.equal(JSON.stringify(result).toLowerCase().includes('recommendation'), false);
});

test('DCF output envelope separates metadata, results and diagnostics', () => {
  const context=new DCFExecutionAdapter().createContext({ valuationExecutionId:'VEXEC_1', valuationInputPackageId:'VINP_1', input:input() });
  const output=new DCFOutputNormalizer().normalize(new DCFExecutionAdapter().calculate(context));
  assert.equal(output.metadata.formulaVersion, DCF_FORMULA_VERSION);
  assert.equal(output.results.currency, 'INR');
  assert.equal(Array.isArray(output.diagnostics.calculationTrace), true);
  assert.throws(() => new DCFOutputNormalizer().validator.validate({ recommendation:'buy' }));
});

test('DCF audit, snapshot and replay reproduce valuation artifact', () => {
  const { dcfRuntime }=runtime();
  const flow=dcfRuntime.dcfTestHarness.runFlow(input());
  assert.match(flow.audit.dcfActionId, /^DCFACT_/);
  assert.equal(flow.snapshot.dcfManifest.dcfFormulaVersion, DCF_FORMULA_VERSION);
  assert.equal(Math.round(flow.replay.enterpriseValue), Math.round(flow.output.results.enterpriseValue));
  assert.equal(JSON.stringify(flow.snapshot).toLowerCase().includes('recommendation'), false);
});

test('DCF permissions, diagnostics and projections are governed', () => {
  const registry=registerDefaultDCFPermissions(new DCFPermissionRegistry());
  const gate=new DCFPermissionGate({ registry });
  assert.equal(gate.require('runDCFCalculation'), true);
  assert.throws(() => gate.require('missing'));
  assert.throws(() => registry.register({ action:'recommendInvestment' }));
  const diagnostics=new DCFDiagnostics({ telemetry:new DCFTelemetry() });
  diagnostics.record('dcfExecutionsCompleted');
  assert.equal(diagnostics.health().status, 'Healthy');
  assert.throws(() => diagnostics.record('recommendationsProduced'));
  const projections=new DCFProjectionRegistry().registerDefaults();
  assert.equal(projections.update('dcf.execution', { type:DCFPluginEventType.DCFExecutionCompleted, payload:{ dcfExecutionId:'DCFEX_1' } }).lastEventType, DCFPluginEventType.DCFExecutionCompleted);
});

test('Sprint 11 integrated flow executes governed DCF without recommendation logic', () => {
  const { shellRuntime, dcfRuntime }=runtime();
  assert.equal(shellRuntime.shell.start('/').status, 'mounted');
  const flow=dcfRuntime.dcfTestHarness.runFlow(input());
  dcfRuntime.projectionRegistry.update('dcf.execution', { type:DCFPluginEventType.DCFExecutionCompleted, payload:{ dcfExecutionId:flow.result.dcfExecutionId } });
  dcfRuntime.projectionRegistry.update('dcf.artifact', { type:DCFPluginEventType.DCFValuationResultCreated, payload:{ dcfExecutionId:flow.result.dcfExecutionId } });
  assert.equal(flow.output.results.enterpriseValue > 0, true);
  assert.equal(flow.output.results.perShareValue > 0, true);
  assert.equal(dcfRuntime.dcfTestHarness.assertNoForbiddenDCFLogic(flow), true);
  const serialized=JSON.stringify(flow).toLowerCase();
  for(const forbidden of ['buy recommendation','assign rating','portfolio action','decision automation','market data provider']) assert.equal(serialized.includes(forbidden), false);
});
