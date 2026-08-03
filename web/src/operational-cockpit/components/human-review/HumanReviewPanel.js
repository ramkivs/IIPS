import { renderPanel } from '../../design-system/runtime/index.js';
import { createUIEvent, UIInteractionEvent } from '../shared/events.js';

export function createHumanReviewPanel({ humanReview, allowedActions = [], restrictedActions = [], dirty = false } = {}) {
  if (!humanReview) throw new Error('humanReview is required');
  return deepFreeze({
    component: 'HumanReviewPanel',
    ownsBusinessLogic: false,
    localState: { dirty },
    inputs: { reviewItemId: humanReview.reviewItemId, allowedActions, restrictedActions },
    view: renderPanel({ title: 'Human Review Panel' }, [humanReview]),
    events: {
      changeField: (field, value) => createUIEvent(UIInteractionEvent.fieldChanged, { reviewItemId: humanReview.reviewItemId, field, value }),
      submitReview: payload => createUIEvent(UIInteractionEvent.reviewSubmitted, { reviewItemId: humanReview.reviewItemId, payload })
    },
    accessibility: ['fields have labels', 'validation messages announced', 'input preserved on failed submission'],
    guardrail: 'HumanReviewPanel captures analyst-entered fields and must not score or recommend review outcomes.'
  });
}

function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
