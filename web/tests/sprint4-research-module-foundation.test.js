import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/bootstrap/createApp.js';
import { createApplicationShell } from '../src/shell/index.js';
import { createWorkflowPlatform } from '../src/workflow/index.js';
import { createProductModuleFramework } from '../src/product/index.js';
import {
  ResearchEventType,
  ResearchCommandType,
  ResearchPermissionAction,
  ResearchArtifactType,
  ResearchDocumentType,
  ResearchLifecycleState,
  validateResearchCommand,
  validateSubject,
  createResearchActivityEvent,
  createResearchModuleManifest,
  ResearchManifestValidator,
  ResearchModuleRegistration,
  RESEARCH_MODULE_ID,
  RESEARCH_FEATURE_FLAG,
  ResearchWorkspace,
  ResearchWorkflowAdapter,
  createResearchWorkflowBinding,
  ResearchWorkflowContextAdapter,
  ResearchContextProjector,
  ResearchDocumentRegistry,
  ResearchDocumentSection,
  ResearchArtifactRegistry,
  ResearchSourceReference,
  registerResearchPermissions,
  validateResearchPermission,
  registerResearchContributions,
  ResearchProjectionRegistry,
  ResearchDocumentProjection,
  ResearchArtifactProjection,
  ResearchDiagnostics,
  ResearchTelemetry,
  ResearchIntegrationHarness,
  createResearchModuleFoundation
} from '../src/product-modules/research/index.js';
import { ProductLifecycleState } from '../src/product/index.js';

function runtime() {
  const app = createApp({ env: { NODE_ENV: 'test' } });
  const shellRuntime = createApplicationShell({ app });
  const workflowRuntime = createWorkflowPlatform({ app, shellRuntime });
  const productRuntime = createProductModuleFramework({ app, workflowRuntime });
  const researchRuntime = createResearchModuleFoundation({ app, productRuntime, workflowRuntime });
  return { app, shellRuntime, workflowRuntime, productRuntime, researchRuntime };
}

test('Research contracts define structural commands/events and reject intelligence commands', () => {
  assert.equal(ResearchEventType.ResearchDocumentCreated, 'ResearchDocumentCreated');
  assert.equal(ResearchCommandType.CreateResearchDocument, 'CreateResearchDocument');
  assert.equal(ResearchPermissionAction.createResearchDocument, 'createResearchDocument');
  assert.equal(ResearchArtifactType.sourceReference, 'source-reference');
  assert.equal(ResearchDocumentType.researchNote, 'research-note');
  assert.equal(validateResearchCommand(ResearchCommandType.OpenResearchWorkspace), true);
  assert.throws(() => validateResearchCommand('CalculateValuation'));
  assert.equal(validateSubject({ type: 'subject', id: 'SUB_1', label: 'Placeholder Subject' }), true);
  assert.throws(() => validateSubject({ type: 'company', id: 'CMP_1', label: 'Company', ticker: 'ABC' }));
  const activity = createResearchActivityEvent({ activityId: 'ACT_1', workflowInstanceId: 'WFI_1', researchDocumentId: 'RDOC_1', userId: 'u1', correlationId: 'CORR_1' });
  assert.equal(activity.metadata.researchDocumentId, 'RDOC_1');
});

test('Research manifest validates and registers through product framework with feature flag', () => {
  const { app, productRuntime, workflowRuntime } = runtime();
  const definition = workflowRuntime.workflowRegistry.list()[0];
  const manifest = createResearchModuleManifest({ workflowId: definition.workflowId, workflowVersion: definition.version });
  assert.equal(manifest.productModuleId, RESEARCH_MODULE_ID);
  assert.equal(manifest.featureFlag, RESEARCH_FEATURE_FLAG);
  assert.equal(new ResearchManifestValidator().validate(manifest), true);

  const registration = new ResearchModuleRegistration({ productModuleRegistry: productRuntime.productModuleRegistry, productLifecycleManager: productRuntime.productLifecycleManager, productCapabilityRegistry: productRuntime.productCapabilityRegistry });
  const registered = registration.register(manifest);
  assert.equal(registered.productModuleId, RESEARCH_MODULE_ID);
  assert.equal(productRuntime.productLifecycleManager.status(RESEARCH_MODULE_ID).lifecycleState, ProductLifecycleState.Discovered);
  assert.equal(productRuntime.productCapabilityRegistry.byModule(RESEARCH_MODULE_ID).length, manifest.capabilities.length);
  assert.throws(() => registration.register(manifest));
  assert.equal(app.container.resolve('featureFlagRegistry').get(RESEARCH_FEATURE_FLAG).default_enabled, true);
  assert.throws(() => new ResearchManifestValidator().validate({ ...manifest, name: 'Research Valuation Model' }));
});

test('Research lifecycle reaches mounted through product lifecycle manager', () => {
  const { productRuntime } = runtime();
  productRuntime.productLifecycleManager.discover('research-lifecycle-test');
  productRuntime.productLifecycleManager.transition('research-lifecycle-test', ProductLifecycleState.Validated);
  productRuntime.productLifecycleManager.transition('research-lifecycle-test', ProductLifecycleState.Registered);
  productRuntime.productLifecycleManager.transition('research-lifecycle-test', ProductLifecycleState.Bound);
  productRuntime.productLifecycleManager.transition('research-lifecycle-test', ProductLifecycleState.Enabled);
  const mounted = productRuntime.productLifecycleManager.transition('research-lifecycle-test', ProductLifecycleState.Mounted);
  assert.equal(mounted.lifecycleState, ProductLifecycleState.Mounted);
});

test('Research workspace mounts semantic institutional surface without analysis UI', () => {
  const ws = new ResearchWorkspace();
  const mounted = ws.mount({ context: { workflowInstanceId: 'WFI_1', subject: { type: 'subject', id: 'SUB_1', label: 'Subject' } } });
  assert.equal(mounted.status, 'mounted');
  assert.equal(mounted.surface.regions.header.role, 'banner');
  assert.equal(mounted.surface.regions.researchNavigation.role, 'navigation');
  assert.equal(mounted.surface.regions.documentOutline.role, 'region');
  assert.equal(mounted.surface.regions.artifactPanel.role, 'region');
  assert.equal(mounted.surface.businessLogic, false);
  assert.equal(JSON.stringify(mounted).toLowerCase().includes('valuation'), false);
});

test('Research workflow binding receives context and blocks direct workflow mutation', () => {
  const { productRuntime, workflowRuntime } = runtime();
  const definition = workflowRuntime.workflowRegistry.list()[0];
  const binding = createResearchWorkflowBinding({ workflowId: definition.workflowId, workflowVersion: definition.version });
  const adapter = new ResearchWorkflowAdapter({ workflowBinder: productRuntime.productWorkflowBinder, activityTimeline: workflowRuntime.activityTimeline });
  const registered = adapter.register(binding);
  assert.equal(registered.workflowId, definition.workflowId);
  const context = adapter.receiveContext({ workflowInstanceId: 'WFI_1', workflowId: definition.workflowId, activeStep: 'intake', activeWorkspace: 'research', subject: { type: 'subject', id: 'SUB_1', label: 'Subject' } });
  assert.equal(context.activeWorkspace, 'research');
  assert.throws(() => new ResearchWorkflowContextAdapter().mutateWorkflowContext());
});

test('Research context projects from product context and rejects company/security-specific fields', () => {
  const projector = new ResearchContextProjector();
  const productContext = { workflowInstanceId: 'WFI_1', workspaceId: 'research', subject: { type: 'subject', id: 'SUB_1', label: 'Subject' }, permissions: [] };
  const projection = projector.project(productContext, { activeDocumentId: 'RDOC_1' });
  assert.equal(projection.snapshot().researchModuleId, RESEARCH_MODULE_ID);
  assert.equal(projection.snapshot().activeDocumentId, 'RDOC_1');
  assert.throws(() => { projection.snapshot().activeDocumentId = 'RDOC_2'; });
  assert.throws(() => projector.project({ ...productContext, subject: { type: 'company', id: 'CMP_1', label: 'Company', ticker: 'ABC' } }));
  assert.throws(() => projector.project(productContext, { recommendation: 'buy' }));
});

test('Research documents create, version, query, archive, and reject conclusions', () => {
  const registry = new ResearchDocumentRegistry();
  const subject = { type: 'subject', id: 'SUB_1', label: 'Subject' };
  const doc = registry.create({ documentType: ResearchDocumentType.researchNote, title: 'Research note', workflowInstanceId: 'WFI_1', subject });
  assert.match(doc.researchDocumentId, /^RDOC_/);
  assert.equal(doc.researchDocumentVersion, 1);
  const section = new ResearchDocumentSection({ sectionId: 'overview', title: 'Overview', notes: 'Structural notes only' });
  const updated = registry.updateOutline(doc.researchDocumentId, [section]);
  assert.equal(updated.researchDocumentVersion, 2);
  assert.equal(registry.byWorkflow('WFI_1').length, 1);
  assert.equal(registry.bySubject('SUB_1').length, 1);
  assert.equal(registry.archive(doc.researchDocumentId).status, ResearchLifecycleState.Archived);
  assert.throws(() => registry.create({ documentType: ResearchDocumentType.researchNote, title: 'Investment recommendation', workflowInstanceId: 'WFI_1' }));
});

test('Research artifacts register, link, query, archive, and remain references not evidence conclusions', () => {
  const docs = new ResearchDocumentRegistry();
  const artifacts = new ResearchArtifactRegistry({ documentRegistry: docs });
  const doc = docs.create({ documentType: ResearchDocumentType.sourceSummary, title: 'Source summary', workflowInstanceId: 'WFI_1', subject: { type: 'subject', id: 'SUB_1', label: 'Subject' } });
  const sourceReference = new ResearchSourceReference({ sourceId: 'SRC_1', label: 'Reference metadata' });
  const artifact = artifacts.register({ artifactType: ResearchArtifactType.sourceReference, title: 'Reference metadata', description: 'Metadata only', sourceReference, workflowInstanceId: 'WFI_1' });
  assert.match(artifact.researchArtifactId, /^RART_/);
  const linked = artifacts.link(artifact.researchArtifactId, doc.researchDocumentId);
  assert.equal(linked.documentId, doc.researchDocumentId);
  assert.equal(artifacts.byWorkflow('WFI_1').length, 1);
  assert.equal(artifacts.byDocument(doc.researchDocumentId).length, 1);
  assert.equal(artifacts.archive(artifact.researchArtifactId).status, 'Archived');
  assert.throws(() => artifacts.register({ artifactType: ResearchArtifactType.note, title: 'Valuation conclusion', workflowInstanceId: 'WFI_1' }));
});

test('Research permissions and contributions register, fail closed, and reject investment authority', () => {
  const { app, productRuntime } = runtime();
  assert.throws(() => validateResearchPermission('approveInvestment'));
  registerResearchPermissions(productRuntime.productPermissionRegistry);
  assert.equal(productRuntime.productPermissionGate.require(RESEARCH_MODULE_ID, 'openResearchWorkspace'), true);
  assert.throws(() => productRuntime.productPermissionGate.require(RESEARCH_MODULE_ID, 'missingResearchPermission'));
  const contributions = registerResearchContributions(productRuntime.productContributionRegistry);
  assert.equal(contributions.length >= 5, true);
  assert.equal(productRuntime.productContributionRegistry.execute('open-research-workspace').status, 'executed');
  app.container.resolve('featureFlagRegistry').register({ flag_id: 'disabled_research_feature', default_enabled: false, owner: 'test', status: 'active' });
  productRuntime.productContributionRegistry.register({ productModuleId: RESEARCH_MODULE_ID, contributionId: 'blocked-research', type: 'command', featureFlag: 'disabled_research_feature', permission: 'openResearchWorkspace' });
  assert.equal(productRuntime.productContributionRegistry.execute('blocked-research').status, 'blocked');
});

test('Research projections update from supported events, snapshot, and reject intelligence events', () => {
  const registry = new ResearchProjectionRegistry().registerDefaults();
  const docState = registry.update('research.documents', { type: ResearchEventType.ResearchDocumentCreated, payload: { researchDocumentId: 'RDOC_1' } });
  assert.equal(docState.lastEventType, ResearchEventType.ResearchDocumentCreated);
  const artifactState = registry.update('research.artifacts', { type: ResearchEventType.ResearchArtifactRegistered, payload: { researchArtifactId: 'RART_1' } });
  assert.equal(artifactState.lastEventType, ResearchEventType.ResearchArtifactRegistered);
  const snapshot = registry.get('research.documents').snapshot();
  assert.equal(snapshot.definition.snapshotCompatible, true);
  assert.equal(snapshot.definition.projectionVersion, '1.0.0');
  assert.throws(() => { snapshot.state.lastEventType = 'mutated'; });
  assert.throws(() => registry.update('research.documents', { type: 'ValuationCalculated', payload: {} }));
});

test('Research diagnostics record operational metrics only', () => {
  const diagnostics = new ResearchDiagnostics({ telemetry: new ResearchTelemetry() });
  diagnostics.record('workspaceMounts');
  diagnostics.record('documentCreates');
  diagnostics.record('artifactRegisters');
  diagnostics.record('artifactLinks');
  const health = diagnostics.health();
  assert.equal(health.status, 'Healthy');
  assert.equal(health.metrics.documentCreates, 1);
  assert.equal(JSON.stringify(health).toLowerCase().includes('performance'), false);
  assert.throws(() => diagnostics.record('investmentReturns'));
});

test('Research test harness registers module, runs document/artifact flow, and catches forbidden logic', () => {
  const { researchRuntime } = runtime();
  const harness = new ResearchIntegrationHarness({ researchRuntime });
  const registered = harness.registerResearchModule(harness.fixtures.manifest());
  assert.equal(registered.name, 'Research Module Foundation');
  const doc = harness.createDocument('WFI_HARNESS');
  const artifact = harness.registerArtifact('WFI_HARNESS');
  assert.equal(researchRuntime.researchArtifactRegistry.link(artifact.researchArtifactId, doc.researchDocumentId).documentId, doc.researchDocumentId);
  assert.equal(harness.assertNoForbiddenResearchLogic({ doc, artifact }), true);
  assert.throws(() => harness.assertNoForbiddenResearchLogic({ rating: 'A' }));
});

test('Sprint 4 integrated demo validates Research structure without intelligence', () => {
  const { app, shellRuntime, workflowRuntime, productRuntime, researchRuntime } = runtime();
  assert.equal(shellRuntime.shell.start('/').status, 'mounted');
  const manifest = researchRuntime.researchManifest;
  const registered = researchRuntime.researchRegistration.register(manifest);
  assert.equal(registered.productModuleId, RESEARCH_MODULE_ID);
  productRuntime.productLifecycleManager.transition(RESEARCH_MODULE_ID, ProductLifecycleState.Validated);
  productRuntime.productLifecycleManager.transition(RESEARCH_MODULE_ID, ProductLifecycleState.Registered);
  researchRuntime.researchWorkflowAdapter.register(researchRuntime.researchWorkflowBinding);
  productRuntime.productLifecycleManager.transition(RESEARCH_MODULE_ID, ProductLifecycleState.Bound);
  productRuntime.productLifecycleManager.transition(RESEARCH_MODULE_ID, ProductLifecycleState.Enabled);
  const mountedLifecycle = productRuntime.productLifecycleManager.transition(RESEARCH_MODULE_ID, ProductLifecycleState.Mounted);
  assert.equal(mountedLifecycle.lifecycleState, ProductLifecycleState.Mounted);

  const definition = workflowRuntime.workflowRegistry.get(manifest.workflowBindings[0].workflowId, manifest.workflowBindings[0].workflowVersion) || workflowRuntime.workflowRegistry.list()[0];
  const started = workflowRuntime.workflowEngine.start({ workflowId: definition.workflowId, version: definition.version });
  assert.equal(shellRuntime.shell.navigate('/research').status, 'mounted');
  const workflowContext = workflowRuntime.contextManager.create({ workflowInstanceId: started.instance.workflowInstanceId, workflowId: definition.workflowId, activeWorkspace: 'research', activeStep: 'intake', subject: { type: 'subject', id: 'SUB_1', label: 'Placeholder Subject' } });
  const productContext = productRuntime.productContextBridge.project({ productModuleId: RESEARCH_MODULE_ID, workflowContext, permissions: manifest.permissions });
  const researchContext = researchRuntime.researchContextProjector.project(productContext);
  const workspace = researchRuntime.researchWorkspace.mount({ context: researchContext.snapshot() });
  assert.equal(workspace.status, 'mounted');

  const doc = researchRuntime.researchDocumentRegistry.create({ documentType: ResearchDocumentType.researchNote, title: 'Research note', workflowInstanceId: started.instance.workflowInstanceId, subject: workflowContext.subject });
  const artifact = researchRuntime.researchArtifactRegistry.register({ artifactType: ResearchArtifactType.sourceReference, title: 'Reference metadata', description: 'Metadata only', workflowInstanceId: started.instance.workflowInstanceId, sourceReference: { sourceId: 'SRC_1', label: 'Reference' } });
  const linked = researchRuntime.researchArtifactRegistry.link(artifact.researchArtifactId, doc.researchDocumentId);
  researchRuntime.researchProjectionRegistry.update('research.documents', { type: ResearchEventType.ResearchDocumentCreated, payload: { researchDocumentId: doc.researchDocumentId } });
  researchRuntime.researchProjectionRegistry.update('research.artifacts', { type: ResearchEventType.ResearchArtifactLinked, payload: { researchArtifactId: linked.researchArtifactId } });
  const activity = workflowRuntime.activityTimeline.record({ type: ResearchEventType.ResearchActivityRecorded, workflow_instance_id: started.instance.workflowInstanceId, payload: { researchDocumentId: doc.researchDocumentId }, event_id: 'EVT_RESEARCH', timestamp: new Date().toISOString(), source: 'ResearchModuleFoundation' });
  assert.match(activity.activityId, /^ACT_/);
  assert.equal(researchRuntime.researchTestHarness.assertNoForbiddenResearchLogic({ manifest, workspace, doc, artifact: linked, researchContext: researchContext.snapshot() }), true);
  const serialized = JSON.stringify({ manifest, workspace, doc, artifact: linked, researchContext: researchContext.snapshot(), events: app.container.resolve('eventStore').all() }).toLowerCase();
  for (const forbidden of ['discounted cash flow', 'stock scoring', 'buy recommendation', 'market data provider', 'assign rating', 'decision automation']) assert.equal(serialized.includes(forbidden), false);
});
