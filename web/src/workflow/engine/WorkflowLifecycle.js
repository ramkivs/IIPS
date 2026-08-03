export const WorkflowLifecycleState = Object.freeze({ Registered: 'Registered', Started: 'Started', Active: 'Active', Paused: 'Paused', Resumed: 'Resumed', Completed: 'Completed', Cancelled: 'Cancelled', Failed: 'Failed' });

const allowed = Object.freeze({
  Registered: ['Started', 'Failed'],
  Started: ['Active', 'Paused', 'Completed', 'Cancelled', 'Failed'],
  Active: ['Paused', 'Completed', 'Cancelled', 'Failed'],
  Paused: ['Resumed', 'Cancelled', 'Failed'],
  Resumed: ['Active', 'Paused', 'Completed', 'Cancelled', 'Failed'],
  Completed: [],
  Cancelled: [],
  Failed: []
});

export class WorkflowLifecycle {
  transition(from, to) {
    if (!Object.values(WorkflowLifecycleState).includes(to)) throw new Error(`Invalid workflow lifecycle state: ${to}`);
    if (from && !(allowed[from] || []).includes(to)) throw new Error(`Invalid workflow transition: ${from} -> ${to}`);
    return to;
  }
}
