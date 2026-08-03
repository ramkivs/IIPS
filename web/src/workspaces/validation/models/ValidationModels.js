export const VALIDATION_WORKSPACE_VERSION = '1.0';
export const ValidationRunStatus = Object.freeze({ queued:'Queued', running:'Running', paused:'Paused', completed:'Completed', cancelled:'Cancelled', failed:'Failed' });
export const ValidationQueueStatus = Object.freeze({ queued:'Queued', running:'Running', completed:'Completed', review:'Review', failed:'Failed' });
export const ValidationReviewStatus = Object.freeze({ pass:'PASS', warning:'WARNING', fail:'FAIL' });
export const IssueSeverity = Object.freeze({ low:'Low', medium:'Medium', high:'High', critical:'Critical' });
export const IssueStatus = Object.freeze({ open:'Open', assigned:'Assigned', inProgress:'In Progress', resolved:'Resolved', closed:'Closed' });
export const IssueCategory = Object.freeze({ evidence:'Evidence', ui:'UI', logic:'Logic', performance:'Performance', accessibility:'Accessibility', source:'Source', rendering:'Rendering', regression:'Regression' });
export const ValidationGroup = Object.freeze({ largeCap:'Large Cap', midCap:'Mid Cap', smallCap:'Small Cap', microcap:'Microcap', banks:'Banks', insurance:'Insurance', capitalMarkets:'Capital Markets', hotels:'Hotels', healthcare:'Healthcare', industrials:'Industrials', utilities:'Utilities', consumer:'Consumer', edgeCases:'Edge Cases' });
export const ValidationRole = Object.freeze({ viewer:'Viewer', qaEngineer:'QA Engineer', releaseManager:'Release Manager', administrator:'Administrator' });
export const ExportFormat = Object.freeze({ csv:'CSV', excel:'Excel', pdf:'PDF', markdown:'Markdown', html:'HTML' });
export const ValidationScope = Object.freeze({ overview:'Overview', businessQuality:'Business Quality', valuation:'Valuation', investmentDecision:'Investment Decision' });

export const COMPANY_WORKSPACE_V1_CONTRACT = deepFreeze({
  release: 'Company Workspace v1.0',
  readOnly: true,
  featureViewContract: 'FeatureView',
  frozenExtensionNamespaces: ['quality','valuation','decision','risk','financials','portfolio','ai'],
  frozenEpics: ['Overview','Business Quality','Valuation','Investment Decision'],
  guardrailSemanticsFrozen: true,
  workflow: ['Overview','Business Quality','Valuation','Investment Decision'],
  releaseRecords: [
    'COMPANY_WORKSPACE_OVERVIEW_v1.0_RELEASE.md',
    'COMPANY_WORKSPACE_BUSINESS_QUALITY_v1.0_RELEASE.md',
    'COMPANY_WORKSPACE_VALUATION_v1.0_RELEASE.md',
    'COMPANY_WORKSPACE_INVESTMENT_DECISION_v1.0_RELEASE.md',
    'COMPANY_WORKSPACE_v1.0_RELEASE.md'
  ],
  responsibilities: {
    Overview: 'Understand the business',
    'Business Quality': 'Assess the business',
    Valuation: 'Estimate and explain worth',
    'Investment Decision': 'Integrate evidence into an investor-controlled decision'
  },
  prohibitedMutations: ['Company Workspace architecture','FeatureView contract','Feature responsibilities','Workflow sequencing','Extension namespaces','Guardrail semantics','Release records']
});

export function createValidationDataset({ name='Demo Validation Dataset', owner='QA Engineer', companies=[] } = {}) {
  const now = '2026-07-23T00:00:00.000+05:30';
  return deepFreeze({ datasetId: stableId('VDATA', name), name, owner, createdAt: now, updatedAt: now, companies: companies.map(normalizeCompany) });
}

export function createValidationRun({ name='Company Workspace v1.0 Validation', releaseTarget='Company Workspace v1.0', dataset, scope=Object.values(ValidationScope), execution={} } = {}) {
  if (!dataset) throw new Error('Validation run requires a dataset');
  const now = '2026-07-23T00:00:00.000+05:30';
  return deepFreeze({ runId: stableId('VRUN', `${name}:${dataset.datasetId}`), name, releaseTarget, description:'Internal QA validation run', datasetId: dataset.datasetId, datasetName: dataset.name, companies: dataset.companies.length, startedAt: null, completedAt: null, createdAt: now, createdBy: 'QA Engineer', status: ValidationRunStatus.queued, scope, execution: { parallelWorkers: 2, retryFailed: true, stopOnFatalErrors: false, generateReport: true, autoArchive: false, maxRetries: 1, timeoutMs: 30000, ...execution } });
}

export function createIssue({ issue, severity=IssueSeverity.medium, company=null, feature=null, category=IssueCategory.evidence, assigned=null, status=IssueStatus.open } = {}) {
  return deepFreeze({ issueId: stableId('ISSUE', `${issue}:${company || ''}:${feature || ''}`), issue, severity, company, feature, category, assigned, status });
}

export function normalizeCompany(input) {
  return Object.freeze({ ticker: String(input.ticker || '').trim().toUpperCase(), company: input.company || input.name || 'Unknown Company', sector: input.sector || 'Unknown', industry: input.industry || 'Unknown', marketCap: input.marketCap || 'Unknown', validationGroup: input.validationGroup || inferValidationGroup(input), notes: input.notes || '' });
}

export function createDemoCompanies(count = 100) {
  const sectors = ['Consumer','Industrials','Healthcare','Utilities','Banks','Insurance','Capital Markets','Hotels'];
  const caps = ['Large Cap','Mid Cap','Small Cap','Microcap'];
  return Array.from({ length: count }, (_, index) => normalizeCompany({ ticker:`VAL${String(index + 1).padStart(3,'0')}`, company:`Validation Company ${index + 1}`, sector:sectors[index % sectors.length], industry:`${sectors[index % sectors.length]} Industry`, marketCap:caps[index % caps.length], validationGroup: index % 17 === 0 ? 'Edge Cases' : caps[index % caps.length] }));
}

function inferValidationGroup(input) { return input.marketCap || input.sector || 'Edge Cases'; }
function stableId(prefix, value) { return `${prefix}_${String(value).toUpperCase().replace(/[^A-Z0-9]+/g,'_').slice(0,48) || 'DEFAULT'}`; }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
