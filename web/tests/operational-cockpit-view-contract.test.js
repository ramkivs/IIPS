import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createOperationalCockpitView,
  renderOperationalCockpitToHtml,
  createNavigationIntent,
  NavigationIntent,
  CockpitRoute
} from '../src/operational-cockpit/index.js';

const requiredRegions = [
  'topBar',
  'navigation',
  'portfolioHealth',
  'activeReviewQueue',
  'coverageLedger',
  'researchSnapshotDrawer',
  'humanReviewPanel',
  'governanceSidebar'
];

const requiredLandmarks = ['topbar', 'navigation', 'main', 'complementary', 'governance'];

test('OperationalCockpitView conforms to required view contract shape', () => {
  const view = createOperationalCockpitView();

  assert.equal(view.type, 'operational-cockpit-view');
  assert.equal(typeof view.version, 'string');
  assert.equal(typeof view.theme, 'object');
  assert.equal(typeof view.navigationState, 'object');
  assert.equal(typeof view.focusPlan, 'object');
  assert.equal(typeof view.regions, 'object');
  assert.equal(typeof view.interactions.applyNavigationIntent, 'function');
  assert.equal(typeof view.accessibility, 'object');
  assert.equal(Array.isArray(view.guardrails), true);
  for (const region of requiredRegions) assert.equal(Object.hasOwn(view.regions, region), true, `missing region ${region}`);
});

test('OperationalCockpitView exposes required accessibility surface', () => {
  const view = createOperationalCockpitView();

  for (const landmark of requiredLandmarks) assert.equal(view.accessibility.landmarks.includes(landmark), true, `missing landmark ${landmark}`);
  assert.equal(typeof view.accessibility.focusTarget, 'string');
  assert.equal(view.accessibility.keyboardRequired, true);
  assert.equal(view.accessibility.focusTarget, view.focusPlan.to);
});

test('OperationalCockpitView applyNavigationIntent returns a new valid view without domain mutation', () => {
  const view = createOperationalCockpitView();
  const next = view.interactions.applyNavigationIntent(createNavigationIntent(NavigationIntent.navigateToRoute, { route: CockpitRoute.evidence }));

  assert.notEqual(next, view);
  assert.equal(next.type, 'operational-cockpit-view');
  assert.equal(next.navigationState.currentRoute, CockpitRoute.evidence);
  assert.equal(next.regions.activeReviewQueue.component, 'ActiveReviewQueue');
  assert.equal(next.guardrails.some(guardrail => guardrail.includes('must not calculate')), true);
});

test('OperationalCockpitView renderer enforces rendering invariants', () => {
  const view = createOperationalCockpitView();
  const html = renderOperationalCockpitToHtml(view);

  assert.equal(html.includes('iips-cockpit'), true);
  assert.equal(html.includes('aria-label="Operational Cockpit Main"'), true);
  assert.equal(html.includes('<script>'), false);
  assert.throws(() => renderOperationalCockpitToHtml({ type: 'invalid-view' }), /OperationalCockpitView is required/);
});

test('OperationalCockpitView carries required ownership guardrails', () => {
  const view = createOperationalCockpitView();
  const guardrails = view.guardrails.join(' ').toLowerCase();

  for (const forbidden of ['business quality', 'valuation', 'review priority', 'evidence quality', 'queue health', 'research debt', 'governance decisions']) {
    assert.equal(guardrails.includes(forbidden), true, `missing guardrail for ${forbidden}`);
  }
});
