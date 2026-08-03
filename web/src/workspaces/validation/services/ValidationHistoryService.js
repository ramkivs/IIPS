export function createValidationHistory({ ticker, company, events }) {
  return deepFreeze({ ticker, company, events: events.map(event => Object.freeze({ date: event.date, status: event.status, note: event.note || '' })) });
}

export function createDemoValidationHistories() {
  return deepFreeze([
    createValidationHistory({ ticker: 'BLS', company: 'BLS International', events: [
      { date: '2026-06-05', status: 'Stable' },
      { date: '2026-06-12', status: 'Stable' },
      { date: '2026-06-19', status: 'Needs Review', note: 'Evidence freshness dropped' },
      { date: '2026-06-26', status: 'Stable' },
      { date: '2026-07-03', status: 'Evidence Improved' }
    ] }),
    createValidationHistory({ ticker: 'KAYNES', company: 'Kaynes Technology', events: [
      { date: '2026-06-26', status: 'Stable' },
      { date: '2026-07-03', status: 'Stable' },
      { date: '2026-07-10', status: 'Needs Review', note: 'MOS compression' },
      { date: '2026-07-17', status: 'Needs Review' },
      { date: '2026-07-23', status: 'Material Change' }
    ] })
  ]);
}

function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
