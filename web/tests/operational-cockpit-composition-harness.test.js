import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCockpitCompositionHarness,
  createOperationalCockpitFixture,
  createActiveReviewQueue
} from '../src/operational-cockpit/index.js';

test('Cockpit Composition Harness assembles all major regions from fixture DTO', () => {
  const harness = createCockpitCompositionHarness();

  assert.equal(harness.component, 'CockpitCompositionHarness');
  assert.equal(harness.ownsBusinessLogic, false);
  assert.equal(harness.regions.shell.component, 'OperationalCockpitAppShell');
  assert.equal(harness.regions.portfolioHero.component, 'PortfolioHealthHero');
  assert.equal(harness.regions.activeReviewQueue.component, 'ActiveReviewQueue');
  assert.equal(harness.regions.coverageLedger.component, 'CoverageLedger');
  assert.equal(harness.regions.drawer.component, 'ResearchSnapshotDrawer');
  assert.equal(harness.regions.humanReviewPanel.component, 'HumanReviewPanel');
  assert.equal(harness.regions.governanceSidebar.component, 'GovernanceSidebar');
  assert.equal(Object.isFrozen(harness), true);
});

test('Queue to Drawer integration opens matching snapshot using DTO references only', () => {
  const dto = createOperationalCockpitFixture();
  const selectedReviewId = dto.reviewQueue.items[1].id;
  const harness = createCockpitCompositionHarness({ dto, selectedReviewId });

  assert.equal(harness.localState.selectedReviewId, selectedReviewId);
  assert.equal(harness.regions.drawer.view.children[0].title, 'Scores');
  assert.equal(harness.regions.drawer.view.props['aria-label'].includes(dto.reviewQueue.items[1].ticker), true);
  assert.equal(harness.integration.queueToDrawer, true);
});

test('Drawer to HumanReviewPanel passes selected review context without recalculation', () => {
  const dto = createOperationalCockpitFixture();
  const selectedReviewId = dto.reviewQueue.items[0].id;
  const harness = createCockpitCompositionHarness({ dto, selectedReviewId });

  assert.equal(harness.regions.humanReviewPanel.inputs.reviewItemId, selectedReviewId);
  assert.equal(harness.integration.drawerToReviewPanel, true);
  assert.equal(harness.regions.humanReviewPanel.guardrail.includes('must not score'), true);
});

test('Governance to HumanReviewPanel integration preserves backend-owned governance boundaries', () => {
  const harness = createCockpitCompositionHarness();

  assert.equal(harness.integration.governanceToReviewPanel, true);
  assert.equal(harness.regions.governanceSidebar.guardrail.includes('must not determine policy'), true);
  assert.equal(harness.guardrails.some(guardrail => guardrail.includes('must not calculate review priority')), true);
});

test('Empty queue composition renders shared EmptyState and CoverageLedger remains available', () => {
  const dto = createOperationalCockpitFixture();
  const emptyDto = {
    ...dto,
    reviewQueue: {
      ...dto.reviewQueue,
      items: [],
      emptyQueueReason: 'No Material Changes',
      summary: { ...dto.reviewQueue.summary, total: 0, highPriority: 0, mediumPriority: 0, lowPriority: 0 }
    }
  };
  const harness = createCockpitCompositionHarness({ dto: emptyDto });

  assert.equal(harness.regions.activeReviewQueue.view.component, 'EmptyState');
  assert.equal(harness.regions.coverageLedger.component, 'CoverageLedger');
  assert.equal(harness.regions.drawer, null);
  assert.equal(harness.regions.humanReviewPanel, null);
});

test('Composition layer owns presentation state only and does not duplicate rendering primitives', () => {
  const harness = createCockpitCompositionHarness({ filterState: { priority: 'High' }, sortState: { field: 'ticker', direction: 'asc' } });

  assert.deepEqual(harness.localState.filterState, { priority: 'High' });
  assert.deepEqual(harness.localState.sortState, { field: 'ticker', direction: 'asc' });
  assert.equal(harness.regions.activeReviewQueue.view.component, 'DataTable');
  assert.equal(harness.regions.portfolioHero.metrics.component, 'MetricCardGroup');
  assert.equal(harness.regions.drawer.view.component, 'Drawer');
});
