export const defaultRoutes = Object.freeze([
  { path: '/', label: 'Dashboard', workspaceId: 'dashboard', featureFlag: 'dashboard_workspace' },
  { path: '/dashboard', label: 'Dashboard', workspaceId: 'dashboard', featureFlag: 'dashboard_workspace' },
  { path: '/company', label: 'Company', workspaceId: 'company', featureFlag: 'company_workspace' },
  { path: '/validation', label: 'Validation', workspaceId: 'validation', featureFlag: 'validation_workspace' },
  { path: '/research', label: 'Research', workspaceId: 'research', featureFlag: 'research_workspace' },
  { path: '/portfolio', label: 'Portfolio', workspaceId: 'portfolio', featureFlag: 'portfolio_workspace' },
  { path: '/decision-center', label: 'Decision Center', workspaceId: 'decision-center', featureFlag: 'decision_center_workspace' },
  { path: '/watchlists', label: 'Watchlists', workspaceId: 'watchlists', featureFlag: 'watchlists_workspace' },
  { path: '/methodologies', label: 'Methodologies', workspaceId: 'methodologies', featureFlag: 'methodology_workspace' }
]);
