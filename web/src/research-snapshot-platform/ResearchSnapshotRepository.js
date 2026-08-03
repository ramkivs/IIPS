import { InMemorySnapshotStore } from '../../../../packages/snapshot-engine/src/index.js';

export class ResearchSnapshotRepository {
  constructor({ snapshotStore = new InMemorySnapshotStore() } = {}) {
    this.snapshotStore = snapshotStore;
  }

  append(snapshot) { return this.snapshotStore.append(snapshot); }
  get(snapshotId) { return this.snapshotStore.get(snapshotId); }
  list() { return this.snapshotStore.list(); }

  listByCompany(companyId) {
    return this.list()
      .filter(snapshot => snapshot.subject.type === 'research-snapshot' && snapshot.subject.id === companyId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  latestPair(companyId) {
    const snapshots = this.listByCompany(companyId);
    if (snapshots.length < 2) return null;
    return Object.freeze({ previous: snapshots[snapshots.length - 2], current: snapshots[snapshots.length - 1] });
  }

  pointInTime({ companyId, asOf }) {
    return this.snapshotStore.pointInTime({ subject_id: companyId, as_of: asOf });
  }
}
