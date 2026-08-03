import { assertNoResearchIntelligence } from '../contracts/index.js';
export function ResearchWorkspaceEmptyState() { return Object.freeze({ type:'research-empty-state', message:'No research document selected.', businessLogic:false }); }
export function ResearchWorkspaceNavigationModel() { return Object.freeze([{ id:'documents', label:'Documents' }, { id:'artifacts', label:'Artifacts' }, { id:'activity', label:'Activity' }]); }
export function ResearchWorkspaceLayout({ context=null, documents=[], artifacts=[], activity=[] } = {}) {
  const layout = Object.freeze({
    type:'research-workspace-layout', role:'main', ariaLabel:'Research workspace', businessLogic:false,
    regions:Object.freeze({
      header:Object.freeze({ role:'banner', title:'Research Workspace' }),
      researchNavigation:Object.freeze({ role:'navigation', items:ResearchWorkspaceNavigationModel() }),
      documentOutline:Object.freeze({ role:'region', ariaLabel:'Research document outline', documents:Object.freeze(documents.slice()) }),
      artifactPanel:Object.freeze({ role:'region', ariaLabel:'Research artifacts', artifacts:Object.freeze(artifacts.slice()) }),
      contextPanel:Object.freeze({ role:'region', ariaLabel:'Research context', context }),
      activityPanel:Object.freeze({ role:'region', ariaLabel:'Research activity', activity:Object.freeze(activity.slice()) }),
      emptyState:ResearchWorkspaceEmptyState()
    })
  });
  assertNoResearchIntelligence(layout, 'Research workspace');
  return layout;
}
export class ResearchWorkspace { constructor({ diagnostics } = {}) { this.diagnostics=diagnostics; }
  mount({ context=null, documents=[], artifacts=[], activity=[] } = {}) { this.diagnostics?.record?.('research.workspace.mounted', { workflowInstanceId:context?.workflowInstanceId||null }); return Object.freeze({ status:'mounted', surface:ResearchWorkspaceLayout({ context, documents, artifacts, activity }) }); }}
export const ResearchWorkspaceSurface = ResearchWorkspaceLayout;
