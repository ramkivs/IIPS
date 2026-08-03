import { createPlatformEvent } from '../../../../packages/shared-types/src/index.js';

export const ShellEventType = Object.freeze({
  ApplicationStarted: 'ApplicationStarted',
  ApplicationReady: 'ApplicationReady',
  RouteChanged: 'RouteChanged',
  WorkspaceMounted: 'WorkspaceMounted',
  WorkspaceUnmounted: 'WorkspaceUnmounted',
  FeatureBlocked: 'FeatureBlocked',
  WorkspaceFailed: 'WorkspaceFailed',
  ThemeChanged: 'ThemeChanged',
  ApplicationShutdown: 'ApplicationShutdown'
});

export function publishShellEvent({ eventBus, diagnostics, type, payload = {}, source = 'ApplicationShell' }) {
  diagnostics?.record?.(`shell.${type}`, payload);
  if (!eventBus) return null;
  return eventBus.publish(createPlatformEvent({ type, source, payload })).event;
}
