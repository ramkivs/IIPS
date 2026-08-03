export const EVENT_CONTRACT_VERSION = 'Event Catalog v1.0';

export const OperationalEventType = Object.freeze({
  evidenceRefreshStarted: 'EvidenceRefreshStarted',
  evidenceRefreshCompleted: 'EvidenceRefreshCompleted',
  evidenceRefreshFailed: 'EvidenceRefreshFailed',
  reviewQueueUpdated: 'ReviewQueueUpdated',
  governanceStateChanged: 'GovernanceStateChanged'
});

export function validateOperationalEventEnvelope(event) {
  const required = ['eventId', 'eventType', 'eventVersion', 'producer', 'producedAt', 'sequence', 'idempotencyKey', 'payload'];
  for (const field of required) if (event?.[field] === undefined || event[field] === null) throw new Error(`OperationalEventEnvelope.${field} is required`);
  if (!Object.values(OperationalEventType).includes(event.eventType)) throw new Error(`Unsupported eventType: ${event.eventType}`);
  if (event.eventVersion !== '1.0') throw new Error('eventVersion must be 1.0');
  return true;
}

export function createFixtureEvent({ eventType, payload, sequence = 1 }) {
  if (!Object.values(OperationalEventType).includes(eventType)) throw new Error(`Unsupported eventType: ${eventType}`);
  return deepFreeze({
    eventId: `EVT_${eventType}_${sequence}`,
    eventType,
    eventVersion: '1.0',
    producer: 'Operational Cockpit Fixture Backend',
    producedAt: '2026-07-25T00:00:00.000Z',
    sequence,
    correlationId: 'CORR_MVP_FOUNDATION',
    causationId: null,
    idempotencyKey: `IDEMP_${eventType}_${sequence}`,
    payload
  });
}

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
