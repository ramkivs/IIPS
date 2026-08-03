export class ProductContextProjection { constructor(context){ this.context=deepFreeze({ ...context }); } snapshot(){ return this.context; } }
export class ProductContextPolicy { assertGeneric(context){ const text=JSON.stringify(context).toLowerCase(); for(const term of ['companyid','securityid','portfolioid','valuation','score']) if(text.includes(term)) throw new Error(`Product context contains investment-specific field: ${term}`); return true; } }
export class ProductContextBridge {
  constructor({ policy=new ProductContextPolicy() }={}){ this.policy=policy; }
  project({ productModuleId, workflowContext, permissions=[] }){ if(!productModuleId||!workflowContext) throw new Error('productModuleId and workflowContext are required'); this.policy.assertGeneric(workflowContext); const context={ productModuleId, workflowInstanceId:workflowContext.workflowInstanceId, workspaceId:workflowContext.activeWorkspace, subject:workflowContext.subject||null, selectedArtifacts:workflowContext.pinnedArtifacts||[], visiblePanels:[], permissions, lastUpdatedAt:new Date().toISOString() }; this.policy.assertGeneric(context); return new ProductContextProjection(context); }
  updateFromWorkflow(productProjection, workflowContext){ return this.project({ productModuleId:productProjection.snapshot().productModuleId, workflowContext, permissions:productProjection.snapshot().permissions }); }
  mutateWorkflowContext(){ throw new Error('Product context cannot directly mutate workflow context'); }
}
function deepFreeze(obj){ Object.freeze(obj); for(const v of Object.values(obj)) if(v&&typeof v==='object'&&!Object.isFrozen(v)) deepFreeze(v); return obj; }
