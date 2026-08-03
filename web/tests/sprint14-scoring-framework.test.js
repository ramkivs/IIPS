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
import {
  SCORING_SCHEMA_VERSION,
  ScoringFrameworkEventType,
  ScoringFrameworkCommandType,
  ScoringComponentType,
  validateScoringCommand,
  createScoringAuditIdentity,
  createScoreArtifact,
  ScoringModelRegistry,
  createPlaceholderScoringManifest,
  ScoringLifecycleManager,
  ScoringConfigurationRegistry,
  NormalizedValuationResultScoringAdapter,
  ScoringInputPackage,
  ScoringRuleRegistry,
  ScoreComponentRegistry,
  ScoreAggregationShell,
  ScoreArtifactRegistry,
  ScoreAuditTrail,
  ScoreSnapshotAdapter,
  ScoreReplayAdapter,
  ScoringPermissionRegistry,
  ScoringPermissionGate,
  registerDefaultScoringPermissions,
  ScoringDiagnostics,
  ScoringTelemetry,
  ScoringProjectionRegistry,
  createScoringFramework
} from '../src/scoring-framework/index.js';

function runtime(){ const app=createApp({ env:{ NODE_ENV:'test' } }); const shellRuntime=createApplicationShell({ app }); const workflowRuntime=createWorkflowPlatform({ app, shellRuntime }); const productRuntime=createProductModuleFramework({ app, workflowRuntime }); const researchRuntime=createResearchModuleFoundation({ app, productRuntime, workflowRuntime }); const researchIntelligenceRuntime=createResearchIntelligenceFoundation({ app, researchRuntime }); const evidenceRuntime=createEvidenceGovernanceFoundation({ app, researchIntelligenceRuntime }); const methodologyRuntime=createMethodologyFrameworkFoundation({ app, evidenceRuntime }); const companySecurityRuntime=createCompanySecurityDomainFoundation({ app, methodologyRuntime }); const valuationRuntime=createValuationFrameworkFoundation({ app, companySecurityRuntime, methodologyRuntime, evidenceRuntime }); const valuationPluginRuntime=createValuationPluginFoundation({ app, valuationRuntime }); const dcfRuntime=createDCFPlugin({ app, valuationRuntime, valuationPluginRuntime }); const relativeValuationRuntime=createRelativeValuationPlugin({ app, valuationRuntime, valuationPluginRuntime }); const valuationNormalizationRuntime=createValuationNormalization({ app, dcfRuntime, relativeValuationRuntime }); const scoringRuntime=createScoringFramework({ app, valuationNormalizationRuntime }); return { app, shellRuntime, valuationNormalizationRuntime, scoringRuntime }; }
function normalizedResult(){ return { valuationResultId:'VRES_1', canonicalSchemaVersion:'CANONICAL_VALUATION_SCHEMA_1.0', companyId:'CMP_1', securityId:'SEC_1', contributions:[{ method:'DCF', value:97 }, { method:'RelativeValuation', value:107 }], comparison:[{ method:'DCF', value:97 }, { method:'RelativeValuation', value:107 }] }; }

test('Scoring contracts define schema, commands and audit identity', () => { assert.equal(SCORING_SCHEMA_VERSION,'SCORING_SCHEMA_VERSION_1.0'); assert.equal(ScoringFrameworkEventType.ScoreArtifactCreated,'ScoreArtifactCreated'); assert.equal(ScoringFrameworkCommandType.CreateScoreArtifact,'CreateScoreArtifact'); assert.equal(validateScoringCommand(ScoringFrameworkCommandType.AggregateScoreComponents), true); assert.throws(()=>validateScoringCommand('RecommendInvestment')); const audit=createScoringAuditIdentity({ scoringModelId:'SM_1', scoringModelVersion:'1.0.0', scoreArtifactId:'SART_1', userId:'u1', correlationId:'CORR_1' }); assert.match(audit.scoringActionId,/^SACT_/); });

test('Score artifact schema validates identity and rejects recommendation fields', () => { const artifact=createScoreArtifact({ scoringModelId:'SM_1', scoringModelVersion:'1.0.0', inputPackageId:'SINP_1', components:[], aggregation:{ aggregateScore:80, aggregationTrace:[] }, confidence:{ auditComplete:true } }); assert.match(artifact.scoreArtifactId,/^SART_/); assert.equal(artifact.scoreSchemaVersion,SCORING_SCHEMA_VERSION); assert.throws(()=>createScoreArtifact({ scoringModelId:'SM_1', scoringModelVersion:'1.0.0', inputPackageId:'SINP_1', components:[], aggregation:{ aggregateScore:80 }, recommendation:'buy' })); });

test('Scoring model registry, lifecycle and configuration work', () => { const registry=new ScoringModelRegistry(); const manifest=createPlaceholderScoringManifest(); registry.register(manifest); assert.throws(()=>registry.register(manifest)); registry.update(manifest.scoringModelId, manifest.scoringModelVersion, { name:'Updated Placeholder' }); registry.activate(manifest.scoringModelId, manifest.scoringModelVersion); assert.throws(()=>registry.update(manifest.scoringModelId, manifest.scoringModelVersion, { name:'No' })); const lifecycle=new ScoringLifecycleManager(); lifecycle.initialize('SM_1'); lifecycle.transition('SM_1','Registered'); lifecycle.transition('SM_1','Validated'); lifecycle.transition('SM_1','Active'); assert.equal(lifecycle.status('SM_1').state,'Active'); const config=new ScoringConfigurationRegistry().register({ scoringModelId:'SM_1', scoringModelVersion:'1.0.0', componentWeights:{ valuation:1 } }); assert.match(config.scoringConfigurationId,/^SCFG_/); assert.throws(()=>new ScoringConfigurationRegistry().register({ scoringModelId:'SM_2', scoringModelVersion:'1.0.0', componentWeights:{ recommendation:1 } })); });

test('Scoring input adapter accepts normalized result and rejects raw plugin artifacts', () => { const adapter=new NormalizedValuationResultScoringAdapter(); const input=adapter.adapt(normalizedResult()); assert.equal(input.inputType,'normalized-valuation-result'); assert.equal(input.valuationResultId,'VRES_1'); assert.throws(()=>adapter.adapt({ results:{ fairValue:100 } })); assert.throws(()=>adapter.rejectRawPluginArtifact()); const pkg=new ScoringInputPackage({ scoringModelId:'SM_1', scoringModelVersion:'1.0.0', normalizedValuationInput:input, references:[{ inputType:'evidence-reference', evidenceRecordId:'EVID_1' }] }); assert.match(pkg.inputPackageId,/^SINP_/); });

test('Scoring rules and components require provenance and identity', () => { const rules=new ScoringRuleRegistry(); const rule=rules.register({ ruleVersion:'1.0.0', ruleName:'Valuation Dispersion', inputType:'normalized-valuation-result', componentType:ScoringComponentType.valuation, provenance:{ originatingMethodology:'SCORING_FRAMEWORK_PLACEHOLDER', sourceEvidenceReference:'EVID_1', ruleVersion:'1.0.0', executionTimestamp:new Date().toISOString() }, executionPolicy:{ deterministic:true } }); assert.match(rule.ruleId,/^SRULE_/); assert.throws(()=>rules.register({ ruleVersion:'1.0.0', ruleName:'Bad Rule', inputType:'x', componentType:'x', provenance:{}, executionPolicy:{} })); const comps=new ScoreComponentRegistry(); const comp=comps.create({ componentSource:'normalized-valuation-result', componentWeightReference:'equal', componentType:ScoringComponentType.valuation, rawValue:10, normalizedValue:90, provenance:{ ruleId:rule.ruleId }, explanation:{ component:'dispersion', inputReferences:['VRES_1'], ruleExecuted:rule.ruleId, componentOutput:90 } }); assert.match(comp.componentId,/^SCMP_/); assert.throws(()=>comps.create({ componentSource:'x', componentWeightReference:'x', componentType:'valuation', rawValue:1, normalizedValue:1, provenance:{}, recommendation:'buy' })); });

test('Aggregation shell preserves intermediate components and produces score artifact only', () => { const comps=[{ componentId:'C1', componentVersion:'1.0.0', normalizedValue:80 }, { componentId:'C2', componentVersion:'1.0.0', normalizedValue:100 }]; const aggregation=new ScoreAggregationShell().aggregate(comps); assert.equal(aggregation.aggregateScore,90); assert.equal(aggregation.aggregationTrace.length,3); assert.equal(aggregation.rating, undefined); });

test('Audit, snapshot and replay reconstruct score artifact state', () => { const { scoringRuntime }=runtime(); const flow=scoringRuntime.scoringTestHarness.runFlow(); assert.match(flow.audit.scoringActionId,/^SACT_/); assert.equal(flow.snapshot.scoreManifest.scoringSchemaVersion,SCORING_SCHEMA_VERSION); assert.equal(flow.replay.aggregateScore, flow.aggregation.aggregateScore); assert.equal(JSON.stringify(flow.snapshot).toLowerCase().includes('recommendation'), false); });

test('Scoring permissions, diagnostics and projections are governed', () => { const registry=registerDefaultScoringPermissions(new ScoringPermissionRegistry()); const gate=new ScoringPermissionGate({ registry }); assert.equal(gate.require('createScoreComponent'), true); assert.throws(()=>gate.require('missing')); assert.throws(()=>registry.register({ action:'recommendInvestment' })); const diagnostics=new ScoringDiagnostics({ telemetry:new ScoringTelemetry() }); diagnostics.record('componentsCreated'); diagnostics.record('aggregationsCompleted'); assert.equal(diagnostics.health().status,'Healthy'); assert.throws(()=>diagnostics.record('recommendationsProduced')); const projections=new ScoringProjectionRegistry().registerDefaults(); assert.equal(projections.update('scoring.artifact', { type:ScoringFrameworkEventType.ScoreArtifactCreated, payload:{ scoreArtifactId:'SART_1' } }).lastEventType, ScoringFrameworkEventType.ScoreArtifactCreated); });

test('Sprint 14 integrated flow creates governed score artifact without recommendations', () => { const { shellRuntime, scoringRuntime }=runtime(); assert.equal(shellRuntime.shell.start('/').status,'mounted'); const flow=scoringRuntime.scoringTestHarness.runFlow(); scoringRuntime.projectionRegistry.update('scoring.component', { type:ScoringFrameworkEventType.ScoreComponentCreated, payload:{ componentId:flow.component.componentId } }); scoringRuntime.projectionRegistry.update('scoring.aggregation', { type:ScoringFrameworkEventType.ScoreAggregationCompleted, payload:{ aggregationId:flow.aggregation.aggregationId } }); scoringRuntime.projectionRegistry.update('scoring.artifact', { type:ScoringFrameworkEventType.ScoreArtifactCreated, payload:{ scoreArtifactId:flow.artifact.scoreArtifactId } }); assert.equal(flow.artifact.aggregation.aggregateScore > 0, true); assert.equal(scoringRuntime.scoringTestHarness.assertNoForbiddenScoringLogic(flow), true); const serialized=JSON.stringify(flow).toLowerCase(); for(const forbidden of ['buy recommendation','assign rating','portfolio action','decision automation','trade signal']) assert.equal(serialized.includes(forbidden), false); });
