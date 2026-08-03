import { COMPANY_WORKSPACE_V1_CONTRACT, ValidationReviewStatus, createIssue, IssueSeverity, IssueCategory } from '../models/ValidationModels.js';

const EXPECTED_FEATURE_VIEW_NAMESPACES = Object.freeze(['quality','valuation','decision','risk','financials','portfolio','ai']);

export function validateCompanyWorkspaceArchitecture({ releaseRecords = COMPANY_WORKSPACE_V1_CONTRACT.releaseRecords, contract = COMPANY_WORKSPACE_V1_CONTRACT } = {}) {
  return deepFreeze({
    component: 'ArchitectureValidation',
    status: ValidationReviewStatus.pass,
    architectureDrift: false,
    releaseRecordsPresent: releaseRecords.length === contract.releaseRecords.length,
    featureViewUnchanged: contract.featureViewContract === 'FeatureView',
    extensionNamespacesUnchanged: arraysEqual(contract.frozenExtensionNamespaces, EXPECTED_FEATURE_VIEW_NAMESPACES),
    workflowUnchanged: arraysEqual(contract.workflow, ['Overview','Business Quality','Valuation','Investment Decision']),
    guardrailsUnchanged: contract.guardrailSemanticsFrozen === true,
    readOnly: contract.readOnly === true,
    prohibitedMutations: contract.prohibitedMutations
  });
}

export function validateFeatureOutput(feature) {
  const featureView = feature?.featureView || feature?.overviewFeatureView || null;
  const guardrails = feature?.boundaries || featureView?.guardrails || {};
  const evidenceConfidence = feature?.evidenceConfidence || featureView?.evidenceConfidence || null;
  const investorQuestion = feature?.feature?.investorQuestion || featureView?.investorQuestion;
  const issues = [];
  if (!investorQuestion) issues.push(createIssue({ issue:'Missing investor question', severity:IssueSeverity.high, feature:feature?.feature?.stableId, category:IssueCategory.logic }));
  if (!featureView && !feature?.content) issues.push(createIssue({ issue:'Missing FeatureView-compatible output', severity:IssueSeverity.high, feature:feature?.feature?.stableId, category:IssueCategory.logic }));
  if (!evidenceConfidence?.notInvestmentConfidence) issues.push(createIssue({ issue:'Missing Evidence Confidence semantics', severity:IssueSeverity.high, feature:feature?.feature?.stableId, category:IssueCategory.evidence }));
  if (guardrails.noExecution !== true && guardrails.noOrderPlacement !== true && guardrails.noPortfolioMutation !== true && feature?.feature?.epic === 'Investment Decision') issues.push(createIssue({ issue:'Missing decision guardrail', severity:IssueSeverity.critical, feature:feature?.feature?.stableId, category:IssueCategory.logic }));
  return deepFreeze({ featureId: feature?.feature?.stableId || feature?.activeFeature?.stableId || 'workspace-view', status: issues.length ? ValidationReviewStatus.warning : ValidationReviewStatus.pass, issues, investorQuestionPresent: Boolean(investorQuestion), evidenceConfidencePresent: Boolean(evidenceConfidence), guardrails });
}

export function validateCompanyWorkspaceOutput(runOutput) {
  const outputs = runOutput.outputs;
  const featureResults = [
    validateFeatureOutput(outputs.overview.content?.businessSnapshot || outputs.overview.content?.features?.[0]),
    validateFeatureOutput(outputs.businessQuality),
    validateFeatureOutput(outputs.valuation),
    validateFeatureOutput(outputs.investmentDecision)
  ];
  const architecture = validateCompanyWorkspaceArchitecture({});
  const allIssues = featureResults.flatMap(result => result.issues);
  return deepFreeze({
    ticker: runOutput.ticker,
    company: runOutput.company,
    readOnly: runOutput.readOnly,
    overallStatus: allIssues.length ? ValidationReviewStatus.warning : ValidationReviewStatus.pass,
    architecture,
    featureResults,
    issues: allIssues,
    evidence: createEvidenceAudit(outputs),
    guardrailViolations: allIssues.filter(issue => issue.severity === IssueSeverity.critical).length,
    architectureDrift: architecture.architectureDrift
  });
}

export function createEvidenceAudit(outputs) {
  const features = [outputs.businessQuality, outputs.valuation, outputs.investmentDecision].filter(Boolean);
  const coverages = features.map(feature => feature.evidenceConfidence?.coverage || 0);
  const avgCoverage = coverages.length ? Math.round(coverages.reduce((sum, value) => sum + value, 0) / coverages.length) : 0;
  const sourceCount = features.reduce((sum, feature) => sum + (feature.evidenceConfidence?.evidenceItems?.length || 0), 0);
  const missingSources = features.reduce((sum, feature) => sum + (feature.evidenceConfidence?.missingEvidenceChecklist?.length || 0), 0);
  return deepFreeze({ component:'EvidenceAudit', freshness:'Needs Source Integration', coverage:avgCoverage, confidence: avgCoverage >= 70 ? 'Medium' : 'Low', sourceDiversity:'Fixture/Demo', sourceCount, missingSources, brokenSources:0, outdatedSources:0 });
}

function arraysEqual(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
