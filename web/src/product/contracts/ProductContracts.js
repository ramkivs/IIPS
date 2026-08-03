export const ProductModuleStatus = Object.freeze({ draft:'draft', active:'active', deprecated:'deprecated', retired:'retired' });
export const ProductHealthState = Object.freeze({ Healthy:'Healthy', Degraded:'Degraded', Disabled:'Disabled', Failed:'Failed' });
export const ProductContributionType = Object.freeze({ command:'command', notification:'notification', activity:'activity', navigation:'navigation' });
export const ProductCapabilityCategory = Object.freeze({ workspace:'workspace', workflow:'workflow', command:'command', notification:'notification', activity:'activity', projection:'projection', permission:'permission', context:'context' });
export const ProductEventType = Object.freeze({ ProductModuleRegistered:'ProductModuleRegistered', ProductLifecycleChanged:'ProductLifecycleChanged', ProductCapabilityRegistered:'ProductCapabilityRegistered', ProductBindingRegistered:'ProductBindingRegistered', ProductPermissionDenied:'ProductPermissionDenied', ProductProjectionUpdated:'ProductProjectionUpdated', ProductContributionRegistered:'ProductContributionRegistered' });

export const forbiddenInvestmentTerms = Object.freeze([
  'valuation','discounted cash flow','dcf','scorecompany','stock scoring','scoring','portfolio calculation','position sizing','risk calculation','market data','provider integration','investment recommendation','decision automation','approveinvestment','recommendinvestment','calculatevaluation','rebalanceportfolio','methodology implementation'
]);

export function assertRequired(record, fields, label='record') { for (const f of fields) if (record?.[f] === undefined || record?.[f] === null || record?.[f] === '') throw new Error(`${label}.${f} is required`); return true; }
export function assertNoInvestmentLogic(value, label='product module') { const text=JSON.stringify(value || {}).toLowerCase(); for (const term of forbiddenInvestmentTerms) if (text.includes(term)) throw new Error(`${label} contains forbidden investment logic: ${term}`); return true; }

export function validateCompatibility(compatibility) {
  assertRequired(compatibility, ['minimumPlatformVersion','maximumPlatformVersion','minimumWorkflowVersion','contractVersion'], 'compatibility');
  return true;
}

export function validateDependencyPolicy(manifest) {
  for (const dep of manifest.dependencies || []) {
    if (!dep.type || !dep.target) throw new Error('dependency.type and dependency.target are required');
    if (dep.type === 'product' && !dep.interface) throw new Error('product-to-product dependencies require declared interface');
  }
  return true;
}

export function validateProductModuleManifest(manifest) {
  assertRequired(manifest, ['productModuleId','name','version','contractVersion','owner','status','featureFlag','workspaceBindings','workflowBindings','capabilities','permissions','commands','notifications','activities','projections','createdAt','compatibility'], 'manifest');
  if (!Object.values(ProductModuleStatus).includes(manifest.status)) throw new Error(`Unsupported product module status: ${manifest.status}`);
  for (const field of ['workspaceBindings','workflowBindings','capabilities','permissions','commands','notifications','activities','projections']) if (!Array.isArray(manifest[field])) throw new Error(`manifest.${field} must be an array`);
  validateCompatibility(manifest.compatibility);
  validateDependencyPolicy(manifest);
  for (const c of manifest.capabilities) if (!Object.values(ProductCapabilityCategory).includes(c.category)) throw new Error(`Unsupported capability category: ${c.category}`);
  for (const contribution of [...manifest.commands.map(c=>({ ...c, contributionType:'command' })), ...manifest.notifications.map(c=>({ ...c, contributionType:'notification' })), ...manifest.activities.map(c=>({ ...c, contributionType:'activity' }))]) if (!Object.values(ProductContributionType).includes(contribution.contributionType)) throw new Error(`Unsupported contribution type: ${contribution.contributionType}`);
  assertNoInvestmentLogic(manifest, manifest.productModuleId);
  return true;
}

export function createProductTelemetry(overrides = {}) { return Object.freeze({ moduleLoadTime:0, activationFailures:0, permissionDenials:0, projectionUpdateLatency:0, contributionRegistrationFailures:0, ...overrides }); }
