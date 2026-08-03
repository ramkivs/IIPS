import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/bootstrap/createApp.js';
import { createApplicationShell, ShellEventType, registerDefaultFeatureFlags } from '../src/shell/index.js';
import { RouteRegistry, Router } from '../src/routing/index.js';
import { WorkspaceLifecycle, WorkspaceRegistry, WorkspaceHost, createWorkspacePlaceholder } from '../src/workspaces/index.js';
import { createDefaultThemeRegistry, ThemeProvider } from '../src/theme/index.js';
import { CapabilityOwnership } from '../../../packages/plugin-framework/src/index.js';

function createRuntime(options = {}) {
  const app = createApp({ env: { NODE_ENV: 'test' } });
  return { app, ...createApplicationShell({ app, ...options }) };
}

test('application shell starts, renders institutional layout, and shuts down', () => {
  const runtime = createRuntime();
  const result = runtime.shell.start('/');

  assert.equal(result.status, 'mounted');
  assert.equal(runtime.shell.getState().lifecycleState, 'ready');
  assert.equal(result.view.type, 'layout');
  assert.equal(result.view.regions.header.role, 'banner');
  assert.equal(result.view.regions.sidebar.role, 'navigation');
  assert.equal(result.view.regions.content.role, 'main');
  assert.equal(result.view.regions.footer.role, 'contentinfo');
  assert.equal(result.view.regions.content.content.businessLogic, false);

  assert.equal(runtime.shell.shutdown(), true);
  assert.equal(runtime.shell.getState().lifecycleState, 'shutdown');
});

test('shell publishes application lifecycle diagnostics and event-bus events', () => {
  const runtime = createRuntime();
  runtime.shell.start('/research');

  const events = runtime.app.container.resolve('eventStore').all().map(event => event.type);
  assert.equal(events.includes(ShellEventType.ApplicationStarted), true);
  assert.equal(events.includes(ShellEventType.ApplicationReady), true);
  assert.equal(events.includes(ShellEventType.RouteChanged), true);
  assert.equal(events.includes(ShellEventType.WorkspaceMounted), true);

  const diagnosticEvents = runtime.app.diagnostics.snapshot().events.map(event => event.event);
  assert.equal(diagnosticEvents.includes('shell.ApplicationStarted'), true);
  assert.equal(diagnosticEvents.includes('workspace.Mounted'), true);
});

test('routing resolves valid routes and handles invalid routes without business behavior', () => {
  const runtime = createRuntime();

  const valid = runtime.router.navigate('/portfolio');
  assert.equal(valid.status, 'resolved');
  assert.equal(valid.route.workspaceId, 'portfolio');

  const invalid = runtime.router.navigate('/not-a-route');
  assert.equal(invalid.status, 'not_found');
});

test('workspace registry registers, mounts, renders, and unloads workspace shells', () => {
  const runtime = createRuntime();

  const mounted = runtime.workspaceHost.mount('decision-center');
  assert.equal(mounted.status, 'mounted');
  assert.equal(mounted.view.type, 'workspace-placeholder');
  assert.equal(mounted.view.businessLogic, false);

  const unmounted = runtime.workspaceHost.unmount();
  assert.equal(unmounted.status, 'unmounted');
  assert.equal(unmounted.workspaceId, 'decision-center');

  const states = runtime.lifecycle.history().map(transition => transition.state);
  assert.equal(states.includes('Registered'), true);
  assert.equal(states.includes('Mounted'), true);
  assert.equal(states.includes('Rendered'), true);
  assert.equal(states.includes('Diagnosed'), true);
  assert.equal(states.includes('Unmounted'), true);
});

test('feature flags fail closed for disabled routes and workspaces', () => {
  const app = createApp({ env: { NODE_ENV: 'test' } });
  const flags = app.container.resolve('featureFlagRegistry');
  registerDefaultFeatureFlags(flags, { enabled: true });
  // A pre-registered flag is not overwritten by shell creation.
  // Use a dedicated route/workspace to prove missing flags fail closed below.
  const runtime = createApplicationShell({ app });

  const missingFlagRouteRegistry = new RouteRegistry();
  missingFlagRouteRegistry.register({ path: '/closed', label: 'Closed', workspaceId: 'closed', featureFlag: 'missing_flag' });
  const router = new Router({ routeRegistry: missingFlagRouteRegistry, featureFlagRegistry: flags, environment: 'test', eventBus: app.container.resolve('eventBus'), diagnostics: app.diagnostics });
  assert.equal(router.navigate('/closed').status, 'blocked');

  const lifecycle = new WorkspaceLifecycle({ diagnostics: app.diagnostics });
  const workspaceRegistry = new WorkspaceRegistry({ lifecycle });
  workspaceRegistry.register({ workspaceId: 'closed', label: 'Closed', featureFlag: 'missing_flag', render: createWorkspacePlaceholder({ title: 'Closed', description: 'Closed' }) });
  const host = new WorkspaceHost({ workspaceRegistry, lifecycle, featureFlagRegistry: flags, environment: 'test', eventBus: app.container.resolve('eventBus'), diagnostics: app.diagnostics });
  assert.equal(host.mount('closed').status, 'blocked');

  assert.equal(runtime.shell.navigate('/research').status, 'mounted');
});

test('disabled feature flag blocks the governed workspace route', () => {
  const app = createApp({ env: { NODE_ENV: 'test' } });
  const flags = app.container.resolve('featureFlagRegistry');
  for (const flagId of ['application_shell', 'workspace_host', 'dashboard_workspace', 'portfolio_workspace', 'decision_center_workspace', 'watchlists_workspace', 'methodology_workspace']) {
    flags.register({ flag_id: flagId, default_enabled: true, owner: 'test', status: 'active' });
  }
  flags.register({ flag_id: 'research_workspace', default_enabled: false, owner: 'test', status: 'active' });

  const runtime = createApplicationShell({ app });
  const result = runtime.shell.navigate('/research');

  assert.equal(result.status, 'blocked');
  assert.equal(runtime.shell.getState().activeWorkspace, null);
  assert.equal(app.container.resolve('eventStore').all().some(event => event.type === ShellEventType.FeatureBlocked), true);
});

test('plugin workspace capability can be mounted through workspace registry without plugin business logic', () => {
  const runtime = createRuntime();
  const capabilityRegistry = runtime.app.container.resolve('capabilityRegistry');

  capabilityRegistry.register({
    capability_id: 'workspace.plugin.research-notes',
    provider_id: 'test-plugin',
    owner_type: 'plugin',
    ownership: CapabilityOwnership.exclusive,
    version: '1.0.0',
    implementation: {
      workspace: {
        workspaceId: 'plugin-research-notes',
        label: 'Plugin Research Notes',
        featureFlag: 'research_workspace',
        render: createWorkspacePlaceholder({ title: 'Plugin Research Notes Shell', description: 'Plugin supplied placeholder.' })
      }
    }
  });

  const capability = capabilityRegistry.resolve('workspace.plugin.research-notes');
  const registered = runtime.workspaceRegistry.registerFromCapability(capability);
  const mounted = runtime.workspaceHost.mount(registered.workspaceId);

  assert.equal(registered.source, 'test-plugin');
  assert.equal(mounted.status, 'mounted');
  assert.equal(mounted.view.businessLogic, false);
});

test('theme infrastructure supports light, dark, system, and emits theme changes', () => {
  const runtime = createRuntime();

  assert.deepEqual(runtime.themeRegistry.list().map(theme => theme.themeId), ['light', 'dark', 'system']);
  assert.equal(runtime.themeProvider.getTheme().themeId, 'system');

  const view = runtime.shell.switchTheme('dark');
  assert.equal(runtime.themeProvider.getTheme().themeId, 'dark');
  assert.equal(runtime.shell.getState().theme, 'dark');
  assert.equal(view.theme, 'dark');
  assert.equal(runtime.app.container.resolve('eventStore').all().some(event => event.type === ShellEventType.ThemeChanged), true);
});

test('theme provider rejects invalid themes safely', () => {
  const registry = createDefaultThemeRegistry();
  const provider = new ThemeProvider({ themeRegistry: registry });
  assert.throws(() => provider.setTheme('terminal-blue'));
});

test('error boundary captures failed workspace mount diagnostics', () => {
  const runtime = createRuntime();
  const failed = runtime.workspaceHost.mount('missing-workspace');

  assert.equal(failed.status, 'failed');
  assert.equal(runtime.app.container.resolve('eventStore').all().some(event => event.type === ShellEventType.WorkspaceFailed), true);
  assert.equal(runtime.lifecycle.history().some(transition => transition.state === 'Failed'), true);
});
