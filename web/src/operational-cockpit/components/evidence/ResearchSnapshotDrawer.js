import { renderDrawer } from '../../design-system/runtime/index.js';
import { createDrawerSection, createEvidenceBadge } from '../shared/patterns.js';
import { createUIEvent, UIInteractionEvent } from '../shared/events.js';

export function createResearchSnapshotDrawer({ snapshotDTO, open = true, section = 'summary' } = {}) {
  if (!snapshotDTO) throw new Error('snapshotDTO is required');
  return deepFreeze({
    component: 'ResearchSnapshotDrawer',
    ownsBusinessLogic: false,
    localState: { open, section },
    view: renderDrawer({ 'aria-label': `Research Snapshot ${snapshotDTO.ticker}` }, [
      createDrawerSection({ title: 'Scores', content: snapshotDTO.scores }),
      createDrawerSection({ title: 'Evidence', content: createEvidenceBadge({ evidenceStatus: snapshotDTO.evidenceStatus }) }),
      createDrawerSection({ title: 'Material Change', content: snapshotDTO.materialChange }),
      createDrawerSection({ title: 'Snapshot Diff', content: snapshotDTO.snapshotDiff })
    ]),
    events: {
      openDrawer: reviewItemId => createUIEvent(UIInteractionEvent.drawerOpened, { reviewItemId }),
      closeDrawer: reviewItemId => createUIEvent(UIInteractionEvent.drawerClosed, { reviewItemId })
    },
    accessibility: ['focus moves to drawer heading on open', 'focus restores to selected row on close'],
    guardrail: 'ResearchSnapshotDrawer renders DTO content and must not calculate scores, evidence quality, or material changes.'
  });
}

function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
