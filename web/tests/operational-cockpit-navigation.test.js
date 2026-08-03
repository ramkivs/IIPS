import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CockpitRoute,
  NavigationIntent,
  createNavigationState,
  createNavigationIntent,
  applyNavigationIntent,
  restoreNavigationState,
  createFocusPlan,
  focusForNavigationState,
  createKeyboardTraversal,
  createOperationalCockpitFixture,
  createCockpitCompositionHarness
} from '../src/operational-cockpit/index.js';

test('Navigation State Contract defines presentation-only route and selection state', () => {
  const state = createNavigationState({ currentRoute: CockpitRoute.reviewQueue, selectedReviewItemId: 'review-elecon', drawerOpen: true });

  assert.equal(state.contract, 'Navigation State Contract v1.0');
  assert.equal(state.currentRoute, CockpitRoute.reviewQueue);
  assert.equal(state.selectedReviewItemId, 'review-elecon');
  assert.equal(state.drawerOpen, true);
  assert.equal(state.ownsBusinessLogic, false);
  assert.equal(state.guardrail.includes('presentation state only'), true);
});

test('Navigation intents update route and selection without business semantics', () => {
  const initial = createNavigationState();
  const routeIntent = createNavigationIntent(NavigationIntent.navigateToRoute, { route: CockpitRoute.evidence });
  const routed = applyNavigationIntent(initial, routeIntent);
  const selectIntent = createNavigationIntent(NavigationIntent.selectReviewItem, { reviewItemId: 'review-kross' });
  const selected = applyNavigationIntent(routed, selectIntent);
  const closed = applyNavigationIntent(selected, createNavigationIntent(NavigationIntent.closeDrawer));

  assert.equal(routeIntent.businessEvent, false);
  assert.equal(routed.currentRoute, CockpitRoute.evidence);
  assert.equal(selected.selectedReviewItemId, 'review-kross');
  assert.equal(selected.drawerOpen, true);
  assert.equal(selected.focusTarget, 'research-snapshot-drawer-heading');
  assert.equal(closed.drawerOpen, false);
  assert.equal(closed.focusTarget, 'review-row-review-kross');
});

test('Navigation restoration preserves valid selected item and drops invalid selected item', () => {
  const saved = createNavigationState({ selectedReviewItemId: 'review-elecon', drawerOpen: true, focusTarget: 'research-snapshot-drawer-heading' });
  const restored = restoreNavigationState({ savedState: saved, availableReviewItemIds: ['review-elecon'] });
  const invalid = restoreNavigationState({ savedState: saved, availableReviewItemIds: ['review-kross'] });

  assert.equal(restored.selectedReviewItemId, 'review-elecon');
  assert.equal(restored.drawerOpen, true);
  assert.equal(invalid.selectedReviewItemId, null);
  assert.equal(invalid.drawerOpen, false);
  assert.equal(invalid.focusTarget, 'active-review-queue');
});

test('Navigation State Contract rejects invalid routes and unsupported intents', () => {
  assert.throws(() => createNavigationState({ currentRoute: 'BusinessLogicRoute' }), /Unsupported cockpit route/);
  assert.throws(() => createNavigationIntent('ComputePriority'), /Unsupported navigation intent/);
  assert.throws(() => applyNavigationIntent(createNavigationState(), { type: 'ComputePriority' }), /Unsupported navigation intent/);
});

test('Focus manager provides presentation-only focus plans and keyboard traversal', () => {
  const state = createNavigationState({ focusTarget: 'active-review-queue' });
  const plan = focusForNavigationState(state);
  const explicit = createFocusPlan({ from: 'active-review-queue', to: 'research-snapshot-drawer-heading', reason: 'row-selected' });
  const traversal = createKeyboardTraversal({ regions: ['navigation', 'main', 'drawer', 'governance'] });

  assert.equal(plan.to, 'active-review-queue');
  assert.equal(explicit.ownsBusinessLogic, false);
  assert.equal(traversal.next('main'), 'drawer');
  assert.equal(traversal.previous('main'), 'navigation');
});

test('Cockpit composition consumes Navigation State Contract for selected item and focus', () => {
  const dto = createOperationalCockpitFixture();
  const navigationState = createNavigationState({ currentRoute: CockpitRoute.reviewQueue, selectedReviewItemId: 'review-kross', drawerOpen: true, filterState: { priority: 'High' }, sortState: { field: 'ticker', direction: 'asc' } });
  const harness = createCockpitCompositionHarness({ dto, navigationState });

  assert.equal(harness.route, CockpitRoute.reviewQueue);
  assert.equal(harness.navigationState.selectedReviewItemId, 'review-kross');
  assert.equal(harness.focusPlan.to, 'main-heading');
  assert.equal(harness.regions.drawer.view.props['aria-label'].includes('KROSS'), true);
  assert.deepEqual(harness.localState.filterState, { priority: 'High' });
  assert.equal(harness.guardrails.some(guardrail => guardrail.includes('must not calculate review priority')), true);
});
