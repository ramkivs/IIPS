import React from 'react';
import { AppShell, PageContainer } from '../design-system';

export function CockpitLayout({ topBar, navigation, main, drawer, governance }: { topBar: React.ReactNode; navigation: React.ReactNode; main: React.ReactNode; drawer: React.ReactNode; governance: React.ReactNode }) {
  return (
    <AppShell>
      <div className="iips-react-cockpit" data-testid="cockpit-layout">
        <header aria-label="Top Bar">{topBar}</header>
        <nav aria-label="Primary Navigation">{navigation}</nav>
        <PageContainer>{main}</PageContainer>
        <aside aria-label="Research Snapshot Drawer">{drawer}</aside>
        <aside aria-label="Governance Sidebar">{governance}</aside>
      </div>
    </AppShell>
  );
}
