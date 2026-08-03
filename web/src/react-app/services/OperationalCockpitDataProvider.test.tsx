import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { OperationalCockpitDTO } from '../contracts';
import { operationalDataFixture } from '../fixtures/operationalDataFixture';
import { ApiOperationalCockpitDataProvider, FixtureOperationalCockpitDataProvider, isOperationalCockpitDataProvider, OperationalCockpitProviderError, type ProviderTelemetryEvent } from './OperationalCockpitDataProvider';
import { OperationalCockpitContainer } from '../app';

describe('OperationalCockpitDataProvider', () => {
  it('fixture provider supplies typed cockpit, queue, and governance DTOs', async () => {
    const provider = new FixtureOperationalCockpitDataProvider();
    const cockpit = await provider.getCockpit();
    const queue = await provider.getReviewQueue();
    const governance = await provider.getGovernanceState();

    expect(isOperationalCockpitDataProvider(provider)).toBe(true);
    expect(cockpit.cycleId).toBe('Cycle #2');
    expect(queue.items[0].ticker).toBe('ELECON');
    expect(governance.currentDecision).toBe('Keep workflow unchanged');
  });

  it('API provider consumes wrapped backend payload through the same provider interface and sends request metadata', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetchJson = async (url: string, init?: RequestInit): Promise<{ data: OperationalCockpitDTO }> => {
      calls.push({ url, init });
      return { data: operationalDataFixture };
    };
    const telemetry: ProviderTelemetryEvent[] = [];
    const provider = new ApiOperationalCockpitDataProvider({
      baseUrl: '/api',
      fetchJson,
      correlationIdFactory: () => 'corr-wp03',
      clientVersion: 'test-client',
      locale: 'en-IN',
      timeZone: 'Asia/Calcutta',
      telemetry: event => telemetry.push(event)
    });

    const cockpit = await provider.getCockpit();
    const queue = await provider.getReviewQueue();

    expect(provider.mode).toBe('api');
    expect(cockpit.portfolioHealth.holdingsCount).toBe(66);
    expect(queue.summary.highPriority).toBe(2);
    expect(calls.length).toBe(1);
    expect(calls[0].url).toBe('/api/v1/operational-cockpit');
    expect((calls[0].init?.headers as Record<string, string>)['x-correlation-id']).toBe('corr-wp03');
    expect((calls[0].init?.headers as Record<string, string>)['x-client-version']).toBe('test-client');
    expect((calls[0].init?.headers as Record<string, string>)['x-locale']).toBe('en-IN');
    expect((calls[0].init?.headers as Record<string, string>)['x-time-zone']).toBe('Asia/Calcutta');
    expect(telemetry.map(event => event.phase)).toEqual(['request:start', 'request:success']);
  });

  it('API provider retries transient failures and normalizes final success telemetry', async () => {
    let attempts = 0;
    const telemetry: ProviderTelemetryEvent[] = [];
    const fetchJson = vi.fn(async () => {
      attempts += 1;
      if (attempts < 2) throw Object.assign(new Error('temporary unavailable'), { status: 503 });
      return operationalDataFixture;
    });
    const provider = new ApiOperationalCockpitDataProvider({
      baseUrl: '/api',
      fetchJson,
      retryDelaysMs: [0],
      correlationIdFactory: () => 'corr-retry',
      telemetry: event => telemetry.push(event)
    });

    const cockpit = await provider.getCockpit();

    expect(cockpit.cycleId).toBe('Cycle #2');
    expect(fetchJson).toHaveBeenCalledTimes(2);
    expect(telemetry.map(event => event.phase)).toEqual(['request:start', 'request:failure', 'request:retry', 'request:start', 'request:success']);
  });

  it('API provider rejects malformed payloads before UI rendering', async () => {
    const provider = new ApiOperationalCockpitDataProvider({
      baseUrl: '/api',
      fetchJson: async () => ({ data: { invalid: true } }),
      retryDelaysMs: [],
      correlationIdFactory: () => 'corr-invalid'
    });

    await expect(provider.getCockpit()).rejects.toMatchObject({
      name: 'OperationalCockpitProviderError',
      code: 'Validation',
      retryable: false,
      correlationId: 'corr-invalid'
    });
  });

  it('API provider caches canonical cockpit DTOs until cache is cleared', async () => {
    const fetchJson = vi.fn(async () => operationalDataFixture);
    const provider = new ApiOperationalCockpitDataProvider({ baseUrl: '/api', fetchJson });

    await provider.getCockpit();
    await provider.getReviewQueue();
    expect(fetchJson).toHaveBeenCalledTimes(1);

    provider.clearCache();
    await provider.getGovernanceState();
    expect(fetchJson).toHaveBeenCalledTimes(2);
  });

  it('normalizes non-retryable authentication failures', async () => {
    const provider = new ApiOperationalCockpitDataProvider({
      baseUrl: '/api',
      fetchJson: async () => { throw Object.assign(new Error('unauthorized'), { status: 401 }); },
      retryDelaysMs: [0, 0],
      correlationIdFactory: () => 'corr-auth'
    });

    await expect(provider.getCockpit()).rejects.toBeInstanceOf(OperationalCockpitProviderError);
    await expect(provider.getCockpit()).rejects.toMatchObject({ code: 'Authentication', retryable: false, correlationId: 'corr-auth' });
  });

  it('React container renders loading then fixture-backed cockpit', async () => {
    render(<OperationalCockpitContainer provider={new FixtureOperationalCockpitDataProvider()} />);

    expect(screen.getByRole('status')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('IIPS Operational Cockpit')).toBeTruthy());
    expect(screen.getAllByLabelText('Active Review Queue').length).toBeGreaterThanOrEqual(1);
  });

  it('React container renders provider error state without leaking implementation details', async () => {
    const provider = {
      providerId: 'failing-provider',
      mode: 'fixture' as const,
      getCockpit: async () => { throw new Error('Fixture unavailable'); },
      getReviewQueue: async () => operationalDataFixture.reviewQueue,
      getGovernanceState: async () => operationalDataFixture.governanceState
    };

    render(<OperationalCockpitContainer provider={provider} />);

    await waitFor(() => expect(screen.getByText('Cockpit unavailable')).toBeTruthy());
    expect(screen.getByText('Fixture unavailable')).toBeTruthy();
  });
});
