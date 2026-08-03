import React, { useMemo, useState } from 'react';
import type { OperationalCockpitDTO } from '../contracts';
import { EvidenceCenter, GovernanceCenter, GovernanceSidebar, OperationalDashboard, PortfolioView, ReportsView, ResearchSnapshotDrawer, SettingsView } from '../components';
import { ThemeProvider } from '../design-system';
import { CockpitLayout } from './CockpitLayout';
import { CockpitNavigation, CockpitTopBar, type CockpitRoute } from './CockpitShell';
import { createSnapshotDrawerFixture, operationalDataFixture } from '../fixtures/operationalDataFixture';

export function OperationalCockpit({ dto = operationalDataFixture }: { dto?: OperationalCockpitDTO }) {
  const [route, setRoute] = useState<CockpitRoute>('Dashboard');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(dto.reviewQueue.items[0]?.id ?? null);
  const snapshot = useMemo(() => selectedReviewId ? createSnapshotDrawerFixture(selectedReviewId) : null, [selectedReviewId]);

  function closeResearchSnapshotDrawer() {
    const reviewId = selectedReviewId;
    setSelectedReviewId(null);
    if (reviewId) {
      queueMicrotask(() => {
        document.querySelector<HTMLElement>(`[data-row-id="${reviewId}"]`)?.focus();
      });
    }
  }

  const mainContent = route === 'Evidence'
    ? <EvidenceCenter evidenceHealth={dto.evidenceHealth} reviewQueue={dto.reviewQueue} coverageLedger={dto.coverageLedger} />
    : route === 'Governance'
      ? <GovernanceCenter governanceState={dto.governanceState} metrics={dto.metrics} />
      : route === 'Portfolio'
        ? <PortfolioView portfolioHealth={dto.portfolioHealth} evidenceHealth={dto.evidenceHealth} coverageLedger={dto.coverageLedger} />
        : route === 'Reports'
          ? <ReportsView dto={dto} />
          : route === 'Settings'
            ? <SettingsView dto={dto} />
            : <OperationalDashboard dto={dto} selectedReviewId={selectedReviewId} onReviewQueueEvent={event => { if (event.type === 'RowSelected') setSelectedReviewId(event.reviewItemId); }} />;
  return (
    <ThemeProvider>
      <CockpitLayout
        topBar={<CockpitTopBar />}
        navigation={<CockpitNavigation activeRoute={route} onNavigate={setRoute} />}
        main={mainContent}
        drawer={<ResearchSnapshotDrawer snapshot={snapshot} onClose={closeResearchSnapshotDrawer} />}
        governance={<GovernanceSidebar governanceState={dto.governanceState} metrics={dto.metrics} />}
      />
      <span style={{ display: 'none' }} data-testid="active-route">{route}</span>
    </ThemeProvider>
  );
}
