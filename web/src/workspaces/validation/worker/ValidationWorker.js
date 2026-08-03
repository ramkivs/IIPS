import { ValidationQueueStatus } from '../models/ValidationModels.js';
import { runCompanyWorkspaceReadOnly } from '../services/CompanyWorkspaceConsumer.js';
import { validateCompanyWorkspaceOutput } from '../validation-engine/ValidationEngine.js';

export function createQueue(dataset) {
  return deepFreeze(dataset.companies.map((company, index) => ({ queueId:`Q_${dataset.datasetId}_${index + 1}`, ticker:company.ticker, company:company.company, status:ValidationQueueStatus.queued, currentFeature:null, elapsedMs:0, warnings:0, errors:0, progress:0 })));
}

export function executeValidationRun({ run, dataset, workerCount = run?.execution?.parallelWorkers || 2 } = {}) {
  if (!run || !dataset) throw new Error('Validation execution requires run and dataset');
  const startedAt = '2026-07-23T00:00:00.000+05:30';
  const queue = createQueue(dataset);
  const results = dataset.companies.map((company, index) => {
    const output = runCompanyWorkspaceReadOnly(company);
    const validation = validateCompanyWorkspaceOutput(output);
    return deepFreeze({ ...queue[index], status: validation.overallStatus === 'PASS' ? ValidationQueueStatus.completed : ValidationQueueStatus.review, currentFeature:'Company Workspace v1.0', elapsedMs: 50 + (index % 7) * 10, warnings: validation.issues.length, errors: validation.guardrailViolations, progress:100, validation });
  });
  const completedAt = '2026-07-23T00:05:00.000+05:30';
  const passCount = results.filter(result => result.validation.overallStatus === 'PASS').length;
  const warningCount = results.length - passCount;
  const passRate = Math.round((passCount / results.length) * 100);
  return deepFreeze({
    run: { ...run, status:'Completed', startedAt, completedAt, passRate, durationMs: 300000 },
    workerPool: { configuredWorkers: workerCount, utilizedWorkers: Math.min(workerCount, dataset.companies.length), retryPolicy: { retry: run.execution.retryFailed, maxRetries: run.execution.maxRetries, timeoutMs: run.execution.timeoutMs, abortRules: run.execution.stopOnFatalErrors ? ['fatal'] : [] } },
    queue: results,
    summary: { companies: results.length, passed: passCount, warnings: warningCount, failures: 0, passRate, architectureDrift: false, guardrailViolations: results.reduce((sum, result) => sum + result.validation.guardrailViolations, 0), averageCompanyTimeMs: Math.round(results.reduce((sum, result) => sum + result.elapsedMs, 0) / results.length), slowestFeature:'Company Workspace v1.0', workerUtilization:'Simulated' }
  });
}

function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
