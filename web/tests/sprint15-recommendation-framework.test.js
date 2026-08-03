import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/bootstrap/createApp.js';
import { createApplicationShell } from '../src/shell/index.js';
import { createWorkflowPlatform } from '../src/workflow/index.js';
import { createProductModuleFramework } from '../src/product/index.js';
import { createResearchModuleFoundation } from '../src/product-modules/research/index.js';
import { createResearchIntelligenceFoundation } from '../src/product-modules/research-intelligence/index.js';
import { createEvidenceGovernanceFoundation } from '../src/evidence/index.js';
import { createMethodologyFrameworkFoundation } from '../src/methodology-framework/index.js';
import { createCompanySecurityDomainFoundation } from '../src/domain/company-security/index.js';
import { createValuationFrameworkFoundation } from '../src/valuation-framework/index.js';
import { createValuationPluginFoundation } from '../src/valuation-plugins/index.js';
import { createDCFPlugin } from '../src/valuation-plugins/dcf/index.js';
import { createRelativeValuationPlugin } from '../src/valuation-plugins/relative/index.js';
import { createValuationNormalization } from '../src/valuation-normalization/index.js';
import { createScoringFramework } from '../src/scoring-framework/index.js';
import {
  RECOMMENDATION_SCHEMA_VERSION,
  RecommendationFrameworkEventType,
  RecommendationFrameworkCommandType,
  RecommendationDirection,
  validateRecommendationCommand,
  createRecommendationAuditIdentity,
  createRecommendationArtifact,
  RecommendationModelRegistry,
  createPlaceholderRecommendationManifest,
  RecommendationLifecycleManager,
  RecommendationConfigurationRegistry,
  ScoreArtifactRecommendationAdapter,
  RecommendationInputPackage,
  RecommendationPolicyRegistry,
  RecommendationPolicyEvaluator,
  RecommendationRationaleBuilder,
  RecommendationArtifactRegistry,
  RecommendationAuditTrail,
  RecommendationSnapshotAdapter,
  RecommendationReplayAdapter,
  RecommendationPermissionRegistry,
  RecommendationPermissionGate,
  registerDefaultRecommendationPermissions,
  RecommendationDiagnostics,
  RecommendationTelemetry,
  RecommendationProjectionRegistry,
  createRecommendationFramework
} from '../src/recommendation-framework/index.js';

function runtime(){ const app=createApp({ env:{ NODE_ENV:'test' } }); const shellRuntime=createApplicationShell({ app }); const workflowRuntime=createWorkflowPlatform({ app, shellRuntime }); const productRuntime=createProductModuleFramework({ app, workflowRuntime }); const researchRuntime=createResearchModuleFoundation({ app, productRuntime, workflowRuntime }); const researchIntelligenceRuntime=createResearchIntelligenceFoundation({ app, researchRuntime }); const evidenceRuntime=createEvidenceGovernanceFoundation({ app, researchIntelligenceRuntime }); const methodologyRuntime=createMethodologyFrameworkFoundation({ app, evidenceRuntime }); const companySecurityRuntime=createCompanySecurityDomainFoundation({ app, methodologyRuntime }); const valuationRuntime=createValuationFrameworkFoundation({ app, companySecurityRuntime, methodologyRuntime, evidenceRuntime }); const valuationPluginRuntime=createValuationPluginFoundation({ app, valuationRuntime }); const dcfRuntime=createDCFPlugin({ app, valuationRuntime, valuationPluginRuntime }); const relativeValuationRuntime=createRelativeValuationPlugin({ app, valuationRuntime, valuationPluginRuntime }); const valuationNormalizationRuntime=createValuationNormalization({ app, dcfRuntime, relativeValuationRuntime }); const scoringRuntime=createScoringFramework({ app, valuationNormalizationRuntime }); const recommendationRuntime=createRecommendationFramework({ app, scoringRuntime }); return { app, shellRuntime, scoringRuntime, recommendationRuntime }; }
function scoreArtifact(){ return { scoreArtifactId:'SART_1', scoreSchemaVersion:'SCORING_SCHEMA_VERSION_1.0', aggregation:{ aggregateScore:82 }, components:[{ componentId:'SCMP_1', normalizedValue:82 }] }; }

test('Recommendation contracts define schema, commands, directions and audit', () => { assert.equal(RECOMMENDATION_SCHEMA_VERSION,'RECOMMENDATION_SCHEMA_VERSION_1.0'); assert.equal(RecommendationFrameworkEventType.RecommendationArtifactCreated,'RecommendationArtifactCreated'); assert.equal(validateRecommendationCommand(RecommendationFrameworkCommandType.CreateRecommendationArtifact), true); assert.throws(()=>validateRecommendationCommand('GenerateOrder')); const audit=createRecommendationAuditIdentity({ recommendationArtifactId:'RECART_1', recommendationModelId:'RM_1', recommendationModelVersion:'1.0.0', userId:'u1', correlationId:'CORR_1' }); assert.match(audit.recommendationActionId,/^RACT_/); });

test('Recommendation artifact schema validates advisory directions and rejects decision language', () => { const rationale={ rationaleId:'RATL_1', inputs:{}, policiesApplied:[], supportingEvidence:[], rationaleItems:[] }; const artifact=createRecommendationArtifact({ recommendationModelId:'RM_1', recommendationModelVersion:'1.0.0', inputPackageId:'RINP_1', recommendationDirection:RecommendationDirection.constructive, rationale, confidence:{ auditComplete:true }, provenance:{} }); assert.match(artifact.recommendationArtifactId,/^RECART_/); assert.equal(artifact.recommendationSchemaVersion,RECOMMENDATION_SCHEMA_VERSION); assert.throws(()=>createRecommendationArtifact({ recommendationModelId:'RM_1', recommendationModelVersion:'1.0.0', inputPackageId:'RINP_1', recommendationDirection:'buy', rationale, confidence:{}, provenance:{} })); assert.throws(()=>createRecommendationArtifact({ recommendationModelId:'RM_1', recommendationModelVersion:'1.0.0', inputPackageId:'RINP_1', recommendationDirection:RecommendationDirection.neutral, rationale, confidence:{}, provenance:{}, trade:'BUY' })); });

test('Recommendation model registry, lifecycle and configuration work', () => { const registry=new RecommendationModelRegistry(); const manifest=createPlaceholderRecommendationManifest(); registry.register(manifest); assert.throws(()=>registry.register(manifest)); registry.update(manifest.recommendationModelId, manifest.recommendationModelVersion, { name:'Updated Recommendation Placeholder' }); registry.activate(manifest.recommendationModelId, manifest.recommendationModelVersion); assert.throws(()=>registry.update(manifest.recommendationModelId, manifest.recommendationModelVersion, { name:'No' })); const lifecycle=new RecommendationLifecycleManager(); lifecycle.initialize('RM_1'); lifecycle.transition('RM_1','Registered'); lifecycle.transition('RM_1','Validated'); lifecycle.transition('RM_1','Active'); assert.equal(lifecycle.status('RM_1').state,'Active'); const config=new RecommendationConfigurationRegistry().register({ recommendationModelId:'RM_1', recommendationModelVersion:'1.0.0', policySettings:{ constructiveThreshold:75 } }); assert.match(config.recommendationConfigurationId,/^RCFG_/); assert.throws(()=>new RecommendationConfigurationRegistry().register({ recommendationModelId:'RM_2', recommendationModelVersion:'1.0.0', policySettings:{ orderGeneration:true } })); });

test('Recommendation input adapter consumes score artifacts and rejects raw valuation artifacts', () => { const adapter=new ScoreArtifactRecommendationAdapter(); const input=adapter.adapt(scoreArtifact()); assert.equal(input.inputType,'score-artifact'); assert.equal(input.scoreArtifactId,'SART_1'); assert.throws(()=>adapter.adapt({ valuationResultId:'VRES_1' })); assert.throws(()=>adapter.rejectRawValuationArtifact()); const pkg=new RecommendationInputPackage({ recommendationModelId:'RM_1', recommendationModelVersion:'1.0.0', scoreInput:input, references:[{ inputType:'evidence-reference', evidenceRecordId:'EVID_1' }] }); assert.match(pkg.inputPackageId,/^RINP_/); });

test('Recommendation policies evaluate advisory directions and rationale is structured', () => { const policy=new RecommendationPolicyRegistry().register({ policyVersion:'1.0.0', policyName:'Score Policy', inputType:'score-artifact', allowedDirections:[RecommendationDirection.constructive, RecommendationDirection.neutral, RecommendationDirection.cautious, RecommendationDirection.insufficientInformation], provenance:{ owner:'test' }, evaluationRules:{ constructiveThreshold:75 } }); assert.match(policy.policyId,/^RPOL_/); const scoreInput=new ScoreArtifactRecommendationAdapter().adapt(scoreArtifact()); const inputPackage=new RecommendationInputPackage({ recommendationModelId:'RM_1', recommendationModelVersion:'1.0.0', scoreInput }); const evaluation=new RecommendationPolicyEvaluator().evaluate({ policy, inputPackage }); assert.equal(evaluation.recommendationDirection, RecommendationDirection.constructive); const rationale=new RecommendationRationaleBuilder().build({ inputs:{ scoreArtifactId:'SART_1' }, policiesApplied:[{ policyId:policy.policyId }], supportingEvidence:['EVID_1'], rationaleItems:[{ type:'score-threshold', direction:evaluation.recommendationDirection }] }); assert.match(rationale.rationaleId,/^RATL_/); assert.throws(()=>new RecommendationRationaleBuilder().build({ inputs:{}, policiesApplied:[], supportingEvidence:[], rationaleItems:[{ trade:'BUY' }] })); });

test('Recommendation artifact registry, audit, snapshot and replay work', () => { const { recommendationRuntime }=runtime(); const flow=recommendationRuntime.recommendationTestHarness.runFlow(); assert.match(flow.artifact.recommendationArtifactId,/^RECART_/); assert.match(flow.audit.recommendationActionId,/^RACT_/); assert.equal(flow.snapshot.recommendationManifest.recommendationSchemaVersion,RECOMMENDATION_SCHEMA_VERSION); assert.equal(flow.replay.recommendationDirection, flow.artifact.recommendationDirection); assert.equal(JSON.stringify(flow.snapshot).toLowerCase().includes('trade'), false); });

test('Recommendation permissions, diagnostics and projections are governed', () => { const registry=registerDefaultRecommendationPermissions(new RecommendationPermissionRegistry()); const gate=new RecommendationPermissionGate({ registry }); assert.equal(gate.require('createRecommendationArtifact'), true); assert.throws(()=>gate.require('missing')); assert.throws(()=>registry.register({ action:'generateOrder' })); const diagnostics=new RecommendationDiagnostics({ telemetry:new RecommendationTelemetry() }); diagnostics.record('recommendationArtifactsCreated'); diagnostics.record('policiesEvaluated'); assert.equal(diagnostics.health().status,'Healthy'); assert.throws(()=>diagnostics.record('ordersGenerated')); const projections=new RecommendationProjectionRegistry().registerDefaults(); assert.equal(projections.update('recommendation.artifact', { type:RecommendationFrameworkEventType.RecommendationArtifactCreated, payload:{ recommendationArtifactId:'RECART_1' } }).lastEventType, RecommendationFrameworkEventType.RecommendationArtifactCreated); });

test('Sprint 15 integrated flow creates recommendation artifact without decision or execution behavior', () => { const { shellRuntime, recommendationRuntime }=runtime(); assert.equal(shellRuntime.shell.start('/').status,'mounted'); const flow=recommendationRuntime.recommendationTestHarness.runFlow(); recommendationRuntime.projectionRegistry.update('recommendation.policy', { type:RecommendationFrameworkEventType.RecommendationPolicyEvaluated, payload:{ policyId:flow.policy.policyId } }); recommendationRuntime.projectionRegistry.update('recommendation.rationale', { type:RecommendationFrameworkEventType.RecommendationRationaleCreated, payload:{ rationaleId:flow.rationale.rationaleId } }); recommendationRuntime.projectionRegistry.update('recommendation.artifact', { type:RecommendationFrameworkEventType.RecommendationArtifactCreated, payload:{ recommendationArtifactId:flow.artifact.recommendationArtifactId } }); assert.equal(flow.artifact.recommendationDirection, RecommendationDirection.constructive); assert.equal(recommendationRuntime.recommendationTestHarness.assertNoForbiddenRecommendationLogic(flow), true); const serialized=JSON.stringify(flow).toLowerCase(); for(const forbidden of ['order generation','trade execution','position sizing','capital allocation','final approval','decision automation']) assert.equal(serialized.includes(forbidden), false); });
