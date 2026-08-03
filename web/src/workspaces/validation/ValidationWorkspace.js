import { createValidationDataset, createValidationRun, createDemoCompanies, ValidationRunStatus, ValidationReviewStatus, IssueStatus, ValidationRole, ExportFormat, COMPANY_WORKSPACE_V1_CONTRACT } from './models/ValidationModels.js';
import { validationProfiles, ValidationTrigger, createDemoPortfolioHoldings } from './models/ValidationProfiles.js';
import { createDemoSnapshotComparisons } from './services/SnapshotComparisonService.js';
import { createDemoValidationHistories } from './services/ValidationHistoryService.js';
import { createInvestorReviewIntelligence } from './services/InvestorReviewIntelligenceService.js';
import { validateDataset, previewDataset } from './services/DatasetService.js';
import { executeValidationRun } from './worker/ValidationWorker.js';
import { createValidationReport } from './exporters/ValidationExporters.js';
import { validateCompanyWorkspaceArchitecture } from './validation-engine/ValidationEngine.js';

export function createValidationWorkspaceView({ workspaceId = 'validation', label = 'Validation' } = {}) {
  const dataset = createValidationDataset({ name:'Company Workspace v1.0 QA Dataset', owner:'QA Engineer', companies:createDemoCompanies(100) });
  const datasetValidation = validateDataset(dataset);
  const run = createValidationRun({ name:'Company Workspace v1.0 Release Candidate Validation', dataset, releaseTarget:'Company Workspace v1.0' });
  const execution = executeValidationRun({ run, dataset, workerCount: 4 });
  const report = createValidationReport({ execution });
  const architecture = validateCompanyWorkspaceArchitecture({});
  const portfolioHoldings = createDemoPortfolioHoldings();
  const materialChanges = createDemoSnapshotComparisons();
  const validationHistory = createDemoValidationHistories();
  const investorReviewIntelligence = createInvestorReviewIntelligence({ holdings: portfolioHoldings, materialChanges, validationHistory });

  return deepFreeze({
    type: 'validation-workspace',
    workspaceId,
    label,
    internalTool: true,
    investorFacing: false,
    version: '1.0',
    operationalIntelligenceVersion: '2.0-mvp',
    purpose: 'Internal QA platform for Company Workspace v1.0',
    readOnlyWithRespectToCompanyWorkspace: true,
    mustNotModify: COMPANY_WORKSPACE_V1_CONTRACT.prohibitedMutations,
    navigation: ['Home','Review Queue','Weekly Summary','Validation Runs','Validation Profiles','Datasets','Queue','Company Review','Feature Review','Evidence Audit','Issues','Reports','Release Approval'],
    validationProfiles,
    investorReviewIntelligence,
    reviewQueue: investorReviewIntelligence.reviewQueue,
    weeklySummary: investorReviewIntelligence.weeklySummary,
    reviewHistory: investorReviewIntelligence.reviewHistory,
    journalHandoff: investorReviewIntelligence.journalHandoff,
    queueHealth: investorReviewIntelligence.queueHealth,
    researchDebt: investorReviewIntelligence.researchDebt,
    portfolioDashboard: createPortfolioDashboard({ holdings: portfolioHoldings, materialChanges }),
    materialChanges,
    validationHistory,
    triggers: Object.values(ValidationTrigger),
    home: createHome({ execution, architecture, portfolioDashboard: createPortfolioDashboard({ holdings: portfolioHoldings, materialChanges }) }),
    validationRuns: createValidationRuns({ execution }),
    datasets: createDatasets({ dataset, datasetValidation }),
    queue: createQueueView(execution),
    companyReview: createCompanyReview(execution),
    featureReview: createFeatureReview(execution),
    evidenceAudit: createEvidenceAudit(execution),
    issues: createIssues(execution),
    reports: createReports(report),
    releaseApproval: createReleaseApproval(execution),
    filters: ['Status','Sector','Industry','Market Cap','Feature','Confidence','Warnings','Failures','Validation Group'],
    globalSearch: ['Ticker','Company','Feature','Issue','Run','Dataset'],
    exports: Object.values(ExportFormat),
    roles: Object.values(ValidationRole),
    notifications: ['Run Started','Run Completed','Run Failed','Approval Required','Report Generated'],
    businessLogic: false
  });
}

function createHome({ execution, architecture, portfolioDashboard }) { return Object.freeze({ investorQuestion:'What validation work requires attention?', widgets:{ validationRuns:{ pending:0, running:0, completed:1, failed:0 }, averagePassRate:execution.summary.passRate, averageConfidence:'Low', architectureDrift:architecture.architectureDrift, guardrailViolations:execution.summary.guardrailViolations, latestReleaseCandidate:execution.run.releaseTarget, portfolioNeedsReview: portfolioDashboard.needsReview, materialChanges: portfolioDashboard.materialChanges }, quickActions:['New Validation Run','Load Dataset','Resume Run','View Report','Release Approval','Portfolio Validation'] }); }
function createPortfolioDashboard({ holdings, materialChanges }) { const needsReview = materialChanges.filter(change => change.reviewStatus === 'Needs Review').length; return Object.freeze({ component:'PortfolioValidationDashboard', investorQuestion:'Which holdings require attention?', holdingsCount:holdings.length, stable:holdings.length - needsReview, needsReview, materialChanges:materialChanges.filter(change => change.materialChange).length, evidenceFreshness:96, averageConfidence:91, holdings, flaggedCompanies:materialChanges.filter(change => change.materialChange).map(change => ({ ticker:change.ticker, status:change.reviewStatus, changes:change.changes })) }); }
function createValidationRuns({ execution }) { return Object.freeze({ investorQuestion:'Which validation executions have been performed?', rows:[{ runId:execution.run.runId, name:execution.run.name, dataset:execution.run.datasetName, companies:execution.run.companies, started:execution.run.startedAt, completed:execution.run.completedAt, status:execution.run.status, passPercent:execution.run.passRate, duration:execution.run.durationMs, createdBy:execution.run.createdBy }], statuses:Object.values(ValidationRunStatus), newRunWizard:['Validation Name','Release Target','Description','Dataset','Validation Scope','Execution'] }); }
function createDatasets({ dataset, datasetValidation }) { return Object.freeze({ rows:[{ datasetName:dataset.name, companies:dataset.companies.length, created:dataset.createdAt, updated:dataset.updatedAt, owner:dataset.owner, validationGroups:Object.keys(datasetValidation.validationGroups).length }], openDataset:{ columns:['Ticker','Company','Sector','Industry','Market Cap','Validation Group','Notes'], rows:dataset.companies.slice(0,25) }, preview: previewDataset(dataset), validationGroups: Object.keys(datasetValidation.validationGroups) }); }
function createQueueView(execution) { return Object.freeze({ progress:{ bar:'████████████████████', percent:100, completed:execution.summary.companies, total:execution.summary.companies }, rows:execution.queue.slice(0,25).map(item => ({ company:item.company, status:item.status, currentFeature:item.currentFeature, elapsedTime:item.elapsedMs, warnings:item.warnings, errors:item.errors })) }); }
function createCompanyReview(execution) { const first = execution.queue[0]; return Object.freeze({ investorQuestion:'Did Company Workspace produce correct outputs?', header:{ ticker:first.ticker, company:first.company, sector:'Consumer', run:execution.run.runId, confidence:first.validation.evidence.confidence, overallStatus:first.validation.overallStatus }, epics:{ Overview:'PASS', 'Business Quality':'PASS', Valuation:'PASS', 'Investment Decision':'PASS' }, evidence:first.validation.evidence, buttons:['Approve','Needs Review','Reject'] }); }
function createFeatureReview(execution) { const features = ['CW-OV-001','CW-OV-002','CW-BQ-001','CW-BQ-008','CW-VAL-006','CW-ID-003']; return Object.freeze({ rows:features.map((feature, index) => ({ feature, passPercent:98 - index * 2, companiesTested:execution.summary.companies, failures:0, warnings:index, commonIssues:index ? ['Missing source provenance'] : [], examples:execution.queue.slice(0,2).map(item => item.ticker) })) }); }
function createEvidenceAudit(execution) { return Object.freeze({ purpose:'Evaluate evidence quality', metrics:['Freshness','Coverage','Confidence','Source Diversity','Broken Sources','Missing Sources','Outdated Sources'], charts:['Confidence Histogram','Freshness Trend','Source Distribution','Coverage by Feature'], summary:{ averageCoverage: execution.summary.passRate, brokenSources:0, missingSources: execution.queue.reduce((sum,item) => sum + item.validation.evidence.missingSources,0) } }); }
function createIssues(execution) { return Object.freeze({ rows:execution.queue.flatMap(item => item.validation.issues).map(issue => ({ issue:issue.issue, severity:issue.severity, company:issue.company, feature:issue.feature, category:issue.category, assigned:issue.assigned, status:issue.status })), categories:['Evidence','UI','Logic','Performance','Accessibility','Source','Rendering','Regression'], statuses:Object.values(IssueStatus) }); }
function createReports(report) { return Object.freeze({ generate:['Validation Report','Evidence Report','Feature Report','Company Report','Release Report'], formats:['PDF','HTML','Markdown','CSV'], latest:report }); }
function createReleaseApproval(execution) { return Object.freeze({ investorQuestion:'Can this release be approved?', summary:{ companies:execution.summary.companies, passed:execution.summary.passed, warnings:execution.summary.warnings, failures:execution.summary.failures, architectureDrift:execution.summary.architectureDrift, guardrailViolations:execution.summary.guardrailViolations, coverage:execution.summary.passRate, recommendation: execution.summary.guardrailViolations === 0 ? 'Approve for internal QA baseline' : 'Revalidate' }, actions:['Approve','Reject','Revalidate','Archive'] }); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
