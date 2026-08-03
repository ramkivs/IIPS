import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createOperationalCockpitFixture,
  validateOperationalCockpitDTO,
  OperationalCockpitAdapter,
  OperationalEventType,
  createFixtureEvent,
  validateOperationalEventEnvelope,
  createOperationalCockpitShell,
  operationalCockpitTokens,
  primitiveCatalog,
  accessibilityBaseline,
  cockpitComponentDescriptors
} from '../src/operational-cockpit/index.js';

test('Operational Cockpit fixture conforms to approved Operational Data DTO contract', () => {
  const dto = createOperationalCockpitFixture();

  assert.equal(validateOperationalCockpitDTO(dto), true);
  assert.equal(dto.portfolioHealth.holdingsCount, 66);
  assert.equal(dto.reviewQueue.items.length, 3);
  assert.equal(dto.reviewQueue.items[0].priority, 'High');
  assert.equal(dto.governanceState.currentDecision, 'Keep workflow unchanged');
  assert.equal(Object.isFrozen(dto), true);
});

test('Operational Cockpit adapter consumes DTOs and events without computing business logic', () => {
  const dto = createOperationalCockpitFixture();
  const adapter = new OperationalCockpitAdapter({ dto });
  const event = createFixtureEvent({
    eventType: OperationalEventType.evidenceRefreshStarted,
    payload: { refreshId: 'REFRESH_1', refreshState: 'Refreshing', affectedReviewItemIds: ['review-elecon'], affectedTickers: ['ELECON'] }
  });

  assert.equal(validateOperationalEventEnvelope(event), true);
  assert.equal(adapter.getPortfolioHealth().comparisonCoveragePercent, 100);
  assert.equal(adapter.getSelectedReviewItem('review-elecon').ticker, 'ELECON');
  assert.deepEqual(adapter.applyEvent(event), { eventAccepted: true, eventType: 'EvidenceRefreshStarted', requiresBackendRefresh: false });
});

test('Operational Cockpit AppShell maps fixture DTO to stable layout regions', () => {
  const dto = createOperationalCockpitFixture();
  const shell = createOperationalCockpitShell({ dto, selectedReviewItemId: 'review-elecon' });

  assert.equal(shell.component, 'OperationalCockpitAppShell');
  assert.equal(shell.regions.topBar.component, 'TopBar');
  assert.equal(shell.regions.navigation.component, 'Navigation');
  assert.equal(shell.regions.main.component, 'MainWorkspace');
  assert.equal(shell.regions.drawer.selectedReviewItem.ticker, 'ELECON');
  assert.equal(shell.regions.governance.governanceState.governanceVersion, 'Operational Governance v1.0');
  assert.equal(shell.guardrail.includes('must not compute domain'), true);
  assert.equal(Object.isFrozen(shell), true);
});

test('Design system foundation exposes tokens, primitives, and accessibility baseline without behavior logic', () => {
  assert.equal(operationalCockpitTokens.color.status.high, '#b42318');
  assert.equal(primitiveCatalog.DataTable.ownsBusinessLogic, false);
  assert.equal(primitiveCatalog.EmptyState.ownsBusinessLogic, false);
  assert.equal(accessibilityBaseline.wcagTarget, 'WCAG 2.2 AA');
  assert.equal(accessibilityBaseline.reducedMotion, true);
});

test('Component descriptors preserve UI ownership boundary', () => {
  assert.equal(cockpitComponentDescriptors.ActiveReviewQueue.ownsBusinessLogic, false);
  assert.deepEqual(cockpitComponentDescriptors.ActiveReviewQueue.owns, ['selected row id', 'filter state', 'sort state']);
  assert.equal(cockpitComponentDescriptors.HumanReviewPanel.ownsBusinessLogic, false);
  assert.equal(cockpitComponentDescriptors.GovernanceSidebar.consumes.includes('GovernanceStateDTO'), true);
});
