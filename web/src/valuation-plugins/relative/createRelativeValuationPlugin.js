import { InMemorySnapshotStore } from '../../../../../packages/snapshot-engine/src/index.js';
import { createRelativeValuationPluginManifest, RelativeValuationPluginManifestValidator } from './manifest/index.js';
import { RelativeValuationMethodRegistry } from './methods/index.js';
import { RelativeValuationExecutionAdapter } from './execution/index.js';
import { RelativeValuationOutputNormalizer } from './outputs/index.js';
import { RelativeValuationAuditTrail } from './audit/index.js';
import { RelativeValuationSnapshotAdapter } from './snapshots/index.js';
import { RelativeValuationReplayAdapter } from './replay/index.js';
import { RelativeValuationPermissionRegistry, RelativeValuationPermissionGate, registerDefaultRelativeValuationPermissions } from './permissions/index.js';
import { RelativeValuationDiagnostics } from './diagnostics/index.js';
import { RelativeValuationProjectionRegistry } from './projections/index.js';
import { RelativeValuationIntegrationHarness } from './testing/index.js';
export function createRelativeValuationPlugin({ app }={}){ const c=app.container; const manifest=createRelativeValuationPluginManifest(); new RelativeValuationPluginManifestValidator().validate(manifest); const methodRegistry=new RelativeValuationMethodRegistry(); const executionAdapter=new RelativeValuationExecutionAdapter(); const outputNormalizer=new RelativeValuationOutputNormalizer(); const auditTrail=new RelativeValuationAuditTrail(); const snapshotStore=new InMemorySnapshotStore(); const snapshotAdapter=new RelativeValuationSnapshotAdapter({ snapshotStore }); const replayAdapter=new RelativeValuationReplayAdapter(); const permissionRegistry=registerDefaultRelativeValuationPermissions(new RelativeValuationPermissionRegistry()); const permissionGate=new RelativeValuationPermissionGate({ registry:permissionRegistry }); const diagnostics=new RelativeValuationDiagnostics({ diagnostics:c.resolve('diagnostics') }); const projectionRegistry=new RelativeValuationProjectionRegistry().registerDefaults(); const runtime=Object.freeze({ manifest, methodRegistry, executionAdapter, outputNormalizer, auditTrail, snapshotStore, snapshotAdapter, replayAdapter, permissionRegistry, permissionGate, diagnostics, projectionRegistry }); const relativeValuationTestHarness=new RelativeValuationIntegrationHarness({ runtime }); const full=Object.freeze({ ...runtime, relativeValuationTestHarness }); for(const [key,value] of Object.entries(full)) if(!c.has(key)) c.register(key,value); return full; }
