export function Header({ title = 'IIPS v2.0', subtitle = 'Institutional Investment Operating System' } = {}) {
  return Object.freeze({ region: 'header', role: 'banner', title, subtitle });
}

export function Sidebar({ items = [] } = {}) {
  return Object.freeze({ region: 'sidebar', role: 'navigation', ariaLabel: 'Primary navigation', items: Object.freeze(items.slice()) });
}

export function ContentArea({ content } = {}) {
  return Object.freeze({ region: 'content', role: 'main', content });
}

export function Footer({ status = 'Ready' } = {}) {
  return Object.freeze({ region: 'footer', role: 'contentinfo', status });
}

export function LayoutContainer({ header, sidebar, content, footer, theme = 'system' }) {
  return Object.freeze({
    type: 'layout',
    theme,
    regions: Object.freeze({ header, sidebar, content, footer })
  });
}
