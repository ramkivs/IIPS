import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createOperationalCockpitFixture,
  createActiveReviewQueue,
  createCoverageLedger,
  createResearchSnapshotDrawer,
  createHumanReviewPanel,
  createGovernanceSidebar,
  createGovernanceRestrictionBanner,
  UIInteractionEvent
} from '../src/operational-cockpit/index.js';

function drawerDTOFromFixture(dto) {
  const item = dto.reviewQueue.items[0];
  return {
    selectedReviewItemId: item.id,
    companyId: item.companyId,
    ticker: item.ticker,
    companyName: item.companyName,
    priority: item.priority,
    evidenceStatus: item.evidenceStatus,
    scores: { businessQuality: 91, financialStrength: 88, valuation: 74, confidence: item.evidenceStatus.confidence },
    materialChange: { category: item.materialChangeCategory, headline: item.explanation.headline, severity: item.priority, reviewRequired: true },
    explanation: item.explanation,
    snapshotDiff: { previousSnapshotId: item.previousSnapshotId, currentSnapshotId: item.currentSnapshotId, rows: [] },
    provenance: null,
    allowedActions: item.allowedActions,
    restrictedActions: item.restrictedActions
  };
}

test('ActiveReviewQueue composes runtime DataTable and emits documented UI events only', () => {
  const dto = createOperationalCockpitFixture();
  const queue = createActiveReviewQueue({ reviewQueue: dto.reviewQueue, selectedReviewId: 'review-elecon' });
  const event = queue.events.selectRow('review-kross');

  assert.equal(queue.component, 'ActiveReviewQueue');
  assert.equal(queue.ownsBusinessLogic, false);
  assert.equal(queue.view.component, 'DataTable');
  assert.equal(event.type, UIInteractionEvent.rowSelected);
  assert.equal(event.businessEvent, false);
  assert.equal(queue.guardrail.includes('must not compute'), true);
});

test('CoverageLedger displays backend-provided coverage values without calculating coverage', () => {
  const dto = createOperationalCockpitFixture();
  const ledger = createCoverageLedger({ coverageLedger: dto.coverageLedger });

  assert.equal(ledger.component, 'CoverageLedger');
  assert.equal(ledger.ownsBusinessLogic, false);
  assert.equal(ledger.summary.totalRecords, 49);
  assert.equal(ledger.guardrail.includes('must not calculate coverage'), true);
});

test('ResearchSnapshotDrawer renders DTO content and does not calculate scores or material changes', () => {
  const dto = createOperationalCockpitFixture();
  const drawer = createResearchSnapshotDrawer({ snapshotDTO: drawerDTOFromFixture(dto) });

  assert.equal(drawer.component, 'ResearchSnapshotDrawer');
  assert.equal(drawer.ownsBusinessLogic, false);
  assert.equal(drawer.view.component, 'Drawer');
  assert.equal(drawer.events.openDrawer('review-elecon').type, UIInteractionEvent.drawerOpened);
  assert.equal(drawer.guardrail.includes('must not calculate scores'), true);
});

test('HumanReviewPanel owns user-entered review fields but no review scoring', () => {
  const dto = createOperationalCockpitFixture();
  const item = dto.reviewQueue.items[0];
  const panel = createHumanReviewPanel({
    humanReview: { reviewItemId: item.id, ticker: item.ticker, reviewerConfirmed: null },
    allowedActions: item.allowedActions,
    restrictedActions: item.restrictedActions
  });

  assert.equal(panel.component, 'HumanReviewPanel');
  assert.equal(panel.ownsBusinessLogic, false);
  assert.equal(panel.events.changeField('reviewerConfirmed', true).type, UIInteractionEvent.fieldChanged);
  assert.equal(panel.guardrail.includes('must not score'), true);
});

test('GovernanceSidebar and restriction banner display backend-owned governance state only', () => {
  const dto = createOperationalCockpitFixture();
  const sidebar = createGovernanceSidebar({ governanceState: dto.governanceState, metrics: dto.metrics });
  const banner = createGovernanceRestrictionBanner({ restrictedAction: { action: 'SubmitReview', reason: 'Governance freeze active' } });

  assert.equal(sidebar.component, 'GovernanceSidebar');
  assert.equal(sidebar.ownsBusinessLogic, false);
  assert.equal(sidebar.events.acknowledgeRestriction('SubmitReview').type, UIInteractionEvent.restrictionAcknowledged);
  assert.equal(sidebar.guardrail.includes('must not determine policy'), true);
  assert.equal(banner.ownsBusinessLogic, false);
});
