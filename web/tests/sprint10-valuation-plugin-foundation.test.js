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
import {
  VALUATION_PLUGIN_FEATURE_FLAG,
  VALUATION_PLUGIN_API_VERSION,
  ValuationPluginEventType,
  ValuationPluginCommandType,
  ValuationPluginCapability,
  ValuationPluginLifecycleState,
  ValuationPluginCompatibilityStatus,
  validateValuationPluginCommand,
  createValuationPluginAuditIdentity,
  createPlaceholderValuationPluginManifest,
  ValuationPluginManifestValidator,
  ValuationPluginRegistry,
  ValuationPluginVersionRegistry,
  ValuationPluginLifecycleManager,
  ValuationPluginCompatibilityValidator,
  ValuationPluginLoader,
  ValuationPluginExecutionAdapter,
  ValuationPluginOutputNormalizerShell,
  ValuationPluginAuditTrail,
  ValuationPluginSnapshotAdapter,
  ValuationPluginReplayAdapter,
  ValuationPluginPermissionRegistry,
  ValuationPluginPermissionGate,
  registerDefaultPluginPermissions,
  ValuationPluginContributionRegistry,
  ValuationPluginProjectionRegistry,
  ValuationPluginDiagnostics,
  ValuationPluginTelemetry,
  createValuationPluginFoundation
} from '../src/valuation-plugins/index.js';

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
  return { app, shellRuntime, valuationRuntime, valuationPluginRuntime };
}

test('Valuation plugin contracts define plugin boundary and reject valuation behavior commands', () => {
  assert.equal(ValuationPluginEventType.ValuationPluginRegistered, 'ValuationPluginRegistered');
  assert.equal(ValuationPluginCommandType.RegisterValuationPlugin, 'RegisterValuationPlugin');
  assert.equal(ValuationPluginCapability.dryRun, 'dryRun');
  assert.equal(validateValuationPluginCommand(ValuationPluginCommandType.RunValuationPluginValidation), true);
  assert.throws(() => validateValuationPluginCommand('CalculateIntrinsicValue'));
  const audit=createValuationPluginAuditIdentity({ valuationPluginId:'VPLUG_1', valuationPluginVersion:'1.0.0', valuationExecutionId:'VEXEC_1', valuationInputPackageId:'VINP_1', userId:'u1', correlationId:'CORR_1' });
  assert.match(audit.valuationPluginActionId, /^VPACT_/);
});

test('Valuation plugin feature flag initializes', () => {
  const { app }=runtime();
  assert.equal(app.container.resolve('featureFlagRegistry').get(VALUATION_PLUGIN_FEATURE_FLAG).default_enabled, true);
});

test('Valuation plugin manifest validates API, capabilities, sandbox and signature metadata', () => {
  const manifest=createPlaceholderValuationPluginManifest();
  assert.equal(new ValuationPluginManifestValidator().validate(manifest), true);
  assert.equal(manifest.supportedPluginApiVersion, VALUATION_PLUGIN_API_VERSION);
  assert.equal(manifest.executionIsolation, 'in-process');
  assert.equal(manifest.capabilities.includes('snapshot'), true);
  assert.ok(manifest.pluginPublisher);
  assert.throws(() => new ValuationPluginManifestValidator().validate({ ...manifest, supportedPluginApiVersion: '' }));
  assert.throws(() => new ValuationPluginManifestValidator().validate({ ...manifest, outputContract: ['fairValue'] }));
  assert.throws(() => new ValuationPluginManifestValidator().validate({ ...manifest, pluginCategory: 'dcf' }));
});

test('Plugin registry and lifecycle enforce versions and transitions', () => {
  const manifest=createPlaceholderValuationPluginManifest();
  const registry=new ValuationPluginRegistry();
  registry.register(manifest);
  assert.throws(() => registry.register(manifest));
  const versions=new ValuationPluginVersionRegistry();
  assert.deepEqual(versions.add(manifest), ['1.0.0']);
  const lifecycle=new ValuationPluginLifecycleManager();
  lifecycle.discover(manifest.valuationPluginId);
  lifecycle.transition(manifest.valuationPluginId, ValuationPluginLifecycleState.Validated);
  lifecycle.transition(manifest.valuationPluginId, ValuationPluginLifecycleState.Registered);
  lifecycle.transition(manifest.valuationPluginId, ValuationPluginLifecycleState.Loaded);
  lifecycle.transition(manifest.valuationPluginId, ValuationPluginLifecycleState.Enabled);
  assert.equal(lifecycle.status(manifest.valuationPluginId).state, ValuationPluginLifecycleState.Enabled);
  lifecycle.transition(manifest.valuationPluginId, ValuationPluginLifecycleState.Retired);
  assert.throws(() => lifecycle.assertExecutable(manifest.valuationPluginId));
});

test('Plugin compatibility validation checks API and framework versions', () => {
  const manifest=createPlaceholderValuationPluginManifest();
  const validator=new ValuationPluginCompatibilityValidator();
  assert.equal(validator.validate(manifest).status, ValuationPluginCompatibilityStatus.Compatible);
  assert.equal(validator.validate({ ...manifest, supportedPluginApiVersion:'BAD' }).status, ValuationPluginCompatibilityStatus.Incompatible);
  assert.equal(validator.validate({ ...manifest, minimumValuationFrameworkVersion:'BAD' }).status, ValuationPluginCompatibilityStatus.Incompatible);
});

test('Plugin loading and execution adapters perform structural no-op execution', () => {
  const manifest=createPlaceholderValuationPluginManifest();
  const loader=new ValuationPluginLoader({ compatibilityValidator:new ValuationPluginCompatibilityValidator() });
  const handle=loader.load(manifest);
  assert.equal(handle.valuationPluginId, manifest.valuationPluginId);
  const adapter=new ValuationPluginExecutionAdapter();
  const context=adapter.createContext({ manifest, valuationExecutionId:'VEXEC_1', valuationInputPackageId:'VINP_1' });
  const dry=adapter.dryRun(context);
  const validation=adapter.validate(context);
  assert.equal(dry.dryRunResult.noOp, true);
  assert.equal(validation.validationResult.noOp, true);
  assert.equal(JSON.stringify({ dry, validation }).toLowerCase().includes('intrinsicvalue'), false);
});

test('Plugin output contract and normalizer reject valuation output fields', () => {
  const normalizer=new ValuationPluginOutputNormalizerShell();
  const out=normalizer.normalize({ dryRunResult:{ structural:true }, validationResult:{ structural:true }, auditResult:{ ok:true } });
  assert.equal(out.pluginExecutionStatus, 'Completed');
  assert.throws(() => normalizer.normalize({ fairValue: 100 }));
  assert.throws(() => normalizer.normalize({ unknownField: true }));
});

test('Plugin audit, snapshot and replay capture plugin state only', () => {
  const { valuationPluginRuntime }=runtime();
  const result=valuationPluginRuntime.pluginTestHarness.runFlow({ valuationExecutionId:'VEXEC_1', valuationInputPackageId:'VINP_1' });
  assert.match(result.audit.valuationPluginActionId, /^VPACT_/);
  assert.equal(result.snapshot.pluginManifest.pluginApiVersion, VALUATION_PLUGIN_API_VERSION);
  assert.equal(result.replay.pluginExecutionStatus, 'Completed');
  assert.equal(JSON.stringify(result).toLowerCase().includes('targetprice'), false);
});

test('Plugin permissions and diagnostics fail closed and reject investment permissions', () => {
  const { app }=runtime();
  const permissions=registerDefaultPluginPermissions(new ValuationPluginPermissionRegistry());
  const gate=new ValuationPluginPermissionGate({ registry:permissions });
  assert.equal(gate.require('runValuationPluginValidation'), true);
  assert.throws(() => gate.require('missingPermission'));
  assert.throws(() => permissions.register({ action:'calculateIntrinsicValue' }));
  const diagnostics=new ValuationPluginDiagnostics({ telemetry:new ValuationPluginTelemetry() });
  diagnostics.record('pluginsRegistered'); diagnostics.record('pluginValidationsExecuted');
  assert.equal(diagnostics.health().status, 'Healthy');
  assert.throws(() => diagnostics.record('valuationResultsProduced'));
  const contributions=new ValuationPluginContributionRegistry({ featureFlagRegistry:app.container.resolve('featureFlagRegistry'), permissionGate:gate });
  contributions.register({ contributionId:'run-plugin-validation', permission:'runValuationPluginValidation' });
  assert.equal(contributions.execute('run-plugin-validation').status, 'executed');
});

test('Plugin projections and contributions are structural and feature-gated', () => {
  const { app }=runtime();
  const projections=new ValuationPluginProjectionRegistry().registerDefaults();
  assert.equal(projections.update('valuationPlugin.execution', { type:ValuationPluginEventType.ValuationPluginValidationCompleted, payload:{ valuationExecutionId:'VEXEC_1' } }).lastEventType, ValuationPluginEventType.ValuationPluginValidationCompleted);
  assert.throws(() => projections.update('valuationPlugin.execution', { type:'FairValueCalculated', payload:{} }));
  const permissions=registerDefaultPluginPermissions(new ValuationPluginPermissionRegistry());
  const gate=new ValuationPluginPermissionGate({ registry:permissions });
  const contributions=new ValuationPluginContributionRegistry({ featureFlagRegistry:app.container.resolve('featureFlagRegistry'), permissionGate:gate });
  app.container.resolve('featureFlagRegistry').register({ flag_id:'disabled_plugin', default_enabled:false, owner:'test', status:'active' });
  contributions.register({ contributionId:'blocked-plugin', featureFlag:'disabled_plugin', permission:'viewValuationPlugin' });
  assert.equal(contributions.execute('blocked-plugin').status, 'blocked');
});

test('Sprint 10 integrated flow validates plugin boundary without valuation math', () => {
  const { shellRuntime, valuationRuntime, valuationPluginRuntime }=runtime();
  assert.equal(shellRuntime.shell.start('/').status, 'mounted');
  const pluginResult=valuationPluginRuntime.pluginTestHarness.runFlow({ valuationExecutionId:'VEXEC_INTEGRATION', valuationInputPackageId:'VINP_INTEGRATION' });
  valuationPluginRuntime.projectionRegistry.update('valuationPlugin.registry', { type:ValuationPluginEventType.ValuationPluginRegistered, payload:{ valuationPluginId:pluginResult.manifest.valuationPluginId } });
  valuationPluginRuntime.projectionRegistry.update('valuationPlugin.execution', { type:ValuationPluginEventType.ValuationPluginValidationCompleted, payload:{ valuationExecutionId:pluginResult.context.valuationExecutionId } });
  assert.equal(pluginResult.output.pluginExecutionStatus, 'Completed');
  assert.equal(valuationPluginRuntime.pluginTestHarness.assertNoForbiddenPluginLogic(pluginResult), true);
  const serialized=JSON.stringify(pluginResult).toLowerCase();
  for(const forbidden of ['discounted cash flow','intrinsic value','fair value','target price','margin of safety','buy recommendation','portfolio action']) assert.equal(serialized.includes(forbidden), false);
});
