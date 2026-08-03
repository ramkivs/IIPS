export const FOCUS_MANAGER_VERSION = 'Focus Manager v1.0';

export function createFocusPlan({ from = null, to, reason = 'navigation' }) {
  if (!to) throw new Error('focus target is required');
  return Object.freeze({
    version: FOCUS_MANAGER_VERSION,
    from,
    to,
    reason,
    ownsBusinessLogic: false,
    guardrail: 'Focus plans manage accessibility focus only and must not encode workflow semantics.'
  });
}

export function focusForNavigationState(state) {
  return createFocusPlan({ to: state.focusTarget, reason: 'navigation-state-change' });
}

export function createKeyboardTraversal({ regions }) {
  if (!Array.isArray(regions) || regions.length === 0) throw new Error('regions are required');
  return Object.freeze({
    version: FOCUS_MANAGER_VERSION,
    regions: [...regions],
    ownsBusinessLogic: false,
    next(current) {
      const index = regions.indexOf(current);
      return regions[(index + 1 + regions.length) % regions.length];
    },
    previous(current) {
      const index = regions.indexOf(current);
      return regions[(index - 1 + regions.length) % regions.length];
    }
  });
}
