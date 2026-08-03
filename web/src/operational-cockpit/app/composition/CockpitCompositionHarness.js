import { createOperationalCockpitFixture } from '../../fixtures/operationalCockpitFixture.js';
import { createOperationalCockpitShell } from '../layout/AppShell.js';
import { createActiveReviewQueue } from '../../components/review-queue/ActiveReviewQueue.js';
import { createCoverageLedger } from '../../components/coverage-ledger/CoverageLedger.js';
import { createResearchSnapshotDrawer } from '../../components/evidence/ResearchSnapshotDrawer.js';
import { createHumanReviewPanel } from '../../components/human-review/HumanReviewPanel.js';
import { createGovernanceSidebar } from '../../components/governance/GovernanceSidebar.js';
import { createMetricCardGroup } from '../../components/shared/patterns.js';
import { validateOperationalCockpitDTO } from '../../contracts/dto/OperationalDataDTO.js';
import { createNavigationState, focusForNavigationState } from '../navigation/index.js';

export function createCockpitCompositionHarness({ dto = createOperationalCockpitFixture(), selectedReviewId = null, route = 'Dashboard', filterState = {}, sortState = { field: 'priority', direction: 'asc' }, navigationState = null } = {}) {
  validateOperationalCockpitDTO(dto);
  const navState = navigationState ?? createNavigationState({ currentRoute: route, selectedView: route, selectedReviewItemId: selectedReviewId, drawerOpen: Boolean(selectedReviewId), filterState, sortState });
  const selectedItem = navState.selectedReviewItemId ? dto.reviewQueue.items.find(item => item.id === navState.selectedReviewItemId) : dto.reviewQueue.items[0] ?? null;
  const selectedId = selectedItem?.id ?? null;
  const shell = createOperationalCockpitShell({ dto, selectedReviewItemId: selectedId });
  const portfolioHero = createPortfolioHealthHero(dto.portfolioHealth);
  const activeReviewQueue = createActiveReviewQueue({ reviewQueue: dto.reviewQueue, selectedReviewId: selectedId, filterState: navState.filterState, sortState: navState.sortState });
  const coverageLedger = createCoverageLedger({ coverageLedger: dto.coverageLedger });
  const drawer = selectedItem ? createResearchSnapshotDrawer({ snapshotDTO: createDrawerDTO({ selectedItem }) }) : null;
  const humanReviewPanel = selectedItem ? createHumanReviewPanel({ humanReview: createHumanReviewDTO(selectedItem), allowedActions: selectedItem.allowedActions, restrictedActions: selectedItem.restrictedActions }) : null;
  const governanceSidebar = createGovernanceSidebar({ governanceState: dto.governanceState, metrics: dto.metrics });

  return deepFreeze({
    component: 'CockpitCompositionHarness',
    route: navState.currentRoute,
    ownsBusinessLogic: false,
    navigationState: navState,
    focusPlan: focusForNavigationState(navState),
    localState: { selectedReviewId: selectedId, route: navState.currentRoute, filterState: navState.filterState, sortState: navState.sortState, drawerOpen: Boolean(selectedItem) },
    regions: { shell, portfolioHero, activeReviewQueue, coverageLedger, drawer, humanReviewPanel, governanceSidebar },
    integration: {
      queueToDrawer: Boolean(selectedItem && drawer?.view),
      drawerToReviewPanel: Boolean(drawer && humanReviewPanel),
      governanceToReviewPanel: Boolean(governanceSidebar && humanReviewPanel),
      fixtureDriven: true,
      contractValidated: true
    },
    guardrails: [
      'Composition layer coordinates presentation state only.',
      'Composition layer must not calculate review priority, evidence quality, material changes, scores, queue health, research debt, or governance decisions.',
      'All operational semantics must come from approved DTOs and events.'
    ]
  });
}

export function createPortfolioHealthHero(portfolioHealth) {
  return deepFreeze({
    component: 'PortfolioHealthHero',
    ownsBusinessLogic: false,
    metrics: createMetricCardGroup([
      { label: 'Holdings', value: portfolioHealth.holdingsCount, note: 'Portfolio scope' },
      { label: 'Active Reviews', value: portfolioHealth.activeReviewCount, note: 'Change-driven' },
      { label: 'Coverage Items', value: portfolioHealth.coverageLedgerCount, note: 'Routine governance' },
      { label: 'Queue Health', value: portfolioHealth.queueHealth, note: 'Backend-owned' },
      { label: 'Research Debt', value: portfolioHealth.researchDebt, note: 'Backend-owned' },
      { label: 'Estimated Work', value: portfolioHealth.estimatedWorkMinutes, note: 'minutes' }
    ]),
    guardrail: 'PortfolioHealthHero displays backend-provided metrics and must not calculate operational health.'
  });
}

function createDrawerDTO({ selectedItem }) {
  return Object.freeze({
    selectedReviewItemId: selectedItem.id,
    companyId: selectedItem.companyId,
    ticker: selectedItem.ticker,
    companyName: selectedItem.companyName,
    priority: selectedItem.priority,
    evidenceStatus: selectedItem.evidenceStatus,
    scores: { businessQuality: null, financialStrength: null, valuation: null, confidence: selectedItem.evidenceStatus.confidence },
    materialChange: { category: selectedItem.materialChangeCategory, headline: selectedItem.explanation.headline, severity: selectedItem.priority, reviewRequired: selectedItem.reviewStatus === 'Needs Review' },
    explanation: selectedItem.explanation,
    snapshotDiff: { previousSnapshotId: selectedItem.previousSnapshotId, currentSnapshotId: selectedItem.currentSnapshotId, rows: [] },
    provenance: null,
    allowedActions: selectedItem.allowedActions,
    restrictedActions: selectedItem.restrictedActions
  });
}

function createHumanReviewDTO(selectedItem) {
  return Object.freeze({
    reviewItemId: selectedItem.id,
    ticker: selectedItem.ticker,
    reviewerConfirmed: null,
    falsePositive: null,
    explanationUseful: null,
    templateUseful: null,
    priorityCorrect: null,
    actionTaken: null,
    rootCauseCategory: null,
    timeSpentMinutes: null,
    finalDisposition: null,
    evidenceLevel: null,
    notes: null,
    recommendedRefinement: null
  });
}

function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
