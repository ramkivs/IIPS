export const operationalCockpitTokens = Object.freeze({
  color: Object.freeze({
    background: Object.freeze({ page: '#f5f7fa', panel: '#ffffff', subtle: '#f9fafc' }),
    border: Object.freeze({ default: '#d9dee7', subtle: '#e7ebf2' }),
    text: Object.freeze({ primary: '#1f2937', secondary: '#6b7280', inverse: '#ffffff' }),
    status: Object.freeze({ high: '#b42318', medium: '#b7791f', low: '#46566f', good: '#1f7a4d', info: '#1f5f99' })
  }),
  typography: Object.freeze({
    family: Object.freeze({ sans: 'Inter, system-ui, sans-serif', mono: 'SFMono-Regular, Consolas, monospace' }),
    size: Object.freeze({ caption: '11px', body: '13px', heading: '16px', hero: '22px' }),
    weight: Object.freeze({ regular: 400, semibold: 600, bold: 800 })
  }),
  spacing: Object.freeze({ xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }),
  radius: Object.freeze({ sm: 8, md: 12, lg: 14 }),
  elevation: Object.freeze({ panel: '0 8px 24px rgba(20, 33, 61, 0.08)', none: 'none' })
});

export const designSystemStatus = Object.freeze({
  version: 'Design System v1.0 foundation',
  behaviorLogic: false,
  ownsBusinessLogic: false,
  purpose: 'Provide presentation tokens and primitive descriptors for React implementation.'
});
