import React from 'react';
import type { OperationalMetricsDTO } from '../contracts';
import { Panel } from '../design-system';

export function OperationalMetricsPanel({ metrics }: { metrics: OperationalMetricsDTO }) {
  return <Panel title="Operational Metrics"><dl><dt>Items examined</dt><dd>{metrics.reviewItemsExamined}</dd><dt>Confirmation rate</dt><dd>{metrics.highPriorityConfirmedRate ?? '—'}%</dd><dt>Guardrail violations</dt><dd>{metrics.guardrailViolations}</dd></dl></Panel>;
}
