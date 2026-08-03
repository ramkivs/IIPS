import React from 'react';
import { Button, Stack, StatusPill } from '../design-system';

export type CockpitRoute = 'Dashboard' | 'ReviewQueue' | 'Portfolio' | 'ResearchWorkspace' | 'Evidence' | 'Governance' | 'Reports' | 'Settings';

export const cockpitRoutes: Array<{ route: CockpitRoute; label: string }> = [
  { route: 'Dashboard', label: 'Dashboard' },
  { route: 'ReviewQueue', label: 'Review Queue' },
  { route: 'Portfolio', label: 'Portfolio' },
  { route: 'ResearchWorkspace', label: 'Research Workspace' },
  { route: 'Evidence', label: 'Evidence' },
  { route: 'Governance', label: 'Governance' },
  { route: 'Reports', label: 'Reports' },
  { route: 'Settings', label: 'Settings' }
];

export function CockpitTopBar() {
  return (
    <div className="iips-brand-lockup">
      <div className="iips-brand-mark" aria-hidden="true">I</div>
      <div className="iips-brand-title">
        <strong>IIPS Operational Cockpit</strong>
        <span>Cycle #2 · Operational Governance v1.0</span>
      </div>
      <div className="iips-topbar-meta" aria-label="Operating context">
        <StatusPill variant="info">REP v1.0 Pilot Operational</StatusPill>
        <StatusPill variant="medium">Queue Health: Stressed</StatusPill>
        <StatusPill variant="high">Research Debt: High</StatusPill>
      </div>
    </div>
  );
}

export function CockpitNavigation({ activeRoute = 'Dashboard', onNavigate }: { activeRoute?: CockpitRoute; onNavigate?: (route: CockpitRoute) => void }) {
  function focusButton(current: EventTarget & HTMLButtonElement, direction: 'next' | 'previous' | 'first' | 'last') {
    const buttons = Array.from(current.closest('[data-cockpit-navigation]')?.querySelectorAll<HTMLButtonElement>('button[data-route]') ?? []);
    if (buttons.length === 0) return;
    const currentIndex = Math.max(0, buttons.indexOf(current));
    const nextIndex = direction === 'first' ? 0 : direction === 'last' ? buttons.length - 1 : direction === 'next' ? (currentIndex + 1) % buttons.length : (currentIndex - 1 + buttons.length) % buttons.length;
    buttons[nextIndex]?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      focusButton(event.currentTarget, 'next');
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      focusButton(event.currentTarget, 'previous');
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusButton(event.currentTarget, 'first');
    } else if (event.key === 'End') {
      event.preventDefault();
      focusButton(event.currentTarget, 'last');
    }
  }

  return (
    <Stack gap="sm">
      <div data-cockpit-navigation="primary">
        {cockpitRoutes.map(({ route, label }) => (
          <Button key={route} data-route={route} aria-current={activeRoute === route ? 'page' : undefined} onClick={() => onNavigate?.(route)} onKeyDown={handleKeyDown}>{label}</Button>
        ))}
      </div>
    </Stack>
  );
}
