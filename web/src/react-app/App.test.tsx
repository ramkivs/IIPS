import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('React tooling smoke test', () => {
  it('renders the contract-bound React app shell', async () => {
    render(<App />);
    expect(await screen.findByLabelText('Top Bar')).toBeTruthy();
    expect(screen.getByText('IIPS Operational Cockpit')).toBeTruthy();
    expect(screen.getAllByLabelText('Active Review Queue').length).toBeGreaterThanOrEqual(1);
  });
});
