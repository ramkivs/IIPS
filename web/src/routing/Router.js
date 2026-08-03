import { FeatureGate } from '../../../../packages/feature-flags/src/index.js';
import { ShellEventType, publishShellEvent } from '../shell/events.js';

export class Router {
  constructor({ routeRegistry, featureFlagRegistry, environment = 'development', eventBus, diagnostics } = {}) {
    this.routeRegistry = routeRegistry;
    this.featureGate = new FeatureGate({ registry: featureFlagRegistry, environment });
    this.eventBus = eventBus;
    this.diagnostics = diagnostics;
  }

  resolve(path) {
    const route = this.routeRegistry.resolve(path);
    if (!route) return Object.freeze({ status: 'not_found', path, route: null });
    if (route.featureFlag && !this.featureGate.isEnabled(route.featureFlag)) {
      publishShellEvent({ eventBus: this.eventBus, diagnostics: this.diagnostics, type: ShellEventType.FeatureBlocked, payload: { path, featureFlag: route.featureFlag }, source: 'Router' });
      return Object.freeze({ status: 'blocked', path, route, reason: 'feature_disabled' });
    }
    return Object.freeze({ status: 'resolved', path, route });
  }

  navigate(path) {
    const result = this.resolve(path);
    if (result.status === 'resolved') {
      publishShellEvent({ eventBus: this.eventBus, diagnostics: this.diagnostics, type: ShellEventType.RouteChanged, payload: { path, workspaceId: result.route.workspaceId }, source: 'Router' });
    }
    return result;
  }
}
