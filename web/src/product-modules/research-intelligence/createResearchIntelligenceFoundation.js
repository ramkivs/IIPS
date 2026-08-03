import { FlagStatus } from '../../../../../packages/feature-flags/src/index.js';
import { RESEARCH_INTELLIGENCE_FEATURE_FLAG } from './contracts/index.js';
import { ResearchTemplateRegistry, ResearchTemplateApplicator } from './templates/index.js';
import { ResearchSectionRegistry, AnalystNoteRegistry } from './sections/index.js';
import { ResearchReviewRegistry } from './review/index.js';
import { ResearchCollaborationService } from './collaboration/index.js';
import { ResearchChecklistService, ResearchCompletenessCheck } from './completeness/index.js';
import { ResearchQualityMetadataRegistry } from './quality/index.js';
import { EvidenceCandidateRegistry, ArtifactEvidencePreparationLinker } from './evidence-preparation/index.js';
import { ResearchIntelligenceProjectionRegistry } from './projections/index.js';
import { ResearchIntelligenceDiagnostics } from './diagnostics/index.js';
import { ResearchIntelligenceIntegrationHarness } from './testing/index.js';

export function createResearchIntelligenceFoundation({ app, researchRuntime } = {}) {
  const container=app.container;
  const featureFlagRegistry=container.resolve('featureFlagRegistry');
  if(!featureFlagRegistry.get(RESEARCH_INTELLIGENCE_FEATURE_FLAG)) featureFlagRegistry.register({ flag_id:RESEARCH_INTELLIGENCE_FEATURE_FLAG, default_enabled:true, owner:'research-intelligence', status:FlagStatus.active });
  const diagnostics=new ResearchIntelligenceDiagnostics({ diagnostics:container.resolve('diagnostics') });
  const sectionRegistry=new ResearchSectionRegistry({ diagnostics });
  const checklistService=new ResearchChecklistService({ diagnostics });
  const templateRegistry=new ResearchTemplateRegistry({ diagnostics });
  const templateApplicator=new ResearchTemplateApplicator({ sectionRegistry, checklistService, diagnostics });
  const analystNoteRegistry=new AnalystNoteRegistry({ diagnostics });
  const reviewRegistry=new ResearchReviewRegistry({ diagnostics });
  const collaborationService=new ResearchCollaborationService({ diagnostics });
  const completenessCheck=new ResearchCompletenessCheck({ ResearchCompletenessRuleVersion:'1.0.0' });
  const qualityMetadataRegistry=new ResearchQualityMetadataRegistry();
  const evidenceCandidateRegistry=new EvidenceCandidateRegistry({ diagnostics });
  const evidencePreparationLinker=new ArtifactEvidencePreparationLinker({ evidenceCandidateRegistry });
  const projectionRegistry=new ResearchIntelligenceProjectionRegistry().registerDefaults();
  const researchWorkflowDefinitionVersion=researchRuntime?.researchManifest?.workflowBindings?.[0]?.workflowVersion || '1.0.0';
  const runtime=Object.freeze({ researchWorkflowDefinitionVersion, diagnostics, templateRegistry, templateApplicator, sectionRegistry, checklistService, analystNoteRegistry, reviewRegistry, collaborationService, completenessCheck, qualityMetadataRegistry, evidenceCandidateRegistry, evidencePreparationLinker, projectionRegistry });
  const testHarness=new ResearchIntelligenceIntegrationHarness({ runtime });
  const full=Object.freeze({ ...runtime, researchIntelligenceTestHarness:testHarness });
  for(const [key,value] of Object.entries(full)) if(!container.has(key)) container.register(key,value);
  return full;
}
