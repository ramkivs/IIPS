import { FeatureGate } from '../../../../../packages/feature-flags/src/index.js';

export class WorkspaceStateProjection {
  constructor({ workspaceId }) { this.workspaceId = workspaceId; this.state = Object.freeze({}); }
  apply(context) { this.state = Object.freeze({ workspaceId: this.workspaceId, workflowInstanceId: context.workflowInstanceId, activeWorkspace: context.activeWorkspace, activeStep: context.activeStep, subject: context.subject || null, lastUpdatedAt: context.lastUpdatedAt }); return this.state; }
  getState() { return this.state; }
}

export class CrossWorkspaceStateBus {
  constructor({ featureFlagRegistry, environment = 'development', diagnostics } = {}) { this.featureGate = new FeatureGate({ registry: featureFlagRegistry, environment }); this.diagnostics = diagnostics; this.subscriptions = new Map(); }
  subscribe({ workspaceId, featureFlag, projection = new WorkspaceStateProjection({ workspaceId }) } = {}) {
    if (!workspaceId || !featureFlag) throw new Error('workspaceId and featureFlag are required');
    if (!this.featureGate.isEnabled(featureFlag)) return Object.freeze({ status: 'blocked', reason: 'feature_disabled', workspaceId });
    this.subscriptions.set(workspaceId, Object.freeze({ workspaceId, featureFlag, projection }));
    return Object.freeze({ status: 'subscribed', workspaceId, projection });
  }
  publishContext(context) {
    const updates = [];
    for (const sub of this.subscriptions.values()) updates.push(sub.projection.apply(context));
    this.diagnostics?.record?.('workflow.state.propagated', { workflowInstanceId: context.workflowInstanceId, subscribers: updates.length });
    return Object.freeze(updates);
  }
  mutateWorkspaceDirectly() { throw new Error('Direct workspace-to-workspace mutation is not supported'); }
}
