import { InMemorySnapshotStore } from '../../../../../packages/snapshot-engine/src/index.js';
import { createDCFPluginManifest, DCFPluginManifestValidator } from './manifest/index.js';
import { DCFExecutionAdapter } from './execution/index.js';
import { DCFOutputNormalizer } from './outputs/index.js';
import { DCFAuditTrail } from './audit/index.js';
import { DCFSnapshotAdapter } from './snapshots/index.js';
import { DCFReplayAdapter } from './replay/index.js';
import { DCFPermissionRegistry, DCFPermissionGate, registerDefaultDCFPermissions } from './permissions/index.js';
import { DCFDiagnostics } from './diagnostics/index.js';
import { DCFProjectionRegistry } from './projections/index.js';
import { DCFIntegrationHarness } from './testing/index.js';
export function createDCFPlugin({ app }={}){ const c=app.container; const manifest=createDCFPluginManifest(); new DCFPluginManifestValidator().validate(manifest); const executionAdapter=new DCFExecutionAdapter(); const outputNormalizer=new DCFOutputNormalizer(); const auditTrail=new DCFAuditTrail(); const snapshotStore=new InMemorySnapshotStore(); const snapshotAdapter=new DCFSnapshotAdapter({ snapshotStore }); const replayAdapter=new DCFReplayAdapter(); const permissionRegistry=registerDefaultDCFPermissions(new DCFPermissionRegistry()); const permissionGate=new DCFPermissionGate({ registry:permissionRegistry }); const diagnostics=new DCFDiagnostics({ diagnostics:c.resolve('diagnostics') }); const projectionRegistry=new DCFProjectionRegistry().registerDefaults(); const runtime=Object.freeze({ manifest, executionAdapter, outputNormalizer, auditTrail, snapshotStore, snapshotAdapter, replayAdapter, permissionRegistry, permissionGate, diagnostics, projectionRegistry }); const dcfTestHarness=new DCFIntegrationHarness({ runtime }); const full=Object.freeze({ ...runtime, dcfTestHarness }); for(const [key,value] of Object.entries(full)) if(!c.has(key)) c.register(key,value); return full; }
