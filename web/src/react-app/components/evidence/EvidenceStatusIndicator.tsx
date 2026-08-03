import React from 'react';
import type { EvidenceStatusDTO } from '../../contracts';
import { Badge } from '../../design-system';

export function EvidenceStatusIndicator({ evidenceStatus }: { evidenceStatus: EvidenceStatusDTO }) {
  return <Badge variant={evidenceStatus.quality} aria-label={`Evidence quality ${evidenceStatus.quality}`}>{evidenceStatus.quality}</Badge>;
}
