import { renderCard, renderPanel, renderStatusPill, renderEmptyState, renderBadge } from '../../design-system/runtime/index.js';

export function createMetricCardGroup(metrics = []) {
  return deepFreeze({
    component: 'MetricCardGroup',
    ownsBusinessLogic: false,
    children: metrics.map(metric => renderCard({ label: metric.label, value: metric.value, note: metric.note }, [String(metric.value ?? '—')]))
  });
}

export function createStatusRow({ label, value, variant = 'info' }) {
  return deepFreeze({ component: 'StatusRow', ownsBusinessLogic: false, label, value, status: renderStatusPill({ label: String(value), variant }) });
}

export function createDetailPanel({ title, rows = [] }) {
  return renderPanel({ title }, rows.map(row => createStatusRow(row)));
}

export function createDrawerSection({ title, content }) {
  return deepFreeze({ component: 'DrawerSection', ownsBusinessLogic: false, title, content });
}

export function createToolbar({ filters = [], sort = null, search = null } = {}) {
  return deepFreeze({ component: 'Toolbar', ownsBusinessLogic: false, filters, sort, search });
}

export function createStateWrapper({ state, reason = null, children = [] }) {
  if (state === 'empty') return renderEmptyState({ reason, title: reason ?? 'No data available' });
  return deepFreeze({ component: 'StateWrapper', ownsBusinessLogic: false, state, reason, children });
}

export function createEvidenceBadge({ evidenceStatus }) {
  return renderBadge({ label: evidenceStatus?.quality ?? 'Unknown', variant: evidenceStatus?.quality ?? 'Unknown' });
}

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
