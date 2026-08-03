import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/bootstrap/createApp.js';
import { createApplicationShell } from '../src/shell/index.js';
import { createWorkflowPlatform } from '../src/workflow/index.js';
import { createProductModuleFramework } from '../src/product/index.js';
import { createResearchModuleFoundation } from '../src/product-modules/research/index.js';
import { createResearchIntelligenceFoundation } from '../src/product-modules/research-intelligence/index.js';
import { createEvidenceGovernanceFoundation } from '../src/evidence/index.js';
import {
  METHODOLOGY_FRAMEWORK_FEATURE_FLAG,
  METHODOLOGY_EXECUTION_ENVIRONMENT_VERSION,
  MethodologyFrameworkEventType,
  MethodologyFrameworkCommandType,
  MethodologyLifecycleState,
  MethodologyCapability,
  validateMethodologyCommand,
  createMethodologyAuditIdentity,
  stableMethodologyFingerprint,
  createPlaceholderMethodologyManifest,
  MethodologyDefinitionRegistry,
  MethodologyVersionRegistry,
  MethodologyFrameworkRegistryAdapter,
  MethodologyLifecycleManager,
  MethodologyConfigurationRegistry,
  EvidenceRequirementEngine,
  EvidenceSufficiencyChecker,
  CertifiedEvidenceInputAdapter,
  MethodologyExecutionRuntime,
  MethodologyAuditTrail,
  MethodologySnapshotAdapter,
  MethodologyReplayAdapter,
  MethodologyPermissionRegistry,
  MethodologyPermissionGate,
  registerDefaultMethodologyPermissions,
  MethodologyContributionRegistry,
  MethodologyProjectionRegistry,
  MethodologyDiagnostics,
  MethodologyTelemetry,
  createMethodologyFrameworkFoundation
} from '../src/methodology-framework/index.js';

function runtime() {
  const app = createApp({ env: { NODE_ENV: 'test' } });
  const shellRuntime = createApplicationShell({ app });
  const workflowRuntime = createWorkflowPlatform({ app, shellRuntime });
  const productRuntime = createProductModuleFramework({ app, workflowRuntime });
  const researchRuntime = createResearchModuleFoundation({ app, productRuntime, workflowRuntime });
  const researchIntelligenceRuntime = createResearchIntelligenceFoundation({ app, researchRuntime });
  const evidenceRuntime = createEvidenceGovernanceFoundation({ app, researchIntelligenceRuntime });
  const methodologyRuntime = createMethodologyFrameworkFoundation({ app, evidenceRuntime });
  return { app, shellRuntime, workflowRuntime, productRuntime, researchRuntime, researchIntelligenceRuntime, evidenceRuntime, methodologyRuntime };
}
const certifiedEvidence = Object.freeze({ evidenceRecordId: 'EVID_1', evidenceVersionId: 'EVIDV_1', evidenceType: 'research-source', sourceType: 'evidence-candidate', certificationStatus: 'Certified' });

test('Methodology contracts define governance shell and reject analytical commands', () => {
  assert.equal(MethodologyFrameworkEventType.MethodologyValidationCompleted, 'MethodologyValidationCompleted');
  assert.equal(MethodologyFrameworkCommandType.RegisterMethodologyDefinition, 'RegisterMethodologyDefinition');
  assert.equal(MethodologyCapability.validation, 'validation');
  assert.equal(validateMethodologyCommand(MethodologyFrameworkCommandType.StartMethodologyDryRun), true);
  assert.throws(() => validateMethodologyCommand('CalculateValuation'));
  const audit = createMethodologyAuditIdentity({ methodologyId: 'MTH_1', methodologyVersion: '1.0.0', executionId: 'MEXEC_1', evidenceRecordIds: ['EVID_1'], userId: 'u1', correlationId: 'CORR_1' });
  assert.match(audit.methodologyActionId, /^MACT_/);
  assert.equal(stableMethodologyFingerprint({ methodologyVersion: '1.0.0', configurationVersion: '1.0.0', evidenceVersionIds: ['EVIDV_1'] }), stableMethodologyFingerprint({ methodologyVersion: '1.0.0', configurationVersion: '1.0.0', evidenceVersionIds: ['EVIDV_1'] }));
});

test('Methodology feature flag initializes', () => {
  const { app } = runtime();
  assert.equal(app.container.resolve('featureFlagRegistry').get(METHODOLOGY_FRAMEWORK_FEATURE_FLAG).default_enabled, true);
});

test('Methodology definitions validate versions, capabilities, extension point, and output contract', () => {
  const registry = new MethodologyDefinitionRegistry();
  const manifest = createPlaceholderMethodologyManifest();
  const registered = registry.register(manifest);
  assert.equal(registered.capabilities.includes('validation'), true);
  assert.deepEqual(registered.analysisExtensions, []);
  assert.throws(() => registry.register(manifest));
  assert.throws(() => registry.register(createPlaceholderMethodologyManifest({ methodologyId: 'MTH_BAD', outputContract: ['valuationResult'] })));
  assert.throws(() => registry.register(createPlaceholderMethodologyManifest({ methodologyId: 'MTH_BAD2', analysisExtensions: ['valuationPlugin'] })));
  registry.update(manifest.methodologyId, manifest.methodologyVersion, { description: 'Updated while draft' });
  registry.activate(manifest.methodologyId, manifest.methodologyVersion);
  assert.throws(() => registry.update(manifest.methodologyId, manifest.methodologyVersion, { description: 'Cannot update active' }));
});

test('Methodology registry integration syncs to Sprint -1 MethodologyRegistry and rejects formulas', () => {
  const { app } = runtime();
  const adapter = new MethodologyFrameworkRegistryAdapter({ methodologyRegistry: app.container.resolve('methodologyRegistry') });
  const manifest = createPlaceholderMethodologyManifest({ methodologyId: 'MTH_SYNC' });
  const synced = adapter.sync(manifest);
  assert.equal(synced.methodology_id, 'MTH_SYNC');
  assert.equal(app.container.resolve('methodologyRegistry').get('MTH_SYNC', '1.0.0').version, '1.0.0');
  assert.throws(() => adapter.sync(createPlaceholderMethodologyManifest({ methodologyId: 'MTH_FORMULA', validationRules: ['valuation formula'] })));
});

test('Methodology lifecycle enforces valid transitions and retired execution blocking', () => {
  const lm = new MethodologyLifecycleManager();
  lm.initialize('MTH_LIFE');
  lm.transition('MTH_LIFE', MethodologyLifecycleState.Registered);
  lm.transition('MTH_LIFE', MethodologyLifecycleState.Validated);
  lm.transition('MTH_LIFE', MethodologyLifecycleState.Active);
  assert.equal(lm.assertExecutable('MTH_LIFE'), true);
  lm.transition('MTH_LIFE', MethodologyLifecycleState.Retired);
  assert.throws(() => lm.assertExecutable('MTH_LIFE'));
  lm.initialize('MTH_BAD');
  assert.throws(() => lm.transition('MTH_BAD', MethodologyLifecycleState.Active));
});

test('Methodology configuration is versioned, scoped, schema-validated, and rejects analytical formulas', () => {
  const registry = new MethodologyConfigurationRegistry();
  const config = registry.register({ methodologyId: 'MTH_1', methodologyVersion: '1.0.0', configurationVersion: '1.0.0', scope: 'global', values: { requiredEvidence: true }, schema: { required: ['requiredEvidence'] } });
  assert.match(config.configurationId, /^MCFG_/);
  assert.throws(() => registry.register({ methodologyId: 'MTH_1', methodologyVersion: '1.0.0', configurationVersion: '1.0.0', scope: 'global', values: { requiredEvidence: true } }));
  assert.throws(() => registry.register({ methodologyId: 'MTH_2', methodologyVersion: '1.0.0', configurationVersion: '1.0.0', scope: 'global', values: {}, schema: { required: ['requiredEvidence'] } }));
  assert.throws(() => registry.register({ methodologyId: 'MTH_3', methodologyVersion: '1.0.0', configurationVersion: '1.0.0', scope: 'global', values: { formula: 'valuation' } }));
});

test('Evidence input contracts accept certified evidence and reject uncertified/raw artifacts', () => {
  const engine = new EvidenceRequirementEngine();
  const req = engine.declare({ requirementId: 'REQ_1', methodologyId: 'MTH_1', methodologyVersion: '1.0.0', evidenceType: 'research-source', minCount: 1 });
  const adapter = new CertifiedEvidenceInputAdapter();
  const input = adapter.adapt(certifiedEvidence);
  assert.equal(input.inputType, 'certified-evidence');
  assert.throws(() => adapter.adapt({ ...certifiedEvidence, certificationStatus: 'Draft' }));
  assert.throws(() => adapter.rejectRawResearchArtifact());
  assert.equal(new EvidenceSufficiencyChecker().check({ requirements: [req], evidenceInputs: [input] }).passed, true);
  assert.equal(new EvidenceSufficiencyChecker().check({ requirements: [req], evidenceInputs: [] }).passed, false);
});

test('Methodology execution runtime dry-runs and validates without analytical outputs', () => {
  const lm = new MethodologyLifecycleManager();
  lm.initialize('MTH_EXEC');
  lm.transition('MTH_EXEC', MethodologyLifecycleState.Registered);
  lm.transition('MTH_EXEC', MethodologyLifecycleState.Validated);
  lm.transition('MTH_EXEC', MethodologyLifecycleState.Active);
  const input = new CertifiedEvidenceInputAdapter().adapt(certifiedEvidence);
  const runtime = new MethodologyExecutionRuntime({ lifecycleManager: lm, sufficiencyChecker: new EvidenceSufficiencyChecker() });
  const context = runtime.createContext({ methodologyId: 'MTH_EXEC', methodologyVersion: '1.0.0', configurationVersion: '1.0.0', evidenceInputs: [input] });
  assert.equal(context.executionEnvironmentVersion, METHODOLOGY_EXECUTION_ENVIRONMENT_VERSION);
  const dry = runtime.dryRun(context);
  assert.match(dry.executionFingerprint, /^MFPR_/);
  const validation = runtime.validate(context, [new EvidenceRequirementEngine().declare({ requirementId: 'REQ_1', methodologyId: 'MTH_EXEC', methodologyVersion: '1.0.0', evidenceType: 'research-source' })]);
  assert.equal(validation.sufficiencyResult.passed, true);
  assert.equal(JSON.stringify(validation).toLowerCase().includes('intrinsicvalue'), false);
});

test('Methodology audit, snapshot, and replay capture governance state only', () => {
  const { methodologyRuntime } = runtime();
  const result = methodologyRuntime.methodologyTestHarness.runFlow();
  assert.match(result.audit.methodologyActionId, /^MACT_/);
  assert.equal(result.snapshot.methodologyManifest.snapshotSchemaVersion, 'METHODOLOGY_SNAPSHOT_1.0');
  assert.equal(result.snapshot.methodologyManifest.executionEnvironmentVersion, METHODOLOGY_EXECUTION_ENVIRONMENT_VERSION);
  assert.equal(result.replay.executionFingerprint, result.validation.executionFingerprint);
  assert.equal(JSON.stringify(result.snapshot).toLowerCase().includes('targetprice'), false);
});

test('Methodology permissions and contributions fail closed and reject investment permissions', () => {
  const { app } = runtime();
  const permissions = registerDefaultMethodologyPermissions(new MethodologyPermissionRegistry());
  const gate = new MethodologyPermissionGate({ registry: permissions });
  assert.equal(gate.require('runMethodologyValidation'), true);
  assert.throws(() => gate.require('missingPermission'));
  assert.throws(() => permissions.register({ action: 'calculateValuation' }));
  const contributions = new MethodologyContributionRegistry({ featureFlagRegistry: app.container.resolve('featureFlagRegistry'), permissionGate: gate });
  contributions.register({ contributionId: 'run-methodology-validation', permission: 'runMethodologyValidation' });
  assert.equal(contributions.execute('run-methodology-validation').status, 'executed');
  app.container.resolve('featureFlagRegistry').register({ flag_id: 'disabled_methodology', default_enabled: false, owner: 'test', status: 'active' });
  contributions.register({ contributionId: 'blocked-methodology', featureFlag: 'disabled_methodology', permission: 'viewMethodology' });
  assert.equal(contributions.execute('blocked-methodology').status, 'blocked');
});

test('Methodology projections and diagnostics are operational read models only', () => {
  const projections = new MethodologyProjectionRegistry().registerDefaults();
  const state = projections.update('methodology.execution', { type: MethodologyFrameworkEventType.MethodologyValidationCompleted, payload: { executionId: 'MEXEC_1' } });
  assert.equal(state.lastEventType, MethodologyFrameworkEventType.MethodologyValidationCompleted);
  const snapshot = projections.get('methodology.execution').snapshot();
  assert.equal(snapshot.definition.snapshotCompatible, true);
  assert.throws(() => { snapshot.state.lastEventType = 'mutated'; });
  assert.throws(() => projections.update('methodology.execution', { type: 'ValuationCalculated', payload: {} }));
  const diagnostics = new MethodologyDiagnostics({ telemetry: new MethodologyTelemetry() });
  diagnostics.record('methodologiesRegistered');
  diagnostics.record('validationsExecuted');
  assert.equal(diagnostics.health().status, 'Healthy');
  assert.throws(() => diagnostics.record('investmentReturns'));
});

test('Sprint 7 integrated flow consumes certified evidence without investment analysis', () => {
  const { shellRuntime, evidenceRuntime, methodologyRuntime } = runtime();
  assert.equal(shellRuntime.shell.start('/').status, 'mounted');
  const evidenceFlow = evidenceRuntime.evidenceTestHarness.runFlow();
  const result = methodologyRuntime.methodologyTestHarness.runFlow();
  methodologyRuntime.projectionRegistry.update('methodology.registry', { type: MethodologyFrameworkEventType.MethodologyDefinitionRegistered, payload: { methodologyId: result.manifest.methodologyId } });
  methodologyRuntime.projectionRegistry.update('methodology.execution', { type: MethodologyFrameworkEventType.MethodologyValidationCompleted, payload: { executionId: result.context.executionId } });
  assert.equal(evidenceFlow.certified.certificationStatus, 'Certified');
  assert.equal(result.validation.sufficiencyResult.passed, true);
  assert.match(result.validation.executionFingerprint, /^MFPR_/);
  assert.equal(methodologyRuntime.methodologyTestHarness.assertNoForbiddenMethodologyLogic(result), true);
  const serialized = JSON.stringify(result).toLowerCase();
  for (const forbidden of ['discounted cash flow','stock scoring','buy recommendation','target price','portfolio action','decision automation']) assert.equal(serialized.includes(forbidden), false);
});
