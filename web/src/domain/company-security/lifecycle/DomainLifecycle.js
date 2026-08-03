export class DomainLifecycleManager { transition(record,to){ if(!record) throw new Error('record is required'); return Object.freeze({ ...record, status:to, updatedAt:new Date().toISOString() }); }}
