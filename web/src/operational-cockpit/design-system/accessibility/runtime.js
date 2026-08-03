export function createFocusRingAttributes({ visible = true } = {}) {
  return Object.freeze({ 'data-focus-visible': String(Boolean(visible)), className: visible ? 'iips-focus-ring' : 'iips-focus-ring-disabled' });
}

export function createAriaLabel(label) {
  if (!label) throw new Error('Accessible label is required');
  return Object.freeze({ 'aria-label': label });
}

export function createLiveRegion({ politeness = 'polite', atomic = true } = {}) {
  if (!['polite','assertive','off'].includes(politeness)) throw new Error(`Unsupported aria-live value: ${politeness}`);
  return Object.freeze({ role: politeness === 'assertive' ? 'alert' : 'status', 'aria-live': politeness, 'aria-atomic': String(Boolean(atomic)) });
}

export function createVisuallyHiddenStyle() {
  return Object.freeze({ position:'absolute', width:'1px', height:'1px', padding:0, margin:'-1px', overflow:'hidden', clip:'rect(0, 0, 0, 0)', whiteSpace:'nowrap', border:0 });
}

export function prefersReducedMotion({ matchMedia } = {}) {
  if (!matchMedia) return false;
  return Boolean(matchMedia('(prefers-reduced-motion: reduce)').matches);
}

export function createKeyboardActivationHandler({ onActivate }) {
  if (typeof onActivate !== 'function') throw new Error('onActivate callback is required');
  return Object.freeze({
    onKeyDown(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault?.();
        return onActivate(event);
      }
      return undefined;
    }
  });
}
