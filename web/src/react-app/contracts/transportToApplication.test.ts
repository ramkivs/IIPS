import { describe, expect, it } from 'vitest';
import type { TransportOperationalCockpitDTO } from './index';
import { mapTransportToApplication, TransportMappingError } from './index';

const transportFixture: TransportOperationalCockpitDTO = {
  metadata: {
    engineVersion: 'engine-v1',
    contractVersion: '1.0',
    generatedAt: '2026-08-01T00:00:00.000Z',
    providerId: 'api-provider',
    marketDate: '2026-08-01'
  },
  portfolio: {
    holdings: 66,
    sectors: 12,
    portfolioHealth: 'Stressed',
    reviewCoverage: 100,
    researchDebt: 7
  },
  reviewQueue: {
    total: 1,
    items: [
      {
        id: 'review-elecon',
        symbol: 'ELECON',
        company: 'Elecon Engineering Company',
        sector: 'Industrials',
        reviewPriority: 'High',
        governanceState: 'Active',
        evidenceStatus: 'Verified',
        materialChange: 'Valuation',
        lastReviewed: '2026-07-31',
        assignedAnalyst: 'Analyst A'
      }
    ]
  },
  governance: {
    status: 'Active',
    reviewSLA: 'Within SLA',
    validationStatus: 'Validated',
    engineVersion: 'engine-v1',
    contractVersion: '1.0'
  },
  evidence: {
    quality: 'Verified',
    latestUpdate: '2026-07-31T00:00:00.000Z',
    missingItems: 0,
    timeline: [{ date: '2026-07-31', category: 'Filing', title: 'Quarterly update' }]
  },
  alerts: [{ id: 'alert-1', severity: 'warning', title: 'Evidence stale soon', message: 'Review evidence freshness.', createdAt: '2026-07-31T00:00:00.000Z' }]
};

describe('Transport to Application DTO mapper', () => {
  it('maps transport DTO fields into application DTO without presentation composition', () => {
    const application = mapTransportToApplication(transportFixture);

    expect(application.metadata.contractVersion).toBe('1.0');
    expect(application.portfolio.holdings).toBe(66);
    expect(application.reviewQueue.total).toBe(1);
    expect(application.reviewQueue.items[0].ticker).toBe('ELECON');
    expect(application.reviewQueue.items[0].companyName).toBe('Elecon Engineering Company');
    expect(application.reviewQueue.items[0].priority).toBe('High');
    expect(application.reviewQueue.items[0].governanceStatus).toBe('Active');
    expect(application.governance.validationStatus).toBe('Validated');
    expect(application.evidence.timeline[0].title).toBe('Quarterly update');
    expect(application.alerts[0].severity).toBe('warning');
  });

  it('rejects missing mandatory transport fields', () => {
    const invalid = { ...transportFixture, metadata: { ...transportFixture.metadata, contractVersion: undefined as unknown as string } };

    expect(() => mapTransportToApplication(invalid)).toThrow(TransportMappingError);
    try {
      mapTransportToApplication(invalid);
    } catch (error) {
      expect((error as TransportMappingError).field).toBe('metadata.contractVersion');
      expect((error as TransportMappingError).code).toBe('MissingField');
    }
  });

  it('rejects unsupported alert severity values', () => {
    const invalid = { ...transportFixture, alerts: [{ ...transportFixture.alerts[0], severity: 'urgent' as 'warning' }] };

    expect(() => mapTransportToApplication(invalid)).toThrow(TransportMappingError);
    try {
      mapTransportToApplication(invalid);
    } catch (error) {
      expect((error as TransportMappingError).field).toBe('alerts[0].severity');
      expect((error as TransportMappingError).code).toBe('UnsupportedValue');
    }
  });

  it('preserves version metadata for compatibility checks without moving it into presentation fields', () => {
    const application = mapTransportToApplication(transportFixture);

    expect(application.metadata.engineVersion).toBe('engine-v1');
    expect(application.metadata.contractVersion).toBe('1.0');
    expect(application.governance.engineVersion).toBe('engine-v1');
    expect(application.governance.contractVersion).toBe('1.0');
  });

  it('does not invent presentation DTO fields or business semantics', () => {
    const application = mapTransportToApplication(transportFixture) as unknown as Record<string, unknown>;

    expect(application.coverageLedger).toBeUndefined();
    expect(application.metrics).toBeUndefined();
    expect(application.evidenceHealth).toBeUndefined();
    expect((application.reviewQueue as Record<string, unknown>).summary).toBeUndefined();
    expect((application.reviewQueue as { items: Array<Record<string, unknown>> }).items[0].attentionReason).toBeUndefined();
    expect((application.reviewQueue as { items: Array<Record<string, unknown>> }).items[0].allowedActions).toBeUndefined();
  });
});
