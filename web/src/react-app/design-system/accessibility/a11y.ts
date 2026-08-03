import type React from 'react';

export function ariaLabel(label: string): { 'aria-label': string } {
  if (!label) throw new Error('Accessible label is required');
  return { 'aria-label': label };
}

export function visuallyHiddenStyle(): React.CSSProperties {
  return { position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 };
}

export function handleKeyboardActivation(onActivate: () => void) {
  return (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onActivate();
    }
  };
}

export function liveRegionProps(politeness: 'polite' | 'assertive' = 'polite') {
  return { role: politeness === 'assertive' ? 'alert' : 'status', 'aria-live': politeness, 'aria-atomic': true } as const;
}
