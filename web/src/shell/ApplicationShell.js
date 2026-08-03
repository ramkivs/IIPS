import { ApplicationLifecycleState, ShellStateStore, createApplicationState } from './ApplicationState.js';
import { Header, Sidebar, ContentArea, Footer, LayoutContainer } from './LayoutContainer.js';
import { LoadingState } from './LoadingState.js';
import { ErrorBoundary } from './ErrorBoundary.js';
import { ShellEventType, publishShellEvent } from './events.js';

export class ApplicationShell {
  constructor({ app, router, routeRegistry, workspaceHost, themeProvider, stateStore, eventBus, diagnostics } = {}) {
    this.app = app;
    this.router = router;
    this.routeRegistry = routeRegistry;
    this.workspaceHost = workspaceHost;
    this.themeProvider = themeProvider;
    this.eventBus = eventBus || app?.container?.resolve?.('eventBus');
    this.diagnostics = diagnostics || app?.diagnostics;
    this.stateStore = stateStore || new ShellStateStore(createApplicationState());
    this.errorBoundary = new ErrorBoundary({ eventBus: this.eventBus, diagnostics: this.diagnostics });
  }

  start(path = '/') {
    this.stateStore.transition({ lifecycleState: ApplicationLifecycleState.starting });
    publishShellEvent({ eventBus: this.eventBus, diagnostics: this.diagnostics, type: ShellEventType.ApplicationStarted, payload: { path } });
    const health = this.app?.start?.() || { status: 'unknown' };
    this.stateStore.transition({ healthStatus: health.status || 'unknown' });
    const result = this.navigate(path);
    const lifecycleState = result.status === 'mounted' ? ApplicationLifecycleState.ready : ApplicationLifecycleState.degraded;
    this.stateStore.transition({ lifecycleState });
    publishShellEvent({ eventBus: this.eventBus, diagnostics: this.diagnostics, type: ShellEventType.ApplicationReady, payload: { path, lifecycleState } });
    return result;
  }

  navigate(path) {
    return this.errorBoundary.run(() => {
      const routeResult = this.router.navigate(path);
      if (routeResult.status !== 'resolved') {
        this.stateStore.transition({ activeRoute: path, activeWorkspace: null, error: routeResult.status });
        return Object.freeze({ status: routeResult.status, routeResult, view: this.renderStatus(routeResult) });
      }
      const mountResult = this.workspaceHost.mount(routeResult.route.workspaceId);
      this.stateStore.transition({ activeRoute: path, activeWorkspace: mountResult.status === 'mounted' ? mountResult.workspaceId : null, error: mountResult.status === 'mounted' ? null : mountResult.status });
      return Object.freeze({ ...mountResult, routeResult, view: this.render(mountResult.view) });
    }, { operation: 'navigate', path });
  }

  render(content = LoadingState()) {
    const state = this.stateStore.getState();
    const visibleRoutes = this.routeRegistry.list().map(route => Object.freeze({ path: route.path, label: route.label, workspaceId: route.workspaceId, featureFlag: route.featureFlag }));
    return LayoutContainer({
      theme: state.theme,
      header: Header(),
      sidebar: Sidebar({ items: visibleRoutes }),
      content: ContentArea({ content }),
      footer: Footer({ status: `${state.lifecycleState}:${state.healthStatus}` })
    });
  }

  renderStatus(result) {
    return this.render(Object.freeze({ type: result.status, message: result.status === 'blocked' ? 'Feature is disabled.' : 'Route not found.', path: result.path }));
  }

  switchTheme(themeId) {
    const theme = this.themeProvider.setTheme(themeId);
    this.stateStore.transition({ theme: theme.themeId });
    return this.render();
  }

  shutdown() {
    this.workspaceHost.unmount();
    this.app?.shutdown?.();
    this.stateStore.transition({ lifecycleState: ApplicationLifecycleState.shutdown });
    publishShellEvent({ eventBus: this.eventBus, diagnostics: this.diagnostics, type: ShellEventType.ApplicationShutdown, payload: {} });
    return true;
  }

  getState() { return this.stateStore.getState(); }
}
