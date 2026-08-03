import { FlagStatus } from '../../../../../packages/feature-flags/src/index.js';
import { createResearchModuleManifest, RESEARCH_FEATURE_FLAG } from './manifest/index.js';
import { ResearchModuleRegistration } from './manifest/index.js';
import { ResearchWorkspace } from './workspace/index.js';
import { createResearchWorkflowBinding, ResearchWorkflowAdapter } from './workflow/index.js';
import { ResearchContextProjector } from './context/index.js';
import { ResearchDocumentRegistry } from './documents/index.js';
import { ResearchArtifactRegistry } from './artifacts/index.js';
import { registerResearchPermissions, registerResearchContributions } from './contributions/index.js';
import { ResearchProjectionRegistry } from './projections/index.js';
import { ResearchDiagnostics } from './diagnostics/index.js';
import { ResearchIntegrationHarness } from './testing/index.js';

export function createResearchModuleFoundation({ app, productRuntime, workflowRuntime } = {}) {
  const container = app.container;
  const featureFlagRegistry = container.resolve('featureFlagRegistry');
  if (!featureFlagRegistry.get(RESEARCH_FEATURE_FLAG)) featureFlagRegistry.register({ flag_id: RESEARCH_FEATURE_FLAG, default_enabled:true, owner:'research-platform', status:FlagStatus.active });
  const diagnostics = container.resolve('diagnostics');
  const researchDiagnostics = new ResearchDiagnostics({ diagnostics });
  const workflowDefinition = workflowRuntime?.workflowRegistry?.list?.()[0];
  const researchManifest = createResearchModuleManifest({ workflowId: workflowDefinition?.workflowId || 'WF_RESEARCH_PLACEHOLDER', workflowVersion: workflowDefinition?.version || '1.0.0' });
  const researchRegistration = new ResearchModuleRegistration({ productModuleRegistry:productRuntime.productModuleRegistry, productLifecycleManager:productRuntime.productLifecycleManager, productCapabilityRegistry:productRuntime.productCapabilityRegistry });
  const researchWorkspace = new ResearchWorkspace({ diagnostics });
  const researchWorkflowAdapter = new ResearchWorkflowAdapter({ workflowBinder:productRuntime.productWorkflowBinder, activityTimeline:workflowRuntime?.activityTimeline });
  const researchWorkflowBinding = createResearchWorkflowBinding({ workflowId: researchManifest.workflowBindings[0].workflowId, workflowVersion: researchManifest.workflowBindings[0].workflowVersion });
  const researchContextProjector = new ResearchContextProjector();
  const researchDocumentRegistry = new ResearchDocumentRegistry({ diagnostics: researchDiagnostics });
  const researchArtifactRegistry = new ResearchArtifactRegistry({ documentRegistry: researchDocumentRegistry, diagnostics: researchDiagnostics });
  const researchProjectionRegistry = new ResearchProjectionRegistry().registerDefaults();
  registerResearchPermissions(productRuntime.productPermissionRegistry);
  const researchContributions = registerResearchContributions(productRuntime.productContributionRegistry);
  const runtime = Object.freeze({ researchManifest, researchRegistration, researchWorkspace, researchWorkflowAdapter, researchWorkflowBinding, researchContextProjector, researchDocumentRegistry, researchArtifactRegistry, researchProjectionRegistry, researchDiagnostics, researchContributions });
  const researchTestHarness = new ResearchIntegrationHarness({ researchRuntime: runtime });
  const full = Object.freeze({ ...runtime, researchTestHarness });
  for (const [key, value] of Object.entries(full)) if (!container.has(key)) container.register(key, value);
  return full;
}
