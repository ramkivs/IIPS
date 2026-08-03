import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createOperationalCockpitView,
  renderOperationalCockpitToHtml,
  createNavigationIntent,
  NavigationIntent,
  CockpitRoute
} from '../src/operational-cockpit/index.js';

test('Operational Cockpit View assembles all MVP regions from fixture DTOs', () => {
  const view = createOperationalCockpitView();

  assert.equal(view.type, 'operational-cockpit-view');
  assert.equal(view.regions.topBar.component, 'TopBar');
  assert.equal(view.regions.navigation.component, 'Navigation');
  assert.equal(view.regions.portfolioHealth.component, 'PortfolioHealthHero');
  assert.equal(view.regions.activeReviewQueue.component, 'ActiveReviewQueue');
  assert.equal(view.regions.coverageLedger.component, 'CoverageLedger');
  assert.equal(view.regions.researchSnapshotDrawer.component, 'ResearchSnapshotDrawer');
  assert.equal(view.regions.humanReviewPanel.component, 'HumanReviewPanel');
  assert.equal(view.regions.governanceSidebar.component, 'GovernanceSidebar');
  assert.equal(Object.isFrozen(view), true);
});

test('Operational Cockpit View renders navigable ES-module HTML without domain calculations', () => {
  const view = createOperationalCockpitView();
  const html = renderOperationalCockpitToHtml(view);

  assert.equal(html.includes('IIPS Operational Cockpit'), true);
  assert.equal(html.includes('Active Review Queue'), true);
  assert.equal(html.includes('Coverage Ledger'), true);
  assert.equal(html.includes('Research Snapshot'), true);
  assert.equal(html.includes('Operational Governance'), true);
  assert.equal(view.guardrails.some(guardrail => guardrail.includes('must not calculate')), true);
});

test('Operational Cockpit View applies navigation intents through presentation state only', () => {
  const view = createOperationalCockpitView();
  const next = view.interactions.applyNavigationIntent(createNavigationIntent(NavigationIntent.navigateToRoute, { route: CockpitRoute.reviewQueue }));

  assert.equal(next.navigationState.currentRoute, CockpitRoute.reviewQueue);
  assert.equal(next.regions.topBar.component, 'TopBar');
  assert.equal(next.guardrails.some(guardrail => guardrail.includes('consumes approved DTOs')), true);
});

test('Operational Cockpit HTML renderer escapes content and requires correct view type', () => {
  assert.throws(() => renderOperationalCockpitToHtml({ type: 'wrong' }), /OperationalCockpitView is required/);
  const html = renderOperationalCockpitToHtml(createOperationalCockpitView());
  assert.equal(html.includes('<script>'), false);
});
