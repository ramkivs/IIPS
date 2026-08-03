import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OperationalCockpit } from '../app';
import { cockpitRoutes } from '../app/CockpitShell';

describe('Cockpit Assembly', () => {
  it('renders the React Operational Cockpit end-to-end from fixture DTOs', () => {
    render(<OperationalCockpit />);
    expect(screen.getByLabelText('Top Bar')).toBeTruthy();
    expect(screen.getByLabelText('Primary Navigation')).toBeTruthy();
    expect(screen.getByLabelText('Dashboard')).toBeTruthy();
    expect(screen.getByText('Holdings')).toBeTruthy();
    expect(screen.getByLabelText('Review Queue Summary')).toBeTruthy();
    expect(screen.getByLabelText('Evidence Coverage')).toBeTruthy();
    expect(screen.getAllByText('ELECON').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByLabelText('Governance Sidebar').length).toBeGreaterThanOrEqual(1);
  });

  it('selects a review item and updates drawer content through presentation state', () => {
    render(<OperationalCockpit />);
    const table = screen.getByRole('table', { name: 'Active Review Queue' });
    const krossCell = within(table).getByText('KROSS');
    fireEvent.click(krossCell);
    expect(screen.getByLabelText('Research Snapshot KROSS')).toBeTruthy();
  });

  it('renders every approved primary navigation destination', () => {
    render(<OperationalCockpit />);
    const navigation = screen.getByLabelText('Primary Navigation');
    for (const { label } of cockpitRoutes) {
      expect(within(navigation).getByRole('button', { name: label })).toBeTruthy();
    }
  });

  it('navigates between views as presentation state only and exposes active route semantics', () => {
    render(<OperationalCockpit />);
    const navigation = screen.getByLabelText('Primary Navigation');
    const dashboard = within(navigation).getByRole('button', { name: 'Dashboard' });
    const portfolio = within(navigation).getByRole('button', { name: 'Portfolio' });
    const evidence = within(navigation).getByRole('button', { name: 'Evidence' });
    const governance = within(navigation).getByRole('button', { name: 'Governance' });
    const reports = within(navigation).getByRole('button', { name: 'Reports' });
    const settings = within(navigation).getByRole('button', { name: 'Settings' });

    expect(dashboard.getAttribute('aria-current')).toBe('page');
    fireEvent.click(portfolio);
    expect(screen.getByTestId('active-route').textContent).toBe('Portfolio');
    expect(screen.getByLabelText('Portfolio')).toBeTruthy();

    fireEvent.click(evidence);
    expect(screen.getByTestId('active-route').textContent).toBe('Evidence');
    expect(screen.getByLabelText('Evidence Center')).toBeTruthy();
    expect(evidence.getAttribute('aria-current')).toBe('page');
    expect(dashboard.getAttribute('aria-current')).toBe(null);

    fireEvent.click(governance);
    expect(screen.getByTestId('active-route').textContent).toBe('Governance');
    expect(screen.getByLabelText('Governance Center')).toBeTruthy();
    expect(governance.getAttribute('aria-current')).toBe('page');

    fireEvent.click(reports);
    expect(screen.getByTestId('active-route').textContent).toBe('Reports');
    expect(screen.getByLabelText('Reports')).toBeTruthy();
    expect(reports.getAttribute('aria-current')).toBe('page');

    fireEvent.click(settings);
    expect(screen.getByTestId('active-route').textContent).toBe('Settings');
    expect(screen.getByLabelText('Settings')).toBeTruthy();
    expect(settings.getAttribute('aria-current')).toBe('page');
  });

  it('supports keyboard movement across navigation controls without changing business state', () => {
    render(<OperationalCockpit />);
    const navigation = screen.getByLabelText('Primary Navigation');
    const dashboard = within(navigation).getByRole('button', { name: 'Dashboard' });
    const reviewQueue = within(navigation).getByRole('button', { name: 'Review Queue' });
    const settings = within(navigation).getByRole('button', { name: 'Settings' });

    dashboard.focus();
    fireEvent.keyDown(dashboard, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(reviewQueue);
    fireEvent.keyDown(reviewQueue, { key: 'End' });
    expect(document.activeElement).toBe(settings);
    fireEvent.keyDown(settings, { key: 'Home' });
    expect(document.activeElement).toBe(dashboard);
    expect(screen.getByTestId('active-route').textContent).toBe('Dashboard');
  });
});
