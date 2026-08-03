export const NAVIGATION_STATE_CONTRACT_VERSION = 'Navigation State Contract v1.0';

export const CockpitRoute = Object.freeze({
  dashboard: 'Dashboard',
  reviewQueue: 'ReviewQueue',
  portfolio: 'Portfolio',
  evidence: 'Evidence',
  humanReview: 'HumanReview',
  governance: 'Governance',
  reports: 'Reports',
  settings: 'Settings'
});

export const NavigationIntent = Object.freeze({
  navigateToRoute: 'NavigateToRoute',
  selectReviewItem: 'SelectReviewItem',
  openDrawer: 'OpenDrawer',
  closeDrawer: 'CloseDrawer',
  restoreState: 'RestoreState',
  updateFilter: 'UpdateFilter',
  updateSort: 'UpdateSort',
  returnToQueue: 'ReturnToQueue'
});

export function createNavigationState({
  currentRoute = CockpitRoute.dashboard,
  selectedView = CockpitRoute.dashboard,
  selectedReviewItemId = null,
  drawerOpen = false,
  activePanel = 'MainWorkspace',
  filterState = {},
  sortState = { field: 'priority', direction: 'asc' },
  focusTarget = 'main-heading'
} = {}) {
  validateRoute(currentRoute);
  validateRoute(selectedView);
  return deepFreeze({
    contract: NAVIGATION_STATE_CONTRACT_VERSION,
    currentRoute,
    selectedView,
    selectedReviewItemId,
    drawerOpen: Boolean(drawerOpen),
    activePanel,
    filterState: { ...filterState },
    sortState: { ...sortState },
    focusTarget,
    ownsBusinessLogic: false,
    guardrail: 'Navigation state is presentation state only and must not determine review lifecycle, priority, governance, evidence, or business workflow semantics.'
  });
}

export function applyNavigationIntent(state, intent) {
  if (!state) throw new Error('navigation state is required');
  if (!intent?.type || !Object.values(NavigationIntent).includes(intent.type)) throw new Error(`Unsupported navigation intent: ${intent?.type}`);
  switch (intent.type) {
    case NavigationIntent.navigateToRoute:
      validateRoute(intent.route);
      return createNavigationState({ ...state, currentRoute: intent.route, selectedView: intent.route, focusTarget: `${intent.route}-heading` });
    case NavigationIntent.selectReviewItem:
      return createNavigationState({ ...state, selectedReviewItemId: intent.reviewItemId, drawerOpen: true, activePanel: 'ResearchSnapshotDrawer', focusTarget: 'research-snapshot-drawer-heading' });
    case NavigationIntent.openDrawer:
      return createNavigationState({ ...state, drawerOpen: true, activePanel: 'ResearchSnapshotDrawer', focusTarget: 'research-snapshot-drawer-heading' });
    case NavigationIntent.closeDrawer:
      return createNavigationState({ ...state, drawerOpen: false, activePanel: 'MainWorkspace', focusTarget: state.selectedReviewItemId ? `review-row-${state.selectedReviewItemId}` : 'active-review-queue' });
    case NavigationIntent.restoreState:
      return restoreNavigationState({ savedState: intent.savedState, availableReviewItemIds: intent.availableReviewItemIds ?? [] });
    case NavigationIntent.updateFilter:
      return createNavigationState({ ...state, filterState: { ...intent.filterState }, focusTarget: 'active-review-queue' });
    case NavigationIntent.updateSort:
      return createNavigationState({ ...state, sortState: { ...intent.sortState }, focusTarget: 'active-review-queue' });
    case NavigationIntent.returnToQueue:
      return createNavigationState({ ...state, currentRoute: CockpitRoute.reviewQueue, selectedView: CockpitRoute.reviewQueue, drawerOpen: false, activePanel: 'ActiveReviewQueue', focusTarget: 'active-review-queue' });
    default:
      return state;
  }
}

export function restoreNavigationState({ savedState, availableReviewItemIds = [] } = {}) {
  if (!savedState) return createNavigationState();
  const selectedStillValid = savedState.selectedReviewItemId && availableReviewItemIds.includes(savedState.selectedReviewItemId);
  return createNavigationState({
    ...savedState,
    selectedReviewItemId: selectedStillValid ? savedState.selectedReviewItemId : null,
    drawerOpen: selectedStillValid ? Boolean(savedState.drawerOpen) : false,
    activePanel: selectedStillValid && savedState.drawerOpen ? 'ResearchSnapshotDrawer' : 'MainWorkspace',
    focusTarget: selectedStillValid ? savedState.focusTarget : 'active-review-queue'
  });
}

export function createNavigationIntent(type, payload = {}) {
  if (!Object.values(NavigationIntent).includes(type)) throw new Error(`Unsupported navigation intent: ${type}`);
  return Object.freeze({ type, ...payload, businessEvent: false, guardrail: 'Navigation intents are UI presentation events only.' });
}

function validateRoute(route) {
  if (!Object.values(CockpitRoute).includes(route)) throw new Error(`Unsupported cockpit route: ${route}`);
}

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
