export const reactDesignTokens = {
  color: {
    background: { page: '#f5f7fa', panel: '#ffffff', subtle: '#f9fafc', overlay: 'rgba(17, 24, 39, 0.56)' },
    border: { default: '#d9dee7', subtle: '#e7ebf2', focus: '#1f5f99' },
    text: { primary: '#1f2937', secondary: '#6b7280', inverse: '#ffffff', disabled: '#9ca3af' },
    status: { high: '#b42318', medium: '#8a5a12', low: '#46566f', good: '#1f7a4d', info: '#1f5f99' },
    semantic: {
      primary: '#172338',
      secondary: '#46566f',
      surface: '#ffffff',
      background: '#f5f7fa',
      border: '#d9dee7',
      success: '#1f7a4d',
      warning: '#8a5a12',
      error: '#b42318',
      info: '#1f5f99',
      focus: '#1f5f99',
      disabled: '#9ca3af',
      overlay: 'rgba(17, 24, 39, 0.56)'
    }
  },
  typography: {
    family: { sans: 'Inter, system-ui, sans-serif', mono: 'SFMono-Regular, Consolas, monospace' },
    size: { caption: '11px', body: '13px', bodyLarge: '15px', heading: '16px', hero: '22px', display: '28px' },
    weight: { regular: 400, semibold: 600, bold: 800 },
    lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.65 }
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, space12: 12, space20: 20, space40: 40, space48: 48, space64: 64 },
  radius: { sm: 8, md: 12, lg: 14 },
  elevation: { base: 'none', raised: '0 8px 24px rgba(20, 33, 61, 0.08)', overlay: '0 18px 48px rgba(20, 33, 61, 0.18)', panel: '0 8px 24px rgba(20, 33, 61, 0.08)', none: 'none' },
  motion: { durationFast: '120ms', durationBase: '180ms', easingStandard: 'ease-out' }
} as const;

export type ReactDesignTokens = typeof reactDesignTokens;

export function flattenDesignTokens(tokens: object = reactDesignTokens, path: string[] = []): Record<string, string> {
  return Object.entries(tokens).reduce<Record<string, string>>((acc, [key, value]) => {
    const nextPath = [...path, camelToKebab(key)];
    if (value && typeof value === 'object' && !Array.isArray(value)) Object.assign(acc, flattenDesignTokens(value, nextPath));
    else acc[`--iips-${nextPath.join('-')}`] = String(value);
    return acc;
  }, {});
}

export function designTokenAliases(tokens: ReactDesignTokens = reactDesignTokens): Record<string, string> {
  return {
    '--color-primary': tokens.color.semantic.primary,
    '--color-secondary': tokens.color.semantic.secondary,
    '--color-surface': tokens.color.semantic.surface,
    '--color-background': tokens.color.semantic.background,
    '--color-border': tokens.color.semantic.border,
    '--color-text-primary': tokens.color.text.primary,
    '--color-text-secondary': tokens.color.text.secondary,
    '--color-success': tokens.color.semantic.success,
    '--color-warning': tokens.color.semantic.warning,
    '--color-error': tokens.color.semantic.error,
    '--color-info': tokens.color.semantic.info,
    '--color-focus': tokens.color.semantic.focus,
    '--color-disabled': tokens.color.semantic.disabled,
    '--color-overlay': tokens.color.semantic.overlay,
    '--space-4': `${tokens.spacing.xs}px`,
    '--space-8': `${tokens.spacing.sm}px`,
    '--space-12': `${tokens.spacing.space12}px`,
    '--space-16': `${tokens.spacing.md}px`,
    '--space-20': `${tokens.spacing.space20}px`,
    '--space-24': `${tokens.spacing.lg}px`,
    '--space-32': `${tokens.spacing.xl}px`,
    '--space-40': `${tokens.spacing.space40}px`,
    '--space-48': `${tokens.spacing.space48}px`,
    '--space-64': `${tokens.spacing.space64}px`,
    '--radius-small': `${tokens.radius.sm}px`,
    '--radius-medium': `${tokens.radius.md}px`,
    '--radius-large': `${tokens.radius.lg}px`,
    '--elevation-base': tokens.elevation.base,
    '--elevation-raised': tokens.elevation.raised,
    '--elevation-overlay': tokens.elevation.overlay
  };
}

function camelToKebab(value: string) {
  return value.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
}
