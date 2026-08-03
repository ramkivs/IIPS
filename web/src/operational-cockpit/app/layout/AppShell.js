import { OperationalCockpitAdapter } from '../../contracts/adapters/OperationalCockpitAdapter.js';

export function createOperationalCockpitShell({ dto, selectedReviewItemId = null } = {}) {
  const adapter = new OperationalCockpitAdapter({ dto });
  const queue = adapter.getReviewQueue();
  const selected = selectedReviewItemId ? adapter.getSelectedReviewItem(selectedReviewItemId) : queue.items[0] ?? null;
  return deepFreeze({
    component: 'OperationalCockpitAppShell',
    regions: {
      topBar: { component: 'TopBar', cycleId: dto.cycleId, governanceVersion: dto.governanceState.governanceVersion },
      navigation: { component: 'Navigation', activeRoute: 'Dashboard' },
      main: {
        component: 'MainWorkspace',
        portfolioHealth: adapter.getPortfolioHealth(),
        reviewQueue: queue,
        coverageLedger: dto.coverageLedger,
        evidenceHealth: dto.evidenceHealth
      },
      drawer: { component: 'ResearchSnapshotDrawer', selectedReviewItem: selected },
      governance: { component: 'GovernanceSidebar', governanceState: adapter.getGovernanceState(), metrics: dto.metrics }
    },
    guardrail: 'Operational Cockpit renders approved DTOs and must not compute domain or governance semantics.'
  });
}

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
