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
import {
  VALUATION_FRAMEWORK_FEATURE_FLAG,
  VALUATION_FRAMEWORK_SCHEMA_VERSION,
  VALUATION_EXECUTION_ENVIRONMENT_VERSION,
  ValuationFrameworkEventType,
  ValuationFrameworkCommandType,
  ValuationCapability,
  validateValuationCommand,
  createValuationAuditIdentity,
  stableValuationFingerprint,
  createPlaceholderValuationManifest,
  ValuationModelRegistry,
  ValuationLifecycleManager,
  ValuationLifecycleState,
  ValuationConfigurationRegistry,
  CompanySecurityValuationInputAdapter,
  CertifiedEvidenceValuationInputAdapter,
  MethodologyValuationInputAdapter,
  ValuationInputPackageBuilder,
  ValuationInputSufficiencyChecker,
  ValuationExecutionRuntime,
  ValuationAuditTrail,
  ValuationPermissionRegistry,
  ValuationPermissionGate,
  registerDefaultValuationPermissions,
  ValuationContributionRegistry,
  ValuationProjectionRegistry,
  ValuationDiagnostics,
  ValuationTelemetry,
  createValuationFrameworkFoundation
} from '../src/valuation-framework/index.js';

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
  return { app, shellRuntime, evidenceRuntime, methodologyRuntime, companySecurityRuntime, valuationRuntime };
}

function domainFixture(rt){ return rt.domainTestHarness.runFlow(); }
function evidenceFixture(rt){ return rt.evidenceTestHarness.runFlow().certified; }
function methodologyFixture(rt){ return rt.methodologyTestHarness.runFlow().validation; }

test('Valuation contracts define framework shell and reject valuation output commands', () => {
  assert.equal(ValuationFrameworkEventType.ValuationValidationCompleted, 'ValuationValidationCompleted');
  assert.equal(ValuationFrameworkCommandType.RegisterValuationModel, 'RegisterValuationModel');
  assert.equal(ValuationCapability.inputPackaging, 'inputPackaging');
  assert.equal(validateValuationCommand(ValuationFrameworkCommandType.StartValuationDryRun), true);
  assert.throws(() => validateValuationCommand('CalculateIntrinsicValue'));
  const audit=createValuationAuditIdentity({ valuationModelId:'VAL_1', valuationModelVersion:'1.0.0', valuationExecutionId:'VEXEC_1', companyId:'CMP_1', securityId:'SEC_1', methodologyId:'MTH_1', methodologyVersion:'1.0.0', evidenceRecordIds:['EVID_1'], userId:'u1', correlationId:'CORR_1' });
  assert.match(audit.valuationActionId, /^VACT_/);
  assert.equal(stableValuationFingerprint({ valuationModelVersion:'1.0.0', configurationVersion:'1.0.0', companyId:'CMP_1', securityId:'SEC_1', methodologyVersion:'1.0.0', evidenceVersionIds:['EVIDV_1'] }), stableValuationFingerprint({ valuationModelVersion:'1.0.0', configurationVersion:'1.0.0', companyId:'CMP_1', securityId:'SEC_1', methodologyVersion:'1.0.0', evidenceVersionIds:['EVIDV_1'] }));
});

test('Valuation feature flag initializes', () => {
  const { app }=runtime();
  assert.equal(app.container.resolve('featureFlagRegistry').get(VALUATION_FRAMEWORK_FEATURE_FLAG).default_enabled, true);
});

test('Valuation model manifests validate schema, capabilities, plugin compatibility and guardrails', () => {
  const registry=new ValuationModelRegistry();
  const manifest=createPlaceholderValuationManifest();
  const registered=registry.register(manifest);
  assert.equal(registered.frameworkSchemaVersion, VALUATION_FRAMEWORK_SCHEMA_VERSION);
  assert.equal(registered.capabilities.includes('dryRun'), true);
  assert.deepEqual(registered.valuationExtensions, []);
  assert.equal(registered.supportedPluginApiVersion, '0.0-disabled');
  assert.throws(() => registry.register(manifest));
  assert.throws(() => registry.register(createPlaceholderValuationManifest({ valuationModelId:'VAL_BAD', outputContract:['fairValue'] })));
  assert.throws(() => registry.register(createPlaceholderValuationManifest({ valuationModelId:'VAL_EXT', valuationExtensions:['dcfPlugin'] })));
  registry.update(manifest.valuationModelId, manifest.valuationModelVersion, { description:'draft update' });
  registry.activate(manifest.valuationModelId, manifest.valuationModelVersion);
  assert.throws(() => registry.update(manifest.valuationModelId, manifest.valuationModelVersion, { description:'no' }));
});

test('Valuation lifecycle and configuration are versioned and reject formula fields', () => {
  const lifecycle=new ValuationLifecycleManager();
  lifecycle.initialize('VAL_LIFE');
  lifecycle.transition('VAL_LIFE', ValuationLifecycleState.Registered);
  lifecycle.transition('VAL_LIFE', ValuationLifecycleState.Validated);
  lifecycle.transition('VAL_LIFE', ValuationLifecycleState.Active);
  assert.equal(lifecycle.assertExecutable('VAL_LIFE'), true);
  lifecycle.transition('VAL_LIFE', ValuationLifecycleState.Retired);
  assert.throws(() => lifecycle.assertExecutable('VAL_LIFE'));
  const configs=new ValuationConfigurationRegistry();
  const c=configs.register({ valuationModelId:'VAL_1', valuationModelVersion:'1.0.0', configurationVersion:'1.0.0', values:{ enabled:true }, schema:{ required:['enabled'] } });
  assert.match(c.valuationConfigurationId, /^VCFG_/);
  assert.throws(() => configs.register({ valuationModelId:'VAL_1', valuationModelVersion:'1.0.0', configurationVersion:'1.0.0' }));
  assert.throws(() => configs.register({ valuationModelId:'VAL_2', valuationModelVersion:'1.0.0', values:{ wacc:0.1 } }));
});

test('Valuation input package accepts canonical domain, certified evidence and methodology outputs only', () => {
  const { companySecurityRuntime, evidenceRuntime, methodologyRuntime }=runtime();
  const domain=domainFixture(companySecurityRuntime);
  const evidence=evidenceFixture(evidenceRuntime);
  const method=methodologyFixture(methodologyRuntime);
  const companySecurityInput=new CompanySecurityValuationInputAdapter().adapt({ company:domain.company, security:domain.security });
  const evidenceInput=new CertifiedEvidenceValuationInputAdapter().adapt(evidence);
  const methodologyInput=new MethodologyValuationInputAdapter().adapt(method);
  const pkg=new ValuationInputPackageBuilder().build({ companySecurityInput, evidenceInputs:[evidenceInput], methodologyInput, configurationVersion:'1.0.0' });
  assert.match(pkg.valuationInputPackageId, /^VINP_/);
  assert.equal(new ValuationInputSufficiencyChecker().check(pkg).passed, true);
  assert.throws(() => new CertifiedEvidenceValuationInputAdapter().adapt({ ...evidence, certificationStatus:'Draft' }));
  assert.throws(() => new CertifiedEvidenceValuationInputAdapter().rejectRawResearchArtifact());
  assert.throws(() => new MethodologyValuationInputAdapter().adapt({ methodologyId:'MTH_1' }));
});

test('Valuation execution dry-runs and validates without valuation outputs', () => {
  const { companySecurityRuntime, evidenceRuntime, methodologyRuntime }=runtime();
  const domain=domainFixture(companySecurityRuntime);
  const evidence=evidenceFixture(evidenceRuntime);
  const method=methodologyFixture(methodologyRuntime);
  const lifecycle=new ValuationLifecycleManager();
  lifecycle.initialize('VAL_EXEC'); lifecycle.transition('VAL_EXEC','Registered'); lifecycle.transition('VAL_EXEC','Validated'); lifecycle.transition('VAL_EXEC','Active');
  const companySecurityInput=new CompanySecurityValuationInputAdapter().adapt({ company:domain.company, security:domain.security });
  const evidenceInput=new CertifiedEvidenceValuationInputAdapter().adapt(evidence);
  const methodologyInput=new MethodologyValuationInputAdapter().adapt(method);
  const inputPackage=new ValuationInputPackageBuilder().build({ companySecurityInput, evidenceInputs:[evidenceInput], methodologyInput, configurationVersion:'1.0.0' });
  const runtimeExec=new ValuationExecutionRuntime({ lifecycleManager:lifecycle, sufficiencyChecker:new ValuationInputSufficiencyChecker() });
  const context=runtimeExec.createContext({ valuationModelId:'VAL_EXEC', valuationModelVersion:'1.0.0', inputPackage });
  assert.equal(context.valuationExecutionEnvironmentVersion, VALUATION_EXECUTION_ENVIRONMENT_VERSION);
  const dry=runtimeExec.dryRun(context);
  const validation=runtimeExec.validate(context);
  assert.match(validation.executionFingerprint, /^VFPR_/);
  assert.equal(validation.sufficiencyResult.passed, true);
  assert.equal(JSON.stringify({ dry, validation }).toLowerCase().includes('fairvalue'), false);
});

test('Valuation audit, snapshot, and replay capture framework governance state only', () => {
  const { valuationRuntime, companySecurityRuntime, evidenceRuntime, methodologyRuntime }=runtime();
  const domain=domainFixture(companySecurityRuntime);
  const result=valuationRuntime.valuationTestHarness.runFlow({ company:domain.company, security:domain.security, evidence:evidenceFixture(evidenceRuntime), methodologyResult:methodologyFixture(methodologyRuntime) });
  assert.match(result.audit.valuationActionId, /^VACT_/);
  assert.equal(result.snapshot.valuationManifest.snapshotSchemaVersion, VALUATION_FRAMEWORK_SCHEMA_VERSION);
  assert.equal(result.snapshot.valuationManifest.valuationExecutionEnvironmentVersion, VALUATION_EXECUTION_ENVIRONMENT_VERSION);
  assert.equal(result.replay.executionFingerprint, result.validation.executionFingerprint);
  assert.equal(JSON.stringify(result.snapshot).toLowerCase().includes('targetprice'), false);
});

test('Valuation permissions and contributions fail closed and reject investment permissions', () => {
  const { app }=runtime();
  const permissions=registerDefaultValuationPermissions(new ValuationPermissionRegistry());
  const gate=new ValuationPermissionGate({ registry:permissions });
  assert.equal(gate.require('runValuationValidation'), true);
  assert.throws(() => gate.require('missingPermission'));
  assert.throws(() => permissions.register({ action:'calculateIntrinsicValue' }));
  const contributions=new ValuationContributionRegistry({ featureFlagRegistry:app.container.resolve('featureFlagRegistry'), permissionGate:gate });
  contributions.register({ contributionId:'run-valuation-validation', permission:'runValuationValidation' });
  assert.equal(contributions.execute('run-valuation-validation').status, 'executed');
  app.container.resolve('featureFlagRegistry').register({ flag_id:'disabled_valuation', default_enabled:false, owner:'test', status:'active' });
  contributions.register({ contributionId:'blocked-valuation', featureFlag:'disabled_valuation', permission:'viewValuationFramework' });
  assert.equal(contributions.execute('blocked-valuation').status, 'blocked');
});

test('Valuation projections and diagnostics are operational read models only', () => {
  const projections=new ValuationProjectionRegistry().registerDefaults();
  const state=projections.update('valuation.execution', { type:ValuationFrameworkEventType.ValuationValidationCompleted, payload:{ valuationExecutionId:'VEXEC_1' } });
  assert.equal(state.lastEventType, ValuationFrameworkEventType.ValuationValidationCompleted);
  const snapshot=projections.get('valuation.execution').snapshot();
  assert.equal(snapshot.definition.snapshotCompatible, true);
  assert.throws(() => { snapshot.state.lastEventType='mutated'; });
  assert.throws(() => projections.update('valuation.execution', { type:'FairValueCalculated', payload:{} }));
  const diagnostics=new ValuationDiagnostics({ telemetry:new ValuationTelemetry() });
  diagnostics.record('valuationModelsRegistered'); diagnostics.record('validationsExecuted');
  assert.equal(diagnostics.health().status, 'Healthy');
  assert.throws(() => diagnostics.record('investmentReturns'));
});

test('Sprint 9 integrated flow governs valuation framework without valuation outputs', () => {
  const { shellRuntime, valuationRuntime, companySecurityRuntime, evidenceRuntime, methodologyRuntime }=runtime();
  assert.equal(shellRuntime.shell.start('/').status, 'mounted');
  const domain=domainFixture(companySecurityRuntime);
  const evidence=evidenceFixture(evidenceRuntime);
  const method=methodologyFixture(methodologyRuntime);
  const result=valuationRuntime.valuationTestHarness.runFlow({ company:domain.company, security:domain.security, evidence, methodologyResult:method });
  valuationRuntime.projectionRegistry.update('valuation.model', { type:ValuationFrameworkEventType.ValuationModelRegistered, payload:{ valuationModelId:result.manifest.valuationModelId } });
  valuationRuntime.projectionRegistry.update('valuation.execution', { type:ValuationFrameworkEventType.ValuationValidationCompleted, payload:{ valuationExecutionId:result.context.valuationExecutionId } });
  assert.equal(result.validation.sufficiencyResult.passed, true);
  assert.match(result.validation.executionFingerprint, /^VFPR_/);
  assert.equal(valuationRuntime.valuationTestHarness.assertNoForbiddenValuationLogic(result), true);
  const serialized=JSON.stringify(result).toLowerCase();
  for(const forbidden of ['discounted cash flow','intrinsic value','fair value','target price','margin of safety','buy recommendation','portfolio action']) assert.equal(serialized.includes(forbidden), false);
});
