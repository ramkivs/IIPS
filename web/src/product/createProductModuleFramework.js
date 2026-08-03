import { FlagStatus } from '../../../../packages/feature-flags/src/index.js';
import { ProductModuleRegistry, createPlaceholderProductModuleManifests } from './registry/index.js';
import { ProductLifecycleManager } from './lifecycle/index.js';
import { ProductCapabilityRegistry } from './capabilities/index.js';
import { ProductWorkspaceBinder, ProductWorkflowBinder } from './bindings/index.js';
import { ProductContextBridge } from './context/index.js';
import { ProductPermissionRegistry, ProductPermissionGate } from './permissions/index.js';
import { ProductProjectionRegistry } from './projections/index.js';
import { ProductContributionRegistry } from './contributions/index.js';
import { ProductIntegrationHarness } from './testing/index.js';

export function registerProductFeatureFlags(registry, manifests) { for(const m of manifests) if(!registry.get(m.featureFlag)) registry.register({ flag_id:m.featureFlag, default_enabled:true, owner:'product-framework', status:FlagStatus.active }); return registry; }
export function createProductModuleFramework({ app, workflowRuntime } = {}) {
  const c=app.container; const eventBus=c.resolve('eventBus'); const diagnostics=c.resolve('diagnostics'); const featureFlagRegistry=c.resolve('featureFlagRegistry'); const platformCapabilityRegistry=c.resolve('capabilityRegistry'); const workflowId=workflowRuntime?.workflowRegistry?.list?.()[0]?.workflowId || 'WF_PLACEHOLDER';
  const placeholderManifests=createPlaceholderProductModuleManifests({ workflowId }); registerProductFeatureFlags(featureFlagRegistry, placeholderManifests);
  const productModuleRegistry=new ProductModuleRegistry({ eventBus, diagnostics });
  const productLifecycleManager=new ProductLifecycleManager({ eventBus, diagnostics });
  const productCapabilityRegistry=new ProductCapabilityRegistry({ platformCapabilityRegistry, eventBus, diagnostics });
  const productWorkspaceBinder=new ProductWorkspaceBinder({ featureFlagRegistry, environment:app.config.environment, eventBus, diagnostics });
  const productWorkflowBinder=new ProductWorkflowBinder({ featureFlagRegistry, environment:app.config.environment, eventBus, diagnostics });
  const productContextBridge=new ProductContextBridge();
  const productPermissionRegistry=new ProductPermissionRegistry();
  const productPermissionGate=new ProductPermissionGate({ registry:productPermissionRegistry, diagnostics });
  const productProjectionRegistry=new ProductProjectionRegistry({ eventBus, diagnostics });
  const productContributionRegistry=new ProductContributionRegistry({ featureFlagRegistry, environment:app.config.environment, permissionGate:productPermissionGate, eventBus, diagnostics });
  const runtime=Object.freeze({ placeholderManifests, productModuleRegistry, productLifecycleManager, productCapabilityRegistry, productWorkspaceBinder, productWorkflowBinder, productContextBridge, productPermissionRegistry, productPermissionGate, productProjectionRegistry, productContributionRegistry });
  const productTestHarness=new ProductIntegrationHarness({ productRuntime:runtime });
  const full=Object.freeze({ ...runtime, productTestHarness });
  for(const [k,v] of Object.entries(full)) if(!c.has(k)) c.register(k,v);
  return full;
}
