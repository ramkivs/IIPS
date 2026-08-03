import { FeatureFlagRegistry, FlagStatus } from '../../../../packages/feature-flags/src/index.js';
import { CapabilityOwnership } from '../../../../packages/plugin-framework/src/index.js';
import { RouteRegistry, Router, defaultRoutes } from '../routing/index.js';
import { WorkspaceLifecycle, WorkspaceRegistry, WorkspaceHost, defaultWorkspaces } from '../workspaces/index.js';
import { createDefaultThemeRegistry, ThemeProvider } from '../theme/index.js';
import { ApplicationShell } from './ApplicationShell.js';

export const defaultShellFeatureFlags = Object.freeze([
  'application_shell',
  'workspace_host',
  'dashboard_workspace',
  'company_workspace',
  'validation_workspace',
  'research_workspace',
  'portfolio_workspace',
  'decision_center_workspace',
  'watchlists_workspace',
  'methodology_workspace'
]);

export function registerDefaultFeatureFlags(registry, { enabled = true } = {}) {
  for (const flag_id of defaultShellFeatureFlags) {
    if (!registry.get(flag_id)) registry.register({ flag_id, default_enabled: enabled, owner: 'application-shell', status: FlagStatus.active });
  }
  return registry;
}

export function createApplicationShell({ app, enabledFeatures = true } = {}) {
  const container = app.container;
  const eventBus = container.resolve('eventBus');
  const diagnostics = container.resolve('diagnostics');
  const featureFlagRegistry = container.resolve('featureFlagRegistry') || new FeatureFlagRegistry();
  registerDefaultFeatureFlags(featureFlagRegistry, { enabled: enabledFeatures });

  const routeRegistry = new RouteRegistry();
  defaultRoutes.forEach(route => routeRegistry.register(route));

  const lifecycle = new WorkspaceLifecycle({ diagnostics });
  const workspaceRegistry = new WorkspaceRegistry({ lifecycle });
  defaultWorkspaces.forEach(workspace => workspaceRegistry.register(workspace));

  const capabilityRegistry = container.resolve('capabilityRegistry');
  if (!capabilityRegistry.resolve('workspace.dashboard')) {
    capabilityRegistry.register({
      capability_id: 'workspace.dashboard',
      provider_id: 'application-shell',
      owner_type: 'application',
      ownership: CapabilityOwnership.exclusive,
      version: '1.0.0',
      implementation: { workspaceId: 'dashboard' }
    });
  }

  const router = new Router({ routeRegistry, featureFlagRegistry, environment: app.config.environment, eventBus, diagnostics });
  const workspaceHost = new WorkspaceHost({ workspaceRegistry, lifecycle, featureFlagRegistry, environment: app.config.environment, eventBus, diagnostics });
  const themeRegistry = createDefaultThemeRegistry();
  const themeProvider = new ThemeProvider({ themeRegistry, eventBus, diagnostics });
  const shell = new ApplicationShell({ app, router, routeRegistry, workspaceHost, themeProvider, eventBus, diagnostics });

  return Object.freeze({ shell, routeRegistry, router, lifecycle, workspaceRegistry, workspaceHost, themeRegistry, themeProvider });
}
