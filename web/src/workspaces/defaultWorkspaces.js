import { createCompanyWorkspaceView } from './company/index.js';
import { createValidationWorkspaceView } from './validation/index.js';

export function createWorkspacePlaceholder({ title, description }) {
  return ({ workspaceId, label }) => Object.freeze({
    type: 'workspace-placeholder',
    workspaceId,
    label,
    title,
    description,
    businessLogic: false,
    message: 'Workspace shell only. Product functionality will be implemented in a future approved sprint.'
  });
}

export const defaultWorkspaces = Object.freeze([
  { workspaceId: 'dashboard', label: 'Dashboard', featureFlag: 'dashboard_workspace', description: 'Institutional command surface placeholder.', render: createWorkspacePlaceholder({ title: 'Dashboard Shell', description: 'Application landing workspace shell.' }) },
  { workspaceId: 'company', label: 'Company', featureFlag: 'company_workspace', description: 'Company Workspace for business analysis.', render: createCompanyWorkspaceView },
  { workspaceId: 'validation', label: 'Validation', featureFlag: 'validation_workspace', description: 'Internal QA workspace for Company Workspace validation.', render: createValidationWorkspaceView },
  { workspaceId: 'research', label: 'Research', featureFlag: 'research_workspace', description: 'Research workspace placeholder.', render: createWorkspacePlaceholder({ title: 'Research Workspace Shell', description: 'Future research module host.' }) },
  { workspaceId: 'portfolio', label: 'Portfolio', featureFlag: 'portfolio_workspace', description: 'Portfolio workspace placeholder.', render: createWorkspacePlaceholder({ title: 'Portfolio Workspace Shell', description: 'Future portfolio module host.' }) },
  { workspaceId: 'decision-center', label: 'Decision Center', featureFlag: 'decision_center_workspace', description: 'Decision center placeholder.', render: createWorkspacePlaceholder({ title: 'Decision Center Shell', description: 'Future decision workflow module host.' }) },
  { workspaceId: 'watchlists', label: 'Watchlists', featureFlag: 'watchlists_workspace', description: 'Watchlists placeholder.', render: createWorkspacePlaceholder({ title: 'Watchlists Shell', description: 'Future watchlist module host.' }) },
  { workspaceId: 'methodologies', label: 'Methodologies', featureFlag: 'methodology_workspace', description: 'Methodology explorer placeholder.', render: createWorkspacePlaceholder({ title: 'Methodology Explorer Shell', description: 'Future methodology module host.' }) }
]);
