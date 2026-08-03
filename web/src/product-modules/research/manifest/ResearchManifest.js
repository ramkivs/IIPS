import { validateProductModuleManifest } from '../../../product/index.js';
import { assertNoResearchIntelligence } from '../contracts/index.js';

export const RESEARCH_MODULE_ID = 'research-module-foundation';
export const RESEARCH_FEATURE_FLAG = 'research_module_foundation';

export function createResearchModuleManifest({ workflowId='WF_RESEARCH_PLACEHOLDER', workflowVersion='1.0.0' } = {}) {
  const manifest = Object.freeze({
    productModuleId: RESEARCH_MODULE_ID,
    name: 'Research Module Foundation',
    version: '1.0.0',
    contractVersion: '1.0',
    owner: 'research-platform',
    status: 'active',
    featureFlag: RESEARCH_FEATURE_FLAG,
    compatibility: Object.freeze({ minimumPlatformVersion:'2.0.0', maximumPlatformVersion:'2.x', minimumWorkflowVersion:'1.0.0', contractVersion:'1.0' }),
    dependencies: Object.freeze([{ type:'platform', target:'event-bus' }, { type:'workflow', target:'workflow-context' }, { type:'product', target:'product-context', interface:'ProductContextProjection' }]),
    workspaceBindings: Object.freeze([{ productModuleId: RESEARCH_MODULE_ID, workspaceId:'research', featureFlag: RESEARCH_FEATURE_FLAG, mountMode:'module', placeholderOnly:false }]),
    workflowBindings: Object.freeze([{ productModuleId: RESEARCH_MODULE_ID, workflowId, workflowVersion, supportedSteps:Object.freeze(['intake','review']), contextSubscriptions:Object.freeze(['activeWorkspace','activeStep','subject']), placeholderOnly:false }]),
    capabilities: Object.freeze([
      { capabilityId:'research.workspace.foundation', category:'workspace' },
      { capabilityId:'research.context.foundation', category:'context' },
      { capabilityId:'research.documents.foundation', category:'projection' },
      { capabilityId:'research.artifacts.foundation', category:'projection' }
    ]),
    permissions: Object.freeze([
      { action:'view', effect:'allow' }, { action:'open', effect:'allow' }, { action:'mount', effect:'allow' }, { action:'readContext', effect:'allow' }
    ]),
    commands: Object.freeze([{ commandId:'open-research-workspace', label:'Open Research Workspace', featureFlag: RESEARCH_FEATURE_FLAG, permission:'open' }]),
    notifications: Object.freeze([{ notificationId:'research-foundation.notification', type:'info', permission:'receiveNotification' }]),
    activities: Object.freeze([{ activityId:'research-foundation.activity', type:'moduleStatus', permission:'recordActivity' }]),
    projections: Object.freeze([{ projectionId:'research-foundation.summary', category:'moduleStatus', snapshotCompatible:true, projectionVersion:'1.0.0' }]),
    createdAt: new Date().toISOString(),
    businessLogic: false
  });
  assertNoResearchIntelligence(manifest, 'Research manifest');
  return manifest;
}

export class ResearchManifestValidator { validate(manifest) { validateProductModuleManifest(manifest); assertNoResearchIntelligence(manifest, 'Research manifest'); if (manifest.productModuleId !== RESEARCH_MODULE_ID) throw new Error('Invalid Research module id'); if (manifest.featureFlag !== RESEARCH_FEATURE_FLAG) throw new Error('Research feature flag must be research_module_foundation'); return true; } }
export class ResearchModuleRegistration { constructor({ productModuleRegistry, productLifecycleManager, productCapabilityRegistry } = {}) { this.productModuleRegistry=productModuleRegistry; this.productLifecycleManager=productLifecycleManager; this.productCapabilityRegistry=productCapabilityRegistry; this.validator=new ResearchManifestValidator(); }
  register(manifest) { this.validator.validate(manifest); const registered=this.productModuleRegistry.register(manifest); this.productLifecycleManager?.discover?.(manifest.productModuleId); for (const cap of manifest.capabilities || []) this.productCapabilityRegistry?.register?.({ manifest, capability:cap }); return registered; }}
