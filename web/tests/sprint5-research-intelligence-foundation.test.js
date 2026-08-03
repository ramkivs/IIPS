import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/bootstrap/createApp.js';
import { createApplicationShell } from '../src/shell/index.js';
import { createWorkflowPlatform } from '../src/workflow/index.js';
import { createProductModuleFramework } from '../src/product/index.js';
import { createResearchModuleFoundation, ResearchDocumentType, ResearchArtifactType } from '../src/product-modules/research/index.js';
import {
  RESEARCH_INTELLIGENCE_FEATURE_FLAG,
  ResearchIntelligenceEventType,
  ResearchIntelligenceCommandType,
  ResearchTemplateType,
  ResearchReviewStatus,
  ResearchChecklistItemStatus,
  EvidenceCandidateStatus,
  ResearchCollaborationRole,
  validateResearchIntelligenceCommand,
  createResearchActionAudit,
  createDefaultResearchTemplate,
  ResearchTemplateRegistry,
  ResearchTemplateApplicator,
  ResearchSectionRegistry,
  AnalystNoteRegistry,
  ResearchSectionLifecycleState,
  ResearchReviewRegistry,
  ResearchCollaborationService,
  ResearchChecklistService,
  ResearchCompletenessCheck,
  ResearchQualityMetadataRegistry,
  EvidenceCandidateRegistry,
  ArtifactEvidencePreparationLinker,
  ResearchIntelligenceProjectionRegistry,
  ResearchIntelligenceDiagnostics,
  ResearchIntelligenceTelemetry,
  ResearchIntelligenceIntegrationHarness,
  createResearchIntelligenceFoundation
} from '../src/product-modules/research-intelligence/index.js';

function runtime() {
  const app = createApp({ env: { NODE_ENV: 'test' } });
  const shellRuntime = createApplicationShell({ app });
  const workflowRuntime = createWorkflowPlatform({ app, shellRuntime });
  const productRuntime = createProductModuleFramework({ app, workflowRuntime });
  const researchRuntime = createResearchModuleFoundation({ app, productRuntime, workflowRuntime });
  const researchIntelligenceRuntime = createResearchIntelligenceFoundation({ app, researchRuntime });
  return { app, shellRuntime, workflowRuntime, productRuntime, researchRuntime, researchIntelligenceRuntime };
}

test('Research Intelligence contracts are process-only, versioned, and audited', () => {
  assert.equal(ResearchIntelligenceEventType.ResearchTemplateApplied, 'ResearchTemplateApplied');
  assert.equal(ResearchIntelligenceCommandType.ApplyResearchTemplate, 'ApplyResearchTemplate');
  assert.equal(ResearchTemplateType.companyResearchStructure, 'company-research-structure');
  assert.equal(ResearchCollaborationRole.ResearchReviewer, 'ResearchReviewer');
  assert.equal(validateResearchIntelligenceCommand(ResearchIntelligenceCommandType.RunCompletenessCheck), true);
  assert.throws(() => validateResearchIntelligenceCommand('CalculateValuation'));
  const audit = createResearchActionAudit({ workflowInstanceId: 'WFI_1', documentId: 'RDOC_1', userId: 'u1', correlationId: 'CORR_1' });
  assert.match(audit.researchActionId, /^RACT_/);
  assert.equal(audit.workflowInstanceId, 'WFI_1');
});

test('Research Intelligence feature flag initializes independently from Research module foundation', () => {
  const { app, researchIntelligenceRuntime } = runtime();
  assert.equal(app.container.resolve('featureFlagRegistry').get(RESEARCH_INTELLIGENCE_FEATURE_FLAG).default_enabled, true);
  assert.equal(researchIntelligenceRuntime.researchWorkflowDefinitionVersion, '1.0.0');
});

test('Research templates register, reject duplicates and analytical fields, and apply to document structure', () => {
  const sectionRegistry = new ResearchSectionRegistry();
  const checklistService = new ResearchChecklistService();
  const registry = new ResearchTemplateRegistry();
  const template = registry.register(createDefaultResearchTemplate());
  assert.equal(template.ResearchTemplateVersion, '1.0.0');
  assert.equal(template.ResearchChecklistVersion, '1.0.0');
  assert.throws(() => registry.register(template));
  assert.throws(() => registry.register(createDefaultResearchTemplate({ researchTemplateId: 'RTPL_BAD', name: 'Target price template' })));
  const applied = new ResearchTemplateApplicator({ sectionRegistry, checklistService }).apply({ template, researchDocumentId: 'RDOC_1', workflowInstanceId: 'WFI_1' });
  assert.equal(applied.sections.length > 0, true);
  assert.equal(applied.checklistItems.length > 0, true);
});

test('Research sections and analyst notes support lifecycle and reject investment language', () => {
  const sections = new ResearchSectionRegistry();
  const notes = new AnalystNoteRegistry();
  const section = sections.create({ researchDocumentId: 'RDOC_1', sectionType: 'overview', title: 'Overview', workflowInstanceId: 'WFI_1' });
  assert.match(section.researchSectionId, /^RSEC_/);
  assert.equal(sections.transition(section.researchSectionId, ResearchSectionLifecycleState.InReview).status, ResearchSectionLifecycleState.InReview);
  const note = notes.create({ researchDocumentId: 'RDOC_1', researchSectionId: section.researchSectionId, noteText: 'Source summary and open question.', linkedArtifactIds: ['RART_1'] });
  assert.match(note.analystNoteId, /^ANOTE_/);
  assert.equal(notes.update(note.analystNoteId, { noteText: 'Updated process observation.' }).noteText, 'Updated process observation.');
  assert.throws(() => notes.create({ researchDocumentId: 'RDOC_1', researchSectionId: section.researchSectionId, noteText: 'Buy recommendation.' }));
});

test('Research review lifecycle records process decisions and rejects investment decisions', () => {
  const reviews = new ResearchReviewRegistry();
  const review = reviews.start({ researchDocumentId: 'RDOC_1', workflowInstanceId: 'WFI_1', reviewerUserId: 'reviewer', ResearchReviewPolicyVersion: '1.0.0' });
  assert.equal(review.ResearchReviewPolicyVersion, '1.0.0');
  assert.equal(reviews.submit(review.researchReviewId).status, ResearchReviewStatus.Submitted);
  assert.equal(reviews.returnForRevision(review.researchReviewId).status, ResearchReviewStatus.Returned);
  assert.equal(reviews.submit(review.researchReviewId).status, ResearchReviewStatus.Submitted);
  assert.equal(reviews.complete(review.researchReviewId).status, ResearchReviewStatus.Completed);
  assert.throws(() => reviews.recordDecision(review.researchReviewId, 'recommend-buy'));
});

test('Research collaboration supports comments/mentions and rejects investment recommendations', () => {
  const svc = new ResearchCollaborationService();
  const thread = svc.createThread({ targetType: 'research-section', targetId: 'RSEC_1' });
  const comment = svc.addComment({ threadId: thread.threadId, authorUserId: 'u1', commentText: 'Please verify source reference.', mentions: [{ userId: 'u2' }] });
  assert.match(comment.researchCommentId, /^RCOM_/);
  assert.equal(comment.mentions[0].userId, 'u2');
  assert.ok(svc.resolveThread(thread.threadId).resolvedAt);
  assert.throws(() => svc.addComment({ threadId: thread.threadId, commentText: 'Recommend buy.' }));
});

test('Checklist and completeness checks assess process readiness only', () => {
  const checklist = new ResearchChecklistService();
  const required = checklist.createItem({ researchDocumentId: 'RDOC_1', label: 'References linked', required: true, version: '1.0.0' });
  const openResult = new ResearchCompletenessCheck({ ResearchCompletenessRuleVersion: '1.0.0' }).run({ researchDocumentId: 'RDOC_1', sections: [], artifacts: [], checklistItems: [required], review: null });
  assert.equal(openResult.processComplete, false);
  assert.equal(openResult.ResearchCompletenessRuleVersion, '1.0.0');
  checklist.completeItem(required.checklistItemId);
  const completeResult = new ResearchCompletenessCheck().run({ researchDocumentId: 'RDOC_1', sections: [{ id: 's' }], artifacts: [{ id: 'a' }], checklistItems: checklist.byDocument('RDOC_1'), review: { status: 'Completed' } });
  assert.equal(completeResult.processComplete, true);
  assert.equal(JSON.stringify(completeResult).toLowerCase().includes('investment'), false);
});

test('Quality-control metadata describes research process quality only', () => {
  const registry = new ResearchQualityMetadataRegistry();
  const meta = registry.create({ researchDocumentId: 'RDOC_1', sourceCount: 2, openQuestionCount: 1, requiredSectionCoverage: 0.8 });
  assert.equal(meta.sourceCount, 2);
  const updated = registry.update('RDOC_1', { completedChecklistCount: 3, reviewCompletionStatus: 'Completed' });
  assert.equal(updated.completedChecklistCount, 3);
  assert.throws(() => registry.update('RDOC_1', { investmentScore: 90 }));
  assert.throws(() => { registry.snapshot('RDOC_1').sourceCount = 100; });
});

test('Evidence candidates prepare artifacts without certification or analytical outputs', () => {
  const registry = new EvidenceCandidateRegistry();
  const candidate = registry.create({ sourceArtifactId: 'RART_1', researchDocumentId: 'RDOC_1', workflowInstanceId: 'WFI_1', preparedByUserId: 'u1', rationale: 'Source reference may support future evidence review.' });
  assert.match(candidate.evidenceCandidateId, /^ECAN_/);
  assert.equal(candidate.certified, false);
  const linked = new ArtifactEvidencePreparationLinker({ evidenceCandidateRegistry: registry }).linkCandidate(candidate.evidenceCandidateId);
  assert.equal(linked.status, EvidenceCandidateStatus.Linked);
  assert.equal(registry.readyForReview(candidate.evidenceCandidateId).status, EvidenceCandidateStatus.ReadyForReview);
  assert.throws(() => registry.certify(candidate.evidenceCandidateId));
  assert.throws(() => registry.create({ sourceArtifactId: 'RART_1', researchDocumentId: 'RDOC_1', workflowInstanceId: 'WFI_1', rationale: 'Valuation supports buy recommendation.' }));
});

test('Research Intelligence projections are snapshot-compatible read models', () => {
  const registry = new ResearchIntelligenceProjectionRegistry().registerDefaults();
  const state = registry.update('ri.templates', { type: ResearchIntelligenceEventType.ResearchTemplateApplied, payload: { researchDocumentId: 'RDOC_1' } });
  assert.equal(state.lastEventType, ResearchIntelligenceEventType.ResearchTemplateApplied);
  const snapshot = registry.get('ri.templates').snapshot();
  assert.equal(snapshot.definition.snapshotCompatible, true);
  assert.equal(snapshot.definition.projectionVersion, '1.0.0');
  assert.throws(() => { snapshot.state.lastEventType = 'mutated'; });
  assert.throws(() => registry.update('ri.templates', { type: 'ValuationCalculated', payload: {} }));
});

test('Research Intelligence diagnostics record operational/process metrics only', () => {
  const diagnostics = new ResearchIntelligenceDiagnostics({ telemetry: new ResearchIntelligenceTelemetry() });
  diagnostics.record('templatesApplied');
  diagnostics.record('sectionsCreated');
  diagnostics.record('reviewsCompleted');
  diagnostics.record('completenessChecksRun');
  const health = diagnostics.health();
  assert.equal(health.status, 'Healthy');
  assert.equal(health.metrics.templatesApplied, 1);
  assert.throws(() => diagnostics.record('investmentReturns'));
});

test('Research Intelligence harness catches forbidden investment logic', () => {
  const { researchIntelligenceRuntime } = runtime();
  assert.equal(researchIntelligenceRuntime.researchIntelligenceTestHarness.assertNoForbiddenResearchIntelligence({ process: 'review readiness' }), true);
  assert.throws(() => researchIntelligenceRuntime.researchIntelligenceTestHarness.assertNoForbiddenResearchIntelligence({ recommendation: 'buy' }));
});

test('Sprint 5 integrated flow validates process intelligence without investment analysis', () => {
  const { shellRuntime, workflowRuntime, researchRuntime, researchIntelligenceRuntime } = runtime();
  assert.equal(shellRuntime.shell.start('/').status, 'mounted');
  const workflowDef = workflowRuntime.workflowRegistry.list()[0];
  const started = workflowRuntime.workflowEngine.start({ workflowId: workflowDef.workflowId, version: workflowDef.version });
  assert.equal(shellRuntime.shell.navigate('/research').status, 'mounted');
  const doc = researchRuntime.researchDocumentRegistry.create({ documentType: ResearchDocumentType.researchNote, title: 'Research note', workflowInstanceId: started.instance.workflowInstanceId, subject: { type: 'subject', id: 'SUB_1', label: 'Subject' } });
  const artifact = researchRuntime.researchArtifactRegistry.register({ artifactType: ResearchArtifactType.sourceReference, title: 'Source reference', workflowInstanceId: started.instance.workflowInstanceId, sourceReference: { sourceId: 'SRC_1', label: 'Reference' } });
  researchRuntime.researchArtifactRegistry.link(artifact.researchArtifactId, doc.researchDocumentId);
  const result = researchIntelligenceRuntime.researchIntelligenceTestHarness.runFlow({ researchDocumentId: doc.researchDocumentId, workflowInstanceId: started.instance.workflowInstanceId });
  const candidate = researchIntelligenceRuntime.evidenceCandidateRegistry.create({ sourceArtifactId: artifact.researchArtifactId, researchDocumentId: doc.researchDocumentId, workflowInstanceId: started.instance.workflowInstanceId, rationale: 'Prepare source for future evidence review.' });
  researchIntelligenceRuntime.evidencePreparationLinker.linkCandidate(candidate.evidenceCandidateId);
  workflowRuntime.activityTimeline.record({ type: ResearchIntelligenceEventType.ResearchCompletenessChecked, workflow_instance_id: started.instance.workflowInstanceId, payload: { researchDocumentId: doc.researchDocumentId }, event_id: 'EVT_RI', timestamp: new Date().toISOString(), source: 'ResearchIntelligenceFoundation' });
  assert.equal(result.completeness.processComplete, true);
  const serialized = JSON.stringify({ result, candidate }).toLowerCase();
  for (const forbidden of ['discounted cash flow','stock scoring','buy recommendation','market data provider','assign rating','decision automation']) assert.equal(serialized.includes(forbidden), false);
});
