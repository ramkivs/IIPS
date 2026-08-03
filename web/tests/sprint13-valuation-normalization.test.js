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
import {
  VALUATION_NORMALIZATION_VERSION,
  CANONICAL_VALUATION_SCHEMA_VERSION,
  ValuationNormalizationEventType,
  ValuationNormalizationCommandType,
  validateNormalizationCommand,
  createNormalizationAuditIdentity,
  createCanonicalValuationResult,
  ValuationResultRegistry,
  ValuationResultVersionRegistry,
  ValuationPluginResultAdapterRegistry,
  DCFValuationResultAdapter,
  RelativeValuationResultAdapter,
  ValuationContributionRegistry,
  ValuationComparisonReadModel,
  ValuationConfidenceMetadata,
  ValuationArtifactProvenanceLink,
  ValuationResultAuditTrail,
  ValuationResultSnapshotAdapter,
  ValuationResultReplayAdapter,
  ValuationNormalizationPermissionRegistry,
  ValuationNormalizationPermissionGate,
  registerDefaultNormalizationPermissions,
  ValuationNormalizationDiagnostics,
  ValuationNormalizationTelemetry,
  ValuationNormalizationProjectionRegistry,
  createValuationNormalization
} from '../src/valuation-normalization/index.js';

function runtime(){ const app=createApp({ env:{ NODE_ENV:'test' } }); const shellRuntime=createApplicationShell({ app }); const workflowRuntime=createWorkflowPlatform({ app, shellRuntime }); const productRuntime=createProductModuleFramework({ app, workflowRuntime }); const researchRuntime=createResearchModuleFoundation({ app, productRuntime, workflowRuntime }); const researchIntelligenceRuntime=createResearchIntelligenceFoundation({ app, researchRuntime }); const evidenceRuntime=createEvidenceGovernanceFoundation({ app, researchIntelligenceRuntime }); const methodologyRuntime=createMethodologyFrameworkFoundation({ app, evidenceRuntime }); const companySecurityRuntime=createCompanySecurityDomainFoundation({ app, methodologyRuntime }); const valuationRuntime=createValuationFrameworkFoundation({ app, companySecurityRuntime, methodologyRuntime, evidenceRuntime }); const valuationPluginRuntime=createValuationPluginFoundation({ app, valuationRuntime }); const dcfRuntime=createDCFPlugin({ app, valuationRuntime, valuationPluginRuntime }); const relativeValuationRuntime=createRelativeValuationPlugin({ app, valuationRuntime, valuationPluginRuntime }); const valuationNormalizationRuntime=createValuationNormalization({ app, dcfRuntime, relativeValuationRuntime }); return { app, shellRuntime, dcfRuntime, relativeValuationRuntime, valuationNormalizationRuntime }; }

test('Normalization contracts define canonical versioning and reject recommendation commands', () => { assert.equal(VALUATION_NORMALIZATION_VERSION,'VALUATION_NORMALIZATION_VERSION_1.0'); assert.equal(CANONICAL_VALUATION_SCHEMA_VERSION,'CANONICAL_VALUATION_SCHEMA_1.0'); assert.equal(ValuationNormalizationEventType.ValuationResultNormalized,'ValuationResultNormalized'); assert.equal(validateNormalizationCommand(ValuationNormalizationCommandType.NormalizeValuationArtifact), true); assert.throws(()=>validateNormalizationCommand('CreateConsensusValue')); const audit=createNormalizationAuditIdentity({ valuationResultId:'VRES_1', valuationArtifactId:'VART_1', userId:'u1', correlationId:'CORR_1' }); assert.match(audit.normalizationActionId,/^VNORM_/); });

test('Canonical valuation result schema validates identity, versions, extensions and guardrails', () => { const result=createCanonicalValuationResult({ valuationArtifactId:'VART_1', companyId:'CMP_1', securityId:'SEC_1', currency:'INR', contributions:[], comparison:[], provenance:{}, confidence:{ allRequiredInputsPresent:true }, extensions:{ future:{} } }); assert.match(result.valuationResultId,/^VRES_/); assert.equal(result.normalizationVersion,VALUATION_NORMALIZATION_VERSION); assert.equal(result.canonicalSchemaVersion,CANONICAL_VALUATION_SCHEMA_VERSION); const registry=new ValuationResultRegistry(); registry.register(result); assert.throws(()=>registry.register(result)); assert.throws(()=>createCanonicalValuationResult({ valuationArtifactId:'VART_BAD', companyId:'CMP_1', securityId:'SEC_1', currency:'INR', recommendations:[] })); });

test('Valuation result version registry creates deterministic versions', () => { const result=createCanonicalValuationResult({ valuationArtifactId:'VART_1', companyId:'CMP_1', securityId:'SEC_1', currency:'INR' }); const versions=new ValuationResultVersionRegistry(); assert.equal(versions.createVersion(result).version,1); assert.equal(versions.createVersion(result).version,2); assert.equal(versions.list(result.valuationResultId).length,2); });

test('Adapter registry normalizes DCF and Relative artifacts with compatibility metadata', () => { const registry=new ValuationPluginResultAdapterRegistry(); const dcf=new DCFValuationResultAdapter(); const rel=new RelativeValuationResultAdapter(); registry.register(dcf); registry.register(rel); assert.equal(dcf.supportedPluginVersions.includes('1.0.0'), true); const dcfContribution=registry.normalize('DCF', { metadata:{ pluginVersion:'1.0.0', formulaVersion:'DCF_FORMULA_VERSION_1.0', executionId:'DCFEX_1' }, results:{ enterpriseValue:1000, equityValue:970, perShareValue:97, currency:'INR' }, assumptions:{ valuationInputPackageId:'VINP_1', evidenceRecordIds:['EVID_1'] }, diagnostics:{} }, 1); const relContribution=registry.normalize('RelativeValuation', { metadata:{ pluginVersion:'1.0.0', selectedMethod:'EV_EBITDA', outlierPolicy:'median', statisticalMethod:'median', executionId:'REL_1' }, results:{ selectedMultiple:10, enterpriseValue:1100, equityValue:1070, perShareValue:107, currency:'INR' }, assumptions:{ valuationInputPackageId:'VINP_2', evidenceRecordIds:['EVID_2'] }, diagnostics:{} }, 2); assert.equal(dcfContribution.method,'DCF'); assert.equal(relContribution.method,'RelativeValuation'); assert.equal(relContribution.contributionOrder,2); assert.throws(()=>registry.normalize('Unknown', {}, 1)); });

test('Contribution and comparison model preserves conflicts without consensus', () => { const registry=new ValuationContributionRegistry(); const dcf={ contributionId:'DCF_1', contributionOrder:1, method:'DCF', value:97, currency:'INR' }; const rel={ contributionId:'REL_1', contributionOrder:2, method:'RelativeValuation', value:107, currency:'INR' }; registry.add(dcf); registry.add(rel); const comparison=new ValuationComparisonReadModel().create(registry.list()); assert.equal(comparison.entries.length,2); assert.equal(comparison.entries[0].value,97); assert.equal(comparison.consensusValue, undefined); assert.throws(()=>registry.add({ contributionId:'BAD', method:'Consensus', value:102, currency:'INR', recommendation:'buy' })); });

test('Provenance and confidence metadata are structural only', () => { const link=new ValuationArtifactProvenanceLink({ sourceType:'DCF', sourceArtifactId:'DCFEX_1', sourceArtifactChecksum:'CHK_1', assumptionReference:'VINP_1', evidenceReference:['EVID_1'], methodologyReference:'MTH_1' }); assert.equal(link.sourceArtifactChecksum,'CHK_1'); const confidence=new ValuationConfidenceMetadata({ allRequiredInputsPresent:true, replaySuccessful:true, auditComplete:true, assumptionsComplete:true, methodologyValidated:true }); assert.equal(confidence.auditComplete,true); assert.throws(()=>new ValuationConfidenceMetadata({ investmentConviction:'high' })); });

test('Audit, snapshot and replay preserve normalized result state', () => { const { valuationNormalizationRuntime }=runtime(); const flow=valuationNormalizationRuntime.normalizationTestHarness.runFlow(); assert.match(flow.audit.normalizationActionId,/^VNORM_/); assert.equal(flow.snapshot.normalizationManifest.canonicalSchemaVersion,CANONICAL_VALUATION_SCHEMA_VERSION); assert.equal(flow.replay.contributions.length,2); assert.equal(JSON.stringify(flow.snapshot).toLowerCase().includes('recommendation'), false); });

test('Permissions, diagnostics and projections are governed', () => { const registry=registerDefaultNormalizationPermissions(new ValuationNormalizationPermissionRegistry()); const gate=new ValuationNormalizationPermissionGate({ registry }); assert.equal(gate.require('normalizeValuationArtifact'), true); assert.throws(()=>gate.require('missing')); assert.throws(()=>registry.register({ action:'scoreCompany' })); const diagnostics=new ValuationNormalizationDiagnostics({ telemetry:new ValuationNormalizationTelemetry() }); diagnostics.record('valuationResultsNormalized'); diagnostics.record('comparisonsCreated'); assert.equal(diagnostics.health().status,'Healthy'); assert.throws(()=>diagnostics.record('recommendationsProduced')); const projections=new ValuationNormalizationProjectionRegistry().registerDefaults(); assert.equal(projections.update('normalization.result', { type:ValuationNormalizationEventType.ValuationResultNormalized, payload:{ valuationResultId:'VRES_1' } }).lastEventType, ValuationNormalizationEventType.ValuationResultNormalized); });

test('Sprint 13 integrated flow normalizes DCF and Relative artifacts without consensus or decisions', () => { const { shellRuntime, valuationNormalizationRuntime }=runtime(); assert.equal(shellRuntime.shell.start('/').status,'mounted'); const flow=valuationNormalizationRuntime.normalizationTestHarness.runFlow(); valuationNormalizationRuntime.projectionRegistry.update('normalization.result', { type:ValuationNormalizationEventType.ValuationResultNormalized, payload:{ valuationResultId:flow.result.valuationResultId } }); valuationNormalizationRuntime.projectionRegistry.update('normalization.comparison', { type:ValuationNormalizationEventType.ValuationComparisonCreated, payload:{ valuationResultId:flow.result.valuationResultId } }); assert.equal(flow.result.contributions.length,2); assert.equal(flow.result.comparison.length,2); assert.equal(flow.result.consensusValue, undefined); assert.equal(valuationNormalizationRuntime.normalizationTestHarness.assertNoForbiddenNormalizationLogic(flow), true); const serialized=JSON.stringify(flow).toLowerCase(); for(const forbidden of ['consensus value','score company','buy recommendation','preferred method','portfolio action','decision automation']) assert.equal(serialized.includes(forbidden), false); });
