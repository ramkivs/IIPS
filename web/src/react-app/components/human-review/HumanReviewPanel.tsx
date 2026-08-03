import React, { useState } from 'react';
import type { HumanReviewDTO, ReviewSubmissionDTO } from '../../contracts';
import { Panel } from '../../design-system';

export function HumanReviewPanel({ review, onFieldChanged, onReviewSubmitted }: { review: HumanReviewDTO | null; onFieldChanged?: (field: keyof HumanReviewDTO, value: unknown) => void; onReviewSubmitted?: (submission: Partial<ReviewSubmissionDTO>) => void }) {
  const [notes, setNotes] = useState(review?.notes ?? '');
  if (!review) return null;
  return (
    <Panel title="Human Review Panel">
      <label>Reviewer confirmed <select aria-label="Reviewer confirmed" onChange={event => onFieldChanged?.('reviewerConfirmed', event.target.value === 'Yes')}><option></option><option>Yes</option><option>No</option></select></label>
      <label>Final disposition <select aria-label="Final disposition" onChange={event => onFieldChanged?.('finalDisposition', event.target.value)}><option></option><option>Confirmed</option><option>Confirmed - Explanation Improvement</option><option>False Positive</option><option>Needs More Evidence</option></select></label>
      <label>Notes <textarea aria-label="Review notes" value={notes} onChange={event => { setNotes(event.target.value); onFieldChanged?.('notes', event.target.value); }} /></label>
      <button type="button" onClick={() => onReviewSubmitted?.({ reviewItemId: review.reviewItemId, humanReview: { ...review, notes } })}>Submit Review</button>
    </Panel>
  );
}
