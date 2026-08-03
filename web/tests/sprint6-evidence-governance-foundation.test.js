import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/bootstrap/createApp.js';
import { createApplicationShell } from '../src/shell/index.js';
import { createWorkflowPlatform } from '../src/workflow/index.js';
import { createProductModuleFramework } from '../src/product/index.js';
import { createResearchModuleFoundation, ResearchDocumentType, ResearchArtifactType } from '../src/product-modules/research/index.js';
import { createResearchIntelligenceFoundation } from '../src/product-modules/research-intelligence/index.js';
import {
  EVIDENCE_FEATURE_FLAG,
  EvidenceEventType,
  EvidenceCommandType,
  EvidenceRecordStatus,
  EvidenceCertificationStatus,
  EvidenceSourceType,
  EvidencePermissionAction,
  EvidenceTraceLinkType,
  validateEvidenceCommand,
  createEvidenceAuditIdentity,
  stableHash,
  EvidenceProvenance,
  EvidenceSourceLineage,
  EvidenceLineageBuilder,
  EvidenceRegistry,
  EvidenceRecordFactory,
  EvidenceCertificationService,
  EvidenceReviewRegistry,
  EvidenceCorrectionService,
  EvidenceVersionDiff,
  EvidenceSnapshotAdapter,
  EvidenceReplayAdapter,
  EvidenceTraceabilityGraph,
  EvidencePermissionRegistry,
  EvidencePermissionGate,
  registerDefaultEvidencePermissions,
  EvidenceContributionRegistry,
  EvidenceProjectionRegistry,
  EvidenceDiagnostics,
  EvidenceTelemetry,
  createEvidenceGovernanceFoundation
} from '../src/evidence/index.js';

function runtime() {
  const app = createApp({ env: { NODE_ENV: 'test' } });
  const shellRuntime = createApplicationShell({ app });
  const workflowRuntime = createWorkflowPlatform({ app, shellRuntime });
  const productRuntime = createProductModuleFramework({ app, workflowRuntime });
  const researchRuntime = createResearchModuleFoundation({ app, productRuntime, workflowRuntime });
  const researchIntelligenceRuntime = createResearchIntelligenceFoundation({ app, researchRuntime });
  const evidenceRuntime = createEvidenceGovernanceFoundation({ app, researchIntelligenceRuntime });
  return { app, shellRuntime, workflowRuntime, productRuntime, researchRuntime, researchIntelligenceRuntime, evidenceRuntime };
}

function provenance() { return new EvidenceProvenance({ sourceType: EvidenceSourceType.evidenceCandidate, sourceId: 'ECAN_1', sourceLabel: 'Evidence candidate', capturedBy: 'u1' }); }
function candidate() { return Object.freeze({ evidenceCandidateId: 'ECAN_1', sourceArtifactId: 'RART_1', researchDocumentId: 'RDOC_1', workflowInstanceId: 'WFI_1', preparedByUserId: 'u1' }); }
function record(registry = new EvidenceRegistry()) { return new EvidenceRecordFactory().createFromCandidate({ candidate: candidate(), provenance: provenance(), registry, title: 'Governed evidence record' }); }

test('Evidence contracts define governance commands/events and reject investment commands', () => {
  assert.equal(EvidenceEventType.EvidenceCertified, 'EvidenceCertified');
  assert.equal(EvidenceCommandType.CertifyEvidence, 'CertifyEvidence');
  assert.equal(EvidenceRecordStatus.Certified, 'Certified');
  assert.equal(EvidenceCertificationStatus.Approved, 'Approved');
  assert.equal(EvidencePermissionAction.certifyEvidence, 'certifyEvidence');
  assert.equal(validateEvidenceCommand(EvidenceCommandType.CreateEvidenceRecord), true);
  assert.throws(() => validateEvidenceCommand('CalculateValuation'));
  const audit = createEvidenceAuditIdentity({ evidenceRecordId: 'EVID_1', evidenceVersionId: 'EVIDV_1', workflowInstanceId: 'WFI_1', sourceArtifactId: 'RART_1', researchDocumentId: 'RDOC_1', userId: 'u1', correlationId: 'CORR_1' });
  assert.match(audit.evidenceActionId, /^EACT_/);
  assert.equal(stableHash({ a: 1 }), stableHash({ a: 1 }));
});

test('Evidence Governance feature flag initializes consistently', () => {
  const { app } = runtime();
  assert.equal(app.container.resolve('featureFlagRegistry').get(EVIDENCE_FEATURE_FLAG).default_enabled, true);
});

test('Evidence provenance and source lineage require source metadata and reject analytical transformations', () => {
  const p = provenance();
  assert.match(p.provenanceId, /^EPROV_/);
  const lineage = new EvidenceSourceLineage({ provenance: p }).appendCustody({ userId: 'u2', action: 'reviewed source' });
  assert.equal(lineage.chainOfCustody.length, 1);
  const links = new EvidenceLineageBuilder().link({ sourceArtifactId: 'RART_1', researchDocumentId: 'RDOC_1', evidenceCandidateId: 'ECAN_1' });
  assert.equal(links.evidenceCandidateId, 'ECAN_1');
  assert.throws(() => new EvidenceProvenance({ sourceType: EvidenceSourceType.evidenceCandidate, sourceId: '', sourceLabel: 'Missing' }));
  assert.throws(() => new EvidenceProvenance({ sourceType: EvidenceSourceType.evidenceCandidate, sourceId: 'S1', sourceLabel: 'Source', transformations: [{ action: 'valuation' }] }));
});

test('Evidence registry creates records from candidates, queries lineage, and rejects forbidden fields', () => {
  const registry = new EvidenceRegistry();
  const r = record(registry);
  assert.match(r.evidenceRecordId, /^EVID_/);
  assert.match(r.evidenceVersionId, /^EVIDV_/);
  assert.equal(registry.byWorkflow('WFI_1').length, 1);
  assert.equal(registry.byDocument('RDOC_1').length, 1);
  assert.equal(registry.byArtifact('RART_1').length, 1);
  assert.equal(registry.byCandidate('ECAN_1').length, 1);
  assert.throws(() => registry.create({ title: 'Buy recommendation', source: {}, provenance: provenance(), workflowInstanceId: 'WFI_1', createdBy: 'u1' }));
});

test('Evidence certification lifecycle requires provenance, approval, authority identity, and content hash', () => {
  const registry = new EvidenceRegistry();
  const r = record(registry);
  const service = new EvidenceCertificationService({ registry });
  service.submit(r.evidenceRecordId);
  service.startReview(r.evidenceRecordId);
  service.approve(r.evidenceRecordId);
  assert.throws(() => service.certify(r.evidenceRecordId, { reviewDecision: 'approve-evidence-certification' }));
  const certified = service.certify(r.evidenceRecordId, { reviewDecision: 'approve-evidence-certification', certificationAuthorityId: 'AUTH_1', certificationPolicyVersion: '1.0.0' });
  assert.equal(certified.status, EvidenceRecordStatus.Certified);
  assert.equal(certified.certificationAuthorityId, 'AUTH_1');
  assert.equal(certified.certificationPolicyVersion, '1.0.0');
  assert.match(certified.contentHash, /^HASH_/);
  assert.throws(() => registry.update(r.evidenceRecordId, { title: 'mutate certified' }));
});

test('Evidence review workflow records certification decisions and rejects investment decisions', () => {
  const reviews = new EvidenceReviewRegistry();
  const review = reviews.start({ evidenceRecordId: 'EVID_1', reviewerUserId: 'reviewer' });
  assert.match(review.evidenceReviewId, /^EREV_/);
  assert.equal(reviews.decide(review.evidenceReviewId, 'approve-evidence-certification').status, 'Approved');
  assert.equal(reviews.complete(review.evidenceReviewId).status, 'Completed');
  const rejected = reviews.start({ evidenceRecordId: 'EVID_2' });
  assert.equal(reviews.decide(rejected.evidenceReviewId, 'reject-evidence-certification').status, 'Rejected');
  const correction = reviews.start({ evidenceRecordId: 'EVID_3' });
  assert.equal(reviews.decide(correction.evidenceReviewId, 'request-evidence-correction').status, 'CorrectionRequested');
  assert.throws(() => reviews.decide(correction.evidenceReviewId, 'recommend-buy'));
});

test('Evidence immutability and versioning preserve certified history and create correction versions', () => {
  const registry = new EvidenceRegistry();
  const r = record(registry);
  registry.markCertified(r.evidenceRecordId);
  const correction = new EvidenceCorrectionService({ registry }).correct(r.evidenceRecordId, { correctionReason: 'metadata-correction', patch: { description: 'Corrected metadata' } });
  assert.equal(correction.version, 2);
  assert.equal(registry.versionRegistry.byRecord(r.evidenceRecordId).length >= 2, true);
  const diff = new EvidenceVersionDiff().diff(r, correction);
  assert.equal(diff.changedFields.includes('description'), true);
  assert.throws(() => new EvidenceCorrectionService({ registry }).correct(r.evidenceRecordId, { patch: {} }));
});

test('Evidence snapshots include schema version, provenance, audit, append-only store, and replay state', () => {
  const { evidenceRuntime } = runtime();
  const r = record(evidenceRuntime.evidenceRegistry);
  evidenceRuntime.certificationService.submit(r.evidenceRecordId);
  evidenceRuntime.certificationService.startReview(r.evidenceRecordId);
  evidenceRuntime.certificationService.approve(r.evidenceRecordId);
  const certified = evidenceRuntime.certificationService.certify(r.evidenceRecordId, { reviewDecision: 'approve-evidence-certification', certificationAuthorityId: 'AUTH_1', certificationPolicyVersion: '1.0.0' });
  const result = evidenceRuntime.snapshotAdapter.create({ evidence: certified, auditTrail: [{ action: 'certified' }], platformVersion: '2.0.0' });
  assert.equal(result.evidenceManifest.snapshotSchemaVersion, 'EVIDENCE_SNAPSHOT_1.0');
  assert.equal(result.evidenceManifest.provenance.provenanceId, certified.provenance.provenanceId);
  assert.equal(evidenceRuntime.snapshotStore.list().length, 1);
  assert.throws(() => evidenceRuntime.snapshotStore.append(result.snapshot));
  const replay = evidenceRuntime.replayAdapter.replay(result.snapshot);
  assert.equal(replay.certificationStatus, EvidenceCertificationStatus.Certified);
});

test('Evidence traceability graph creates metadata-rich directional links and rejects interpretation labels', () => {
  const graph = new EvidenceTraceabilityGraph();
  const link = graph.link({ linkType: EvidenceTraceLinkType.evidenceToCandidate, fromId: 'EVID_1', toId: 'ECAN_1', createdBy: 'u1', relationshipReason: 'certified from candidate' });
  assert.match(link.traceLinkId, /^ETRC_/);
  assert.ok(link.relationshipCreatedAt);
  assert.equal(graph.downstream('EVID_1').length, 1);
  assert.equal(graph.upstream('ECAN_1').length, 1);
  assert.throws(() => graph.link({ linkType: 'invalid', fromId: 'A', toId: 'B', createdBy: 'u1', relationshipReason: 'x' }));
  assert.throws(() => graph.link({ linkType: EvidenceTraceLinkType.evidenceToCandidate, fromId: 'EVID_1', toId: 'ECAN_1', createdBy: 'u1', relationshipReason: 'supports buy recommendation' }));
});

test('Evidence permissions and contributions fail closed and reject investment permissions', () => {
  const { app } = runtime();
  const registry = registerDefaultEvidencePermissions(new EvidencePermissionRegistry());
  const gate = new EvidencePermissionGate({ registry });
  assert.equal(gate.require(EvidencePermissionAction.certifyEvidence), true);
  assert.throws(() => gate.require('missingEvidencePermission'));
  assert.throws(() => registry.register({ action: 'calculateValuation' }));
  const contributions = new EvidenceContributionRegistry({ featureFlagRegistry: app.container.resolve('featureFlagRegistry'), permissionGate: gate });
  contributions.register({ contributionId: 'certify-evidence', permission: EvidencePermissionAction.certifyEvidence });
  assert.equal(contributions.execute('certify-evidence').status, 'executed');
  app.container.resolve('featureFlagRegistry').register({ flag_id: 'disabled_evidence', default_enabled: false, owner: 'test', status: 'active' });
  contributions.register({ contributionId: 'blocked-evidence', featureFlag: 'disabled_evidence', permission: EvidencePermissionAction.viewEvidence });
  assert.equal(contributions.execute('blocked-evidence').status, 'blocked');
});

test('Evidence projections are read-only and reject unsupported investment events', () => {
  const registry = new EvidenceProjectionRegistry().registerDefaults();
  const state = registry.update('evidence.certification', { type: EvidenceEventType.EvidenceCertified, payload: { evidenceRecordId: 'EVID_1' } });
  assert.equal(state.lastEventType, EvidenceEventType.EvidenceCertified);
  const snapshot = registry.get('evidence.certification').snapshot();
  assert.equal(snapshot.definition.snapshotCompatible, true);
  assert.equal(snapshot.definition.projectionVersion, '1.0.0');
  assert.throws(() => { snapshot.state.lastEventType = 'mutated'; });
  assert.throws(() => registry.update('evidence.certification', { type: 'ValuationCalculated', payload: {} }));
});

test('Evidence diagnostics and harness enforce operational metrics and guardrails', () => {
  const diagnostics = new EvidenceDiagnostics({ telemetry: new EvidenceTelemetry() });
  diagnostics.record('evidenceRecordsCreated');
  diagnostics.record('evidenceCertified');
  diagnostics.record('evidenceSnapshotsCreated');
  assert.equal(diagnostics.health().status, 'Healthy');
  assert.throws(() => diagnostics.record('investmentReturns'));
  const { evidenceRuntime } = runtime();
  assert.equal(evidenceRuntime.evidenceTestHarness.assertNoForbiddenEvidenceLogic({ evidence: 'governance only' }), true);
  assert.throws(() => evidenceRuntime.evidenceTestHarness.assertNoForbiddenEvidenceLogic({ recommendation: 'buy' }));
});

test('Sprint 6 integrated flow governs evidence without investment analysis', () => {
  const { shellRuntime, workflowRuntime, researchRuntime, researchIntelligenceRuntime, evidenceRuntime } = runtime();
  assert.equal(shellRuntime.shell.start('/').status, 'mounted');
  const wf = workflowRuntime.workflowRegistry.list()[0];
  const started = workflowRuntime.workflowEngine.start({ workflowId: wf.workflowId, version: wf.version });
  const doc = researchRuntime.researchDocumentRegistry.create({ documentType: ResearchDocumentType.researchNote, title: 'Research note', workflowInstanceId: started.instance.workflowInstanceId, subject: { type: 'subject', id: 'SUB_1', label: 'Subject' } });
  const artifact = researchRuntime.researchArtifactRegistry.register({ artifactType: ResearchArtifactType.sourceReference, title: 'Source reference', workflowInstanceId: started.instance.workflowInstanceId, sourceReference: { sourceId: 'SRC_1', label: 'Reference' } });
  const candidate = researchIntelligenceRuntime.evidenceCandidateRegistry.create({ sourceArtifactId: artifact.researchArtifactId, researchDocumentId: doc.researchDocumentId, workflowInstanceId: started.instance.workflowInstanceId, rationale: 'Prepare source for evidence review.' });
  const result = evidenceRuntime.evidenceTestHarness.runFlow();
  evidenceRuntime.traceabilityGraph.link({ linkType: EvidenceTraceLinkType.evidenceToArtifact, fromId: result.certified.evidenceRecordId, toId: artifact.researchArtifactId, createdBy: 'u1', relationshipReason: 'source artifact lineage' });
  evidenceRuntime.traceabilityGraph.link({ linkType: EvidenceTraceLinkType.evidenceDoc, fromId: result.certified.evidenceRecordId, toId: doc.researchDocumentId, createdBy: 'u1', relationshipReason: 'source doc lineage' });
  evidenceRuntime.projectionRegistry.update('evidence.registry', { type: EvidenceEventType.EvidenceRecordCreated, payload: { evidenceRecordId: result.record.evidenceRecordId } });
  evidenceRuntime.projectionRegistry.update('evidence.snapshot', { type: EvidenceEventType.EvidenceSnapshotCreated, payload: { snapshotId: result.snapshot.snapshot.snapshot_id } });
  assert.equal(result.certified.certificationStatus, EvidenceCertificationStatus.Certified);
  assert.equal(result.certified.contentHash.startsWith('HASH_'), true);
  assert.equal(result.snapshot.evidenceManifest.snapshotSchemaVersion, 'EVIDENCE_SNAPSHOT_1.0');
  assert.equal(evidenceRuntime.traceabilityGraph.downstream(result.certified.evidenceRecordId).length >= 3, true);
  const serialized = JSON.stringify({ result, candidate }).toLowerCase();
  for (const forbidden of ['discounted cash flow','stock scoring','buy recommendation','market data provider','assign rating','decision automation']) assert.equal(serialized.includes(forbidden), false);
});
