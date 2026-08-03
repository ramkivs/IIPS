import { createCockpitCompositionHarness } from '../composition/CockpitCompositionHarness.js';
import { createOperationalCockpitFixture } from '../../fixtures/operationalCockpitFixture.js';
import { createNavigationState, applyNavigationIntent } from '../navigation/index.js';
import { createTheme } from '../../design-system/runtime/index.js';

export function createOperationalCockpitView({ dto = createOperationalCockpitFixture(), navigationState = createNavigationState(), theme = createTheme() } = {}) {
  const harness = createCockpitCompositionHarness({ dto, navigationState });
  return deepFreeze({
    type: 'operational-cockpit-view',
    version: 'M4.3 Operational Views',
    theme,
    navigationState: harness.navigationState,
    focusPlan: harness.focusPlan,
    regions: {
      topBar: harness.regions.shell.regions.topBar,
      navigation: harness.regions.shell.regions.navigation,
      portfolioHealth: harness.regions.portfolioHero,
      activeReviewQueue: harness.regions.activeReviewQueue,
      coverageLedger: harness.regions.coverageLedger,
      researchSnapshotDrawer: harness.regions.drawer,
      humanReviewPanel: harness.regions.humanReviewPanel,
      governanceSidebar: harness.regions.governanceSidebar
    },
    interactions: {
      applyNavigationIntent: intent => createOperationalCockpitView({ dto, navigationState: applyNavigationIntent(harness.navigationState, intent), theme })
    },
    accessibility: {
      landmarks: ['topbar', 'navigation', 'main', 'complementary', 'governance'],
      focusTarget: harness.focusPlan.to,
      keyboardRequired: true
    },
    guardrails: [
      'OperationalCockpitView assembles approved components only.',
      'OperationalCockpitView must not calculate business quality, valuation, review priority, evidence quality, queue health, research debt, or governance decisions.',
      'OperationalCockpitView consumes approved DTOs and local presentation state only.'
    ]
  });
}

export function renderOperationalCockpitToHtml(view) {
  if (!view || view.type !== 'operational-cockpit-view') throw new Error('OperationalCockpitView is required');
  const health = view.regions.portfolioHealth;
  const queue = view.regions.activeReviewQueue;
  const ledger = view.regions.coverageLedger;
  const drawer = view.regions.researchSnapshotDrawer;
  const governance = view.regions.governanceSidebar;
  return `
<section class="iips-cockpit" data-version="${view.version}">
  <header class="iips-cockpit__topbar" aria-label="Top Bar">
    <strong>IIPS Operational Cockpit</strong>
    <span>${escapeHtml(view.regions.topBar.cycleId ?? 'Cycle')}</span>
  </header>
  <nav class="iips-cockpit__nav" aria-label="Primary Navigation">
    <span>${escapeHtml(view.navigationState.currentRoute)}</span>
  </nav>
  <main class="iips-cockpit__main" aria-label="Operational Cockpit Main">
    <section aria-label="Portfolio Health">${renderMetricGroup(health.metrics)}</section>
    <section aria-label="Active Review Queue">${renderQueue(queue)}</section>
    <section aria-label="Coverage Ledger">${renderLedger(ledger)}</section>
  </main>
  <aside class="iips-cockpit__drawer" aria-label="Research Snapshot Drawer">${renderDrawer(drawer)}</aside>
  <aside class="iips-cockpit__governance" aria-label="Governance Sidebar">${renderGovernance(governance)}</aside>
</section>`.trim();
}

function renderMetricGroup(group) {
  return `<div class="metric-group">${(group.children ?? []).map(card => `<div class="metric-card"><span>${escapeHtml(card.props.label ?? '')}</span><strong>${escapeHtml(card.props.value ?? '')}</strong></div>`).join('')}</div>`;
}

function renderQueue(queue) {
  if (queue.view.component === 'EmptyState') return `<div role="status">${escapeHtml(queue.view.props.title)}</div>`;
  const rows = queue.view.children ?? [];
  return `<table><tbody>${rows.map(row => `<tr data-id="${escapeHtml(row.id)}"><td>${escapeHtml(row.ticker)}</td><td>${escapeHtml(row.priority)}</td><td>${escapeHtml(row.reason)}</td></tr>`).join('')}</tbody></table>`;
}

function renderLedger(ledger) {
  return `<div>${escapeHtml(ledger.summary.totalRecords)} coverage records</div>`;
}

function renderDrawer(drawer) {
  if (!drawer) return '<div>No selected review item</div>';
  return `<div>${escapeHtml(drawer.view.props['aria-label'] ?? 'Research Snapshot')}</div>`;
}

function renderGovernance(governance) {
  return `<div>${escapeHtml(governance.inputs.governanceVersion)} — ${escapeHtml(governance.inputs.behaviorChangeState)}</div>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
}

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
