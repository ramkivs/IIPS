import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/bootstrap/createApp.js';
import { createApplicationShell } from '../src/shell/index.js';
import { createWorkflowPlatform } from '../src/workflow/index.js';
import {
  ProductModuleStatus,
  ProductHealthState,
  ProductEventType,
  ProductContributionType,
  ProductCapabilityCategory,
  validateProductModuleManifest,
  assertNoInvestmentLogic,
  ProductModuleRegistry,
  createPlaceholderProductModuleManifests,
  ProductLifecycleManager,
  ProductLifecycleState,
  ProductCapabilityRegistry,
  ProductWorkspaceBinder,
  ProductWorkflowBinder,
  ProductContextBridge,
  ProductPermissionRegistry,
  ProductPermissionGate,
  ProductProjectionRegistry,
  ProductContributionRegistry,
  ProductCommandContribution,
  ProductNavigationContribution,
  ProductNotificationContribution,
  ProductActivityContribution,
  ProductIntegrationHarness,
  createProductModuleFramework
} from '../src/product/index.js';

function runtime() {
  const app = createApp({ env: { NODE_ENV: 'test' } });
  const shellRuntime = createApplicationShell({ app });
  const workflowRuntime = createWorkflowPlatform({ app, shellRuntime });
  const productRuntime = createProductModuleFramework({ app, workflowRuntime });
  return { app, shellRuntime, workflowRuntime, productRuntime };
}

test('product manifest contract validates compatibility, dependency policy, and guardrails', () => {
  const manifest = createPlaceholderProductModuleManifests()[0];
  assert.equal(validateProductModuleManifest(manifest), true);
  assert.equal(manifest.compatibility.minimumPlatformVersion, '2.0.0');
  assert.equal(manifest.compatibility.minimumWorkflowVersion, '1.0.0');
  assert.equal(manifest.health, undefined);
  assert.throws(() => validateProductModuleManifest({ ...manifest, status: 'random' }));
  assert.throws(() => validateProductModuleManifest({ ...manifest, compatibility: { contractVersion: '1.0' } }));
  assert.throws(() => validateProductModuleManifest({ ...manifest, dependencies: [{ type: 'product', target: 'other-product' }] }));
  assert.throws(() => validateProductModuleManifest({ ...manifest, name: 'Valuation Model Product' }));
});

test('product module registry registers placeholders, queries bindings, emits events, and rejects duplicates', () => {
  const { app, productRuntime } = runtime();
  const registry = new ProductModuleRegistry({ eventBus: app.container.resolve('eventBus'), diagnostics: app.diagnostics });
  const manifest = productRuntime.placeholderManifests[0];
  const registered = registry.register(manifest);

  assert.equal(registered.health, ProductHealthState.Healthy);
  assert.equal(registered.telemetry.moduleLoadTime, 0);
  assert.equal(registry.byStatus(ProductModuleStatus.active).length, 1);
  assert.equal(registry.byWorkspaceBinding('research').length, 1);
  assert.equal(registry.byWorkflowBinding(manifest.workflowBindings[0].workflowId).length, 1);
  assert.throws(() => registry.register(manifest));
  assert.equal(app.container.resolve('eventStore').all().some(e => e.type === ProductEventType.ProductModuleRegistered), true);
});

test('product lifecycle manager enforces governed transitions and health separation', () => {
  const { app } = runtime();
  const manager = new ProductLifecycleManager({ eventBus: app.container.resolve('eventBus'), diagnostics: app.diagnostics });
  manager.discover('research-product-placeholder');
  manager.transition('research-product-placeholder', ProductLifecycleState.Validated);
  manager.transition('research-product-placeholder', ProductLifecycleState.Registered);
  manager.transition('research-product-placeholder', ProductLifecycleState.Bound);
  manager.transition('research-product-placeholder', ProductLifecycleState.Enabled);
  const mounted = manager.transition('research-product-placeholder', ProductLifecycleState.Mounted);
  assert.equal(mounted.lifecycleState, ProductLifecycleState.Mounted);
  assert.equal(mounted.health, ProductHealthState.Healthy);
  assert.throws(() => manager.transition('research-product-placeholder', ProductLifecycleState.Registered));
  assert.equal(manager.status('research-product-placeholder').health, ProductHealthState.Failed);
  assert.equal(app.container.resolve('eventStore').all().some(e => e.type === ProductEventType.ProductLifecycleChanged), true);
});

test('product capability registry accepts declared capabilities and rejects undeclared/conflicting capabilities', () => {
  const { app, productRuntime } = runtime();
  const manifest = productRuntime.placeholderManifests[0];
  const registry = new ProductCapabilityRegistry({ platformCapabilityRegistry: app.container.resolve('capabilityRegistry'), eventBus: app.container.resolve('eventBus'), diagnostics: app.diagnostics });
  const cap = registry.register({ manifest, capability: manifest.capabilities[0] });
  assert.equal(cap.category, ProductCapabilityCategory.workspace);
  assert.equal(registry.byModule(manifest.productModuleId).length, 1);
  assert.equal(registry.byCategory(ProductCapabilityCategory.workspace).length, 1);
  assert.throws(() => registry.register({ manifest, capability: { capabilityId: 'undeclared', category: 'workspace' } }));
  assert.throws(() => registry.register({ manifest, capability: manifest.capabilities[0] }));
});

test('workspace and workflow binders register, feature-gate, mount placeholders, and pass workflow context', () => {
  const { app, workflowRuntime, productRuntime } = runtime();
  const manifest = productRuntime.placeholderManifests[0];
  const workspaceBinder = new ProductWorkspaceBinder({ featureFlagRegistry: app.container.resolve('featureFlagRegistry'), environment: 'test', eventBus: app.container.resolve('eventBus'), diagnostics: app.diagnostics });
  const workflowBinder = new ProductWorkflowBinder({ featureFlagRegistry: app.container.resolve('featureFlagRegistry'), environment: 'test', eventBus: app.container.resolve('eventBus'), diagnostics: app.diagnostics });
  const wb = workspaceBinder.register(manifest.workspaceBindings[0]);
  const fb = workflowBinder.register(manifest.workflowBindings[0]);
  const definition = workflowRuntime.workflowRegistry.get(fb.workflowId, fb.workflowVersion) || workflowRuntime.workflowRegistry.list()[0];
  const started = workflowRuntime.workflowEngine.start({ workflowId: definition.workflowId, version: definition.version });
  const context = workflowRuntime.contextManager.create({ workflowInstanceId: started.instance.workflowInstanceId, workflowId: definition.workflowId, activeWorkspace: 'research', activeStep: 'intake' });
  const mounted = workspaceBinder.mountPlaceholder(wb, context);
  assert.equal(mounted.status, 'mounted');
  assert.equal(mounted.surface.businessLogic, false);
  assert.equal(workflowBinder.contextFor(fb, context).workflowInstanceId, context.workflowInstanceId);

  const blocked = new ProductWorkspaceBinder({ featureFlagRegistry: app.container.resolve('featureFlagRegistry'), environment: 'test' }).mountPlaceholder({ ...wb, featureFlag: 'missing_feature' }, context);
  assert.equal(blocked.status, 'blocked');
});

test('product context bridge projects from workflow context and blocks direct workflow mutation', () => {
  const bridge = new ProductContextBridge();
  const workflowContext = { workflowInstanceId: 'WFI_1', activeWorkspace: 'research', subject: { type: 'generic', id: 'S1', label: 'Subject' }, pinnedArtifacts: [], lastUpdatedAt: new Date().toISOString() };
  const projection = bridge.project({ productModuleId: 'research-product-placeholder', workflowContext, permissions: [{ action: 'view' }] });
  assert.equal(projection.snapshot().workspaceId, 'research');
  assert.throws(() => { projection.snapshot().workspaceId = 'portfolio'; });
  const updated = bridge.updateFromWorkflow(projection, { ...workflowContext, activeWorkspace: 'portfolio' });
  assert.equal(updated.snapshot().workspaceId, 'portfolio');
  assert.throws(() => bridge.mutateWorkflowContext());
  assert.throws(() => bridge.project({ productModuleId: 'x', workflowContext: { ...workflowContext, companyId: 'CMP_1' } }));
});

test('product permissions fail closed and reject investment-domain actions', () => {
  const registry = new ProductPermissionRegistry();
  registry.register({ productModuleId: 'research-product-placeholder', action: 'open', effect: 'allow' });
  registry.register({ productModuleId: 'research-product-placeholder', action: 'mount', effect: 'deny' });
  const gate = new ProductPermissionGate({ registry });
  assert.equal(gate.require('research-product-placeholder', 'open'), true);
  assert.throws(() => gate.require('research-product-placeholder', 'mount'));
  assert.throws(() => gate.require('research-product-placeholder', 'readContext'));
  assert.equal(gate.healthMetrics().permissionDenials, 2);
  assert.throws(() => registry.register({ productModuleId: 'research-product-placeholder', action: 'calculateValuation', effect: 'allow' }));
});

test('product projections are read-only, snapshot-compatible, and reject unsupported event mappings', () => {
  const { app } = runtime();
  const registry = new ProductProjectionRegistry({ eventBus: app.container.resolve('eventBus'), diagnostics: app.diagnostics });
  const projection = registry.register({ projectionId: 'research.summary', category: 'moduleStatus', snapshotCompatible: true, projectionVersion: '1.0.0', supportedEvents: ['ProductModuleRegistered'] });
  const state = registry.update('research.summary', { type: 'ProductModuleRegistered', payload: { productModuleId: 'research-product-placeholder' } });
  assert.equal(state.lastEventType, 'ProductModuleRegistered');
  assert.throws(() => registry.update('research.summary', { type: 'ValuationCalculated', payload: {} }));
  assert.throws(() => { projection.snapshot().state.lastEventType = 'mutated'; });
  assert.throws(() => registry.register({ projectionId: 'bad', category: 'moduleStatus', snapshotCompatible: true }));
  assert.equal(registry.healthMetrics().projectionUpdateLatency >= 0, true);
});

test('product contribution contracts register and enforce feature and permission gates', () => {
  const { app } = runtime();
  const permissionRegistry = new ProductPermissionRegistry();
  permissionRegistry.register({ productModuleId: 'research-product-placeholder', action: 'open', effect: 'allow' });
  const gate = new ProductPermissionGate({ registry: permissionRegistry });
  const registry = new ProductContributionRegistry({ featureFlagRegistry: app.container.resolve('featureFlagRegistry'), environment: 'test', permissionGate: gate, eventBus: app.container.resolve('eventBus'), diagnostics: app.diagnostics });
  const cmd = registry.register(ProductCommandContribution({ productModuleId: 'research-product-placeholder', contributionId: 'open-research-product-placeholder', featureFlag: 'research-product-placeholder_feature', permission: 'open', execute: () => ({ opened: true }) }));
  registry.register(ProductNavigationContribution({ productModuleId: 'research-product-placeholder', contributionId: 'nav-research-product-placeholder', featureFlag: 'research-product-placeholder_feature', permission: 'open' }));
  registry.register(ProductNotificationContribution({ productModuleId: 'research-product-placeholder', contributionId: 'note-research-product-placeholder', featureFlag: 'research-product-placeholder_feature', permission: 'open' }));
  registry.register(ProductActivityContribution({ productModuleId: 'research-product-placeholder', contributionId: 'activity-research-product-placeholder', featureFlag: 'research-product-placeholder_feature', permission: 'open' }));
  assert.equal(cmd.type, ProductContributionType.command);
  assert.equal(registry.byType(ProductContributionType.navigation).length, 1);
  assert.equal(registry.execute('open-research-product-placeholder').status, 'executed');
  registry.register(ProductCommandContribution({ productModuleId: 'research-product-placeholder', contributionId: 'blocked', featureFlag: 'missing_flag', permission: 'open' }));
  assert.equal(registry.execute('blocked').status, 'blocked');
  registry.register(ProductCommandContribution({ productModuleId: 'research-product-placeholder', contributionId: 'denied', featureFlag: 'research-product-placeholder_feature', permission: 'readContext' }));
  assert.throws(() => registry.execute('denied'));
});

test('product test harness creates fixtures, registers, binds, runs lifecycle, and catches forbidden logic', () => {
  const { productRuntime, workflowRuntime } = runtime();
  const harness = new ProductIntegrationHarness({ productRuntime });
  const manifest = harness.createFixture({ productModuleId: 'harness-product-placeholder' });
  const registered = harness.registerModule(manifest);
  assert.equal(registered.productModuleId, 'harness-product-placeholder');
  const lifecycle = harness.runLifecycle(manifest.productModuleId);
  assert.equal(lifecycle.lifecycleState, ProductLifecycleState.Mounted);
  const definition = workflowRuntime.workflowRegistry.list()[0];
  const context = { workflowInstanceId: 'WFI_HARNESS', workflowId: definition.workflowId, activeWorkspace: 'research', activeStep: 'intake', subject: { type: 'generic', id: 'S1', label: 'Subject' }, pinnedArtifacts: [] };
  const integration = harness.runShellWorkflowProductIntegration({ manifest: harness.createFixture({ productModuleId: 'harness-product-placeholder-2' }), workflowContext: context });
  assert.equal(integration.mounted.status, 'mounted');
  assert.equal(harness.assertNoForbiddenInvestmentLogic(integration), true);
  assert.throws(() => harness.assertNoForbiddenInvestmentLogic({ feature: 'calculate valuation' }));
});

test('Sprint 3 integrated demo validates product module attachment without investment logic', () => {
  const { app, shellRuntime, workflowRuntime, productRuntime } = runtime();
  assert.equal(shellRuntime.shell.start('/').status, 'mounted');
  const manifest = productRuntime.placeholderManifests[0];

  const registered = productRuntime.productModuleRegistry.register(manifest);
  assert.equal(registered.productModuleId, manifest.productModuleId);
  productRuntime.productLifecycleManager.discover(manifest.productModuleId);
  productRuntime.productLifecycleManager.transition(manifest.productModuleId, ProductLifecycleState.Validated);
  productRuntime.productLifecycleManager.transition(manifest.productModuleId, ProductLifecycleState.Registered);

  const wb = productRuntime.productWorkspaceBinder.register(manifest.workspaceBindings[0]);
  const fb = productRuntime.productWorkflowBinder.register(manifest.workflowBindings[0]);
  productRuntime.productLifecycleManager.transition(manifest.productModuleId, ProductLifecycleState.Bound);
  productRuntime.productLifecycleManager.transition(manifest.productModuleId, ProductLifecycleState.Enabled);

  manifest.permissions.forEach(p => productRuntime.productPermissionRegistry.register({ productModuleId: manifest.productModuleId, action: p.action, effect: p.effect }));
  productRuntime.productCapabilityRegistry.register({ manifest, capability: manifest.capabilities[0] });
  const definition = workflowRuntime.workflowRegistry.get(fb.workflowId, fb.workflowVersion) || workflowRuntime.workflowRegistry.list()[0];
  const started = workflowRuntime.workflowEngine.start({ workflowId: definition.workflowId, version: definition.version });
  assert.equal(shellRuntime.shell.navigate('/research').status, 'mounted');
  const workflowContext = workflowRuntime.contextManager.create({ workflowInstanceId: started.instance.workflowInstanceId, workflowId: definition.workflowId, activeWorkspace: 'research', activeStep: 'intake', subject: { type: 'generic', id: 'SUB_1', label: 'Subject' } });
  const mounted = productRuntime.productWorkspaceBinder.mountPlaceholder(wb, workflowContext);
  assert.equal(mounted.surface.type, 'product-placeholder-surface');
  assert.equal(mounted.surface.businessLogic, false);

  const productContext = productRuntime.productContextBridge.project({ productModuleId: manifest.productModuleId, workflowContext, permissions: manifest.permissions });
  assert.equal(productContext.snapshot().workflowInstanceId, workflowContext.workflowInstanceId);
  productRuntime.productContributionRegistry.register(ProductCommandContribution({ productModuleId: manifest.productModuleId, contributionId: 'open-research-product-placeholder-demo', featureFlag: manifest.featureFlag, permission: 'open' }));
  assert.equal(productRuntime.productContributionRegistry.execute('open-research-product-placeholder-demo').status, 'executed');
  const activity = workflowRuntime.activityTimeline.record({ type: ProductEventType.ProductModuleRegistered, workflow_instance_id: workflowContext.workflowInstanceId, payload: { productModuleId: manifest.productModuleId }, event_id: 'EVT_PRODUCT', timestamp: new Date().toISOString(), source: 'ProductModuleFramework' });
  assert.match(activity.activityId, /^ACT_/);
  assert.equal(productRuntime.productTestHarness.assertNoForbiddenInvestmentLogic({ manifest, mounted, productContext: productContext.snapshot() }), true);
  const serialized = JSON.stringify({ manifest, mounted, productContext: productContext.snapshot(), events: app.container.resolve('eventStore').all() }).toLowerCase();
  for (const forbidden of ['discounted cash flow', 'stock scoring', 'portfolio calculation', 'market data provider', 'investment recommendation', 'decision automation']) assert.equal(serialized.includes(forbidden), false);
});
