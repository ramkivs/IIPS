import React from 'react';
import type { ResearchSnapshotDrawerDTO } from '../../contracts';
import { Drawer } from '../../design-system';
import { ResearchWorkspace } from './ResearchWorkspace';

export function ResearchSnapshotDrawer({ snapshot, open = true, onClose }: { snapshot: ResearchSnapshotDrawerDTO | null; open?: boolean; onClose?: () => void }) {
  if (!snapshot) return null;
  return (
    <Drawer open={open} aria-label={`Research Snapshot ${snapshot.ticker}`}>
      <button type="button" onClick={onClose}>Close</button>
      <ResearchWorkspace snapshot={snapshot} />
    </Drawer>
  );
}
