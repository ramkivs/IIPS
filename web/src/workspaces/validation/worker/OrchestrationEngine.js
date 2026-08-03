export {
  createQueue,
  executeValidationRun
} from './ValidationWorker.js';

export const OrchestrationEngineResponsibility = Object.freeze({
  purpose: 'Orchestrate validation runs without owning validation logic.',
  owns: Object.freeze([
    'Dataset handoff',
    'Queue creation',
    'Worker pool execution',
    'Progress tracking',
    'Retry policy metadata',
    'Execution summary'
  ]),
  doesNotOwn: Object.freeze([
    'Feature validation rules',
    'Architecture drift checks',
    'Evidence confidence evaluation',
    'Release approval criteria'
  ])
});
