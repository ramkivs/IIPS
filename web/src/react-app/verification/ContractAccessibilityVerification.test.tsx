import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OperationalCockpit } from '../app';
import { operationalDataFixture } from '../fixtures/operationalDataFixture';
import { ApiOperationalCockpitDataProvider, FixtureOperationalCockpitDataProvider, isOperationalCockpitDataProvider } from '../services';
import { validateOperationalCockpitDTO } from '../../operational-cockpit/contracts/dto/OperationalDataDTO.js';

describe('WP7 Contract and Accessibility Verification', () => {
  it('React cockpit consumes a fixture that conforms to the approved Operational Data Contract', () => {
    expect(validateOperationalCockpitDTO(operationalDataFixture)).toBe(true);
  });

  it('data providers satisfy provider boundary without exposing domain services', async () => {
    const fixtureProvider = new FixtureOperationalCockpitDataProvider();
    const apiProvider = new ApiOperationalCockpitDataProvider({
      baseUrl: '/api',
      fetchJson: async () => operationalDataFixture
    });

    expect(isOperationalCockpitDataProvider(fixtureProvider)).toBe(true);
    expect(isOperationalCockpitDataProvider(apiProvider)).toBe(true);
    expect((await fixtureProvider.getCockpit()).reviewQueue.items[0].ticker).toBe('ELECON');
    expect((await apiProvider.getGovernanceState()).currentDecision).toBe('Keep workflow unchanged');
  });

  it('assembled cockpit exposes required accessibility landmarks', async () => {
    render(<OperationalCockpit dto={operationalDataFixture} />);

    expect(screen.getByLabelText('Top Bar')).toBeTruthy();
    expect(screen.getByLabelText('Primary Navigation')).toBeTruthy();
    expect(screen.getAllByLabelText('Governance Sidebar').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText('Research Snapshot Drawer')).toBeTruthy();
    expect(screen.getByLabelText('Portfolio Health')).toBeTruthy();
  });

  it('review queue keyboard-focusable rows and selected state are present', () => {
    render(<OperationalCockpit dto={operationalDataFixture} />);
    const table = screen.getByRole('table', { name: 'Active Review Queue' });
    const rows = within(table).getAllByRole('row');
    const dataRows = rows.slice(1);

    expect(dataRows.length).toBeGreaterThan(0);
    expect(dataRows[0].getAttribute('tabindex')).toBe('0');
    expect(dataRows[0].getAttribute('aria-selected')).toBe('true');
  });


  it('drawer close restores focus to the invoking review row when the row remains available', async () => {
    render(<OperationalCockpit dto={operationalDataFixture} />);
    const table = screen.getByRole('table', { name: 'Active Review Queue' });
    const krossRow = within(table).getByRole('row', { name: /KROSS/ });

    fireEvent.click(krossRow);
    expect(screen.getByLabelText('Research Snapshot KROSS')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => expect(document.activeElement).toBe(krossRow));
  });

  it('React UI presents backend-owned state without recommendation language', () => {
    render(<OperationalCockpit dto={operationalDataFixture} />);
    const bodyText = document.body.textContent?.toLowerCase() ?? '';

    expect(bodyText).toContain('valuation shift');
    expect(bodyText).toContain('keep workflow unchanged');
    expect(bodyText).not.toContain('buy');
    expect(bodyText).not.toContain('sell');
    expect(bodyText).not.toContain('trim');
    expect(bodyText).not.toContain('exit');
  });
});
