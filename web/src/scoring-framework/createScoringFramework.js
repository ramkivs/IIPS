import { FlagStatus } from '../../../../packages/feature-flags/src/index.js';
import { InMemorySnapshotStore } from '../../../../packages/snapshot-engine/src/index.js';
import { SCORING_FRAMEWORK_FEATURE_FLAG } from './contracts/index.js';
import { createPlaceholderScoringManifest } from './models/index.js';
import { ScoringModelRegistry, ScoringModelVersionRegistry } from './registry/index.js';
import { ScoringLifecycleManager } from './lifecycle/index.js';
import { ScoringConfigurationRegistry } from './configuration/index.js';
import { ScoringInputPackage, NormalizedValuationResultScoringAdapter, EvidenceReferenceScoringAdapter, MethodologyReferenceScoringAdapter, ResearchReferenceScoringAdapter, ScoringInputAdapterRegistry } from './inputs/index.js';
import { ScoringRuleRegistry } from './rules/index.js';
import { ScoreComponentRegistry } from './components/index.js';
import { ScoreAggregationShell } from './aggregation/index.js';
import { ScoreArtifactRegistry } from './artifacts/index.js';
import { ScoreAuditTrail } from './audit/index.js';
import { ScoreSnapshotAdapter } from './snapshots/index.js';
import { ScoreReplayAdapter } from './replay/index.js';
import { ScoringPermissionRegistry, ScoringPermissionGate, registerDefaultScoringPermissions } from './permissions/index.js';
import { ScoringDiagnostics } from './diagnostics/index.js';
import { ScoringProjectionRegistry } from './projections/index.js';
import { ScoringIntegrationHarness } from './testing/index.js';

export function createScoringFramework({ app }={}){ const c=app.container; const flags=c.resolve('featureFlagRegistry'); if(!flags.get(SCORING_FRAMEWORK_FEATURE_FLAG)) flags.register({ flag_id:SCORING_FRAMEWORK_FEATURE_FLAG, default_enabled:true, owner:'scoring-framework', status:FlagStatus.active }); const modelRegistry=new ScoringModelRegistry(); const versionRegistry=new ScoringModelVersionRegistry(); const lifecycleManager=new ScoringLifecycleManager(); const configurationRegistry=new ScoringConfigurationRegistry(); const inputAdapterRegistry=new ScoringInputAdapterRegistry(); const normalizedValuationAdapter=new NormalizedValuationResultScoringAdapter(); inputAdapterRegistry.register('normalizedValuationResult', normalizedValuationAdapter); inputAdapterRegistry.register('evidenceReference', new EvidenceReferenceScoringAdapter()); inputAdapterRegistry.register('methodologyReference', new MethodologyReferenceScoringAdapter()); inputAdapterRegistry.register('researchReference', new ResearchReferenceScoringAdapter()); const ruleRegistry=new ScoringRuleRegistry(); const componentRegistry=new ScoreComponentRegistry(); const aggregationShell=new ScoreAggregationShell(); const artifactRegistry=new ScoreArtifactRegistry(); const auditTrail=new ScoreAuditTrail(); const snapshotStore=new InMemorySnapshotStore(); const snapshotAdapter=new ScoreSnapshotAdapter({ snapshotStore }); const replayAdapter=new ScoreReplayAdapter(); const permissionRegistry=registerDefaultScoringPermissions(new ScoringPermissionRegistry()); const permissionGate=new ScoringPermissionGate({ registry:permissionRegistry }); const diagnostics=new ScoringDiagnostics({ diagnostics:c.resolve('diagnostics') }); const projectionRegistry=new ScoringProjectionRegistry().registerDefaults(); const runtime=Object.freeze({ createManifest:createPlaceholderScoringManifest, modelRegistry, versionRegistry, lifecycleManager, configurationRegistry, ScoringInputPackage, inputAdapterRegistry, normalizedValuationAdapter, ruleRegistry, componentRegistry, aggregationShell, artifactRegistry, auditTrail, snapshotStore, snapshotAdapter, replayAdapter, permissionRegistry, permissionGate, diagnostics, projectionRegistry }); const scoringTestHarness=new ScoringIntegrationHarness({ runtime }); const full=Object.freeze({ ...runtime, scoringTestHarness }); for(const [key,value] of Object.entries(full)) if(!c.has(key)) c.register(key,value); return full; }
