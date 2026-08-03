import { createOpaqueId, ID_PREFIXES } from '../../../../../packages/shared-types/src/index.js';
import { WorkflowEventType, createWorkflowEvent } from '../contracts/index.js';

export const NotificationType = Object.freeze({ info:'info', success:'success', warning:'warning', error:'error' });
export class NotificationStore { constructor() { this.items=[]; } add(notification) { const n=Object.freeze({ ...notification }); this.items.push(n); return n; } update(id, patch) { const i=this.items.findIndex(n=>n.notificationId===id); if (i<0) throw new Error(`Notification not found: ${id}`); this.items[i]=Object.freeze({ ...this.items[i], ...patch }); return this.items[i]; } unread() { return Object.freeze(this.items.filter(n=>!n.acknowledgedAt)); } read() { return Object.freeze(this.items.filter(n=>n.acknowledgedAt)); } list() { return Object.freeze(this.items.slice()); } }
export class NotificationPolicy { validate(notification) { if (!Object.values(NotificationType).includes(notification.type)) throw new Error(`Invalid notification type: ${notification.type}`); return true; } }

export class NotificationCenter {
  constructor({ store = new NotificationStore(), policy = new NotificationPolicy(), eventBus, diagnostics } = {}) { this.store=store; this.policy=policy; this.eventBus=eventBus; this.diagnostics=diagnostics; this.notificationFailures=0; }
  raise({ type = NotificationType.info, title, message, source = 'workflow', workflowInstanceId = null, user_id = 'system' } = {}) { try { if (!title || !message) throw new Error('title and message are required'); const notification={ notificationId:createOpaqueId(ID_PREFIXES.notification), type, title, message, source, workflowInstanceId, createdAt:new Date().toISOString(), acknowledgedAt:null }; this.policy.validate(notification); const stored=this.store.add(notification); const event=createWorkflowEvent({ type: WorkflowEventType.NotificationRaised, workflow_instance_id: workflowInstanceId, payload:{ notificationId: stored.notificationId, notificationType: stored.type, title: stored.title }, user_id, source:'NotificationCenter' }); this.eventBus?.publish(event); this.diagnostics?.record?.('notification.raised', { notificationId: stored.notificationId }); return stored; } catch (e) { this.notificationFailures++; throw e; } }
  acknowledge(notificationId) { return this.store.update(notificationId, { acknowledgedAt:new Date().toISOString() }); }
  fromWorkflowFailure({ workflowInstanceId, message }) { return this.raise({ type: NotificationType.error, title:'Workflow failure', message, source:'workflow', workflowInstanceId }); }
  healthMetrics() { return Object.freeze({ notificationFailures: this.notificationFailures }); }
}
