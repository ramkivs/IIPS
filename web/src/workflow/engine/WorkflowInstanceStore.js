export class WorkflowInstanceStore {
  #instances = new Map();
  save(instance) { this.#instances.set(instance.workflowInstanceId, Object.freeze({ ...instance })); return this.get(instance.workflowInstanceId); }
  get(workflowInstanceId) { return this.#instances.get(workflowInstanceId) || null; }
  list() { return Object.freeze([...this.#instances.values()]); }
  byStatus(status) { return Object.freeze(this.list().filter(i => i.status === status)); }
}
