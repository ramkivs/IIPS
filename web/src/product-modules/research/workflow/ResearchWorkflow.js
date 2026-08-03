import { assertNoResearchIntelligence } from '../contracts/index.js';
export function createResearchWorkflowBinding({ workflowId, workflowVersion='1.0.0' } = {}) { if (!workflowId) throw new Error('workflowId is required'); return Object.freeze({ productModuleId:'research-module-foundation', workflowId, workflowVersion, supportedSteps:Object.freeze(['intake','review']), contextSubscriptions:Object.freeze(['activeWorkspace','activeStep','subject']), placeholderOnly:false }); }
export class ResearchWorkflowStepMap { constructor(steps=['intake','review']) { this.steps=Object.freeze(steps.slice()); } supports(step){ return this.steps.includes(step); } }
export class ResearchWorkflowContextAdapter { adapt(workflowContext) { assertNoResearchIntelligence(workflowContext, 'Research workflow context'); return Object.freeze({ workflowInstanceId:workflowContext.workflowInstanceId, workflowId:workflowContext.workflowId, activeStep:workflowContext.activeStep, activeWorkspace:workflowContext.activeWorkspace, subject:workflowContext.subject||null }); } mutateWorkflowContext(){ throw new Error('Research module cannot directly mutate workflow context'); } }
export class ResearchWorkflowAdapter { constructor({ workflowBinder, activityTimeline } = {}) { this.workflowBinder=workflowBinder; this.activityTimeline=activityTimeline; this.contextAdapter=new ResearchWorkflowContextAdapter(); }
  register(binding){ return this.workflowBinder.register(binding); }
  receiveContext(workflowContext){ return this.contextAdapter.adapt(workflowContext); }
  recordWorkflowLinkedAction(event){ return this.activityTimeline?.record?.(event); }}
export const ResearchWorkflowBinding = createResearchWorkflowBinding;
