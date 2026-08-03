export {
  validateCompanyWorkspaceArchitecture,
  validateCompanyWorkspaceOutput,
  validateFeatureOutput,
  createEvidenceAudit
} from './ValidationEngine.js';

export const EvaluationEngineResponsibility = Object.freeze({
  purpose: 'Evaluate Company Workspace outputs and release readiness without orchestrating execution.',
  owns: Object.freeze([
    'Feature Validation',
    'Architecture Validation',
    'Evidence Validation',
    'UX Validation metadata',
    'Release Validation'
  ]),
  doesNotOwn: Object.freeze([
    'Dataset loading',
    'Queue management',
    'Worker execution',
    'Retry policy',
    'Report generation orchestration'
  ])
});
