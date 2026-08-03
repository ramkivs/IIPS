import { InMemorySnapshotStore } from '../../../../packages/snapshot-engine/src/index.js';
import { createCanonicalValuationResult } from './schema/index.js';
import { ValuationResultRegistry, ValuationResultVersionRegistry } from './registry/index.js';
import { ValuationPluginResultAdapterRegistry } from './adapters/index.js';
import { DCFValuationResultAdapter } from './adapters/dcf/index.js';
import { RelativeValuationResultAdapter } from './adapters/relative/index.js';
import { ValuationContributionRegistry } from './contributions/index.js';
import { ValuationComparisonReadModel } from './comparison/index.js';
import { ValuationResultAuditTrail } from './audit/index.js';
import { ValuationResultSnapshotAdapter } from './snapshots/index.js';
import { ValuationResultReplayAdapter } from './replay/index.js';
import { ValuationNormalizationPermissionRegistry, ValuationNormalizationPermissionGate, registerDefaultNormalizationPermissions } from './permissions/index.js';
import { ValuationNormalizationDiagnostics } from './diagnostics/index.js';
import { ValuationNormalizationProjectionRegistry } from './projections/index.js';
import { ValuationNormalizationIntegrationHarness } from './testing/index.js';

export function createValuationNormalization({ app }={}){
  const c=app.container;
  const resultRegistry=new ValuationResultRegistry();
  const versionRegistry=new ValuationResultVersionRegistry();
  const adapterRegistry=new ValuationPluginResultAdapterRegistry();
  adapterRegistry.register(new DCFValuationResultAdapter());
  adapterRegistry.register(new RelativeValuationResultAdapter());
  const contributionRegistry=new ValuationContributionRegistry();
  const comparisonReadModel=new ValuationComparisonReadModel();
  const auditTrail=new ValuationResultAuditTrail();
  const snapshotStore=new InMemorySnapshotStore();
  const snapshotAdapter=new ValuationResultSnapshotAdapter({ snapshotStore });
  const replayAdapter=new ValuationResultReplayAdapter();
  const permissionRegistry=registerDefaultNormalizationPermissions(new ValuationNormalizationPermissionRegistry());
  const permissionGate=new ValuationNormalizationPermissionGate({ registry:permissionRegistry });
  const diagnostics=new ValuationNormalizationDiagnostics({ diagnostics:c.resolve('diagnostics') });
  const projectionRegistry=new ValuationNormalizationProjectionRegistry().registerDefaults();
  const runtime=Object.freeze({ resultRegistry, versionRegistry, adapterRegistry, contributionRegistry, comparisonReadModel, auditTrail, snapshotStore, snapshotAdapter, replayAdapter, permissionRegistry, permissionGate, diagnostics, projectionRegistry, createResult:createCanonicalValuationResult });
  const normalizationTestHarness=new ValuationNormalizationIntegrationHarness({ runtime });
  const full=Object.freeze({ ...runtime, normalizationTestHarness });
  for(const [key,value] of Object.entries(full)) if(!c.has(key)) c.register(key,value);
  return full;
}
