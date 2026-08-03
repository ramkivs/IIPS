export const LoadingMessage = Object.freeze({
  initializing: 'Initializing application...',
  workspace: 'Loading workspace...',
  module: 'Preparing module...'
});

export function LoadingState({ message = LoadingMessage.initializing } = {}) {
  return Object.freeze({
    type: 'loading',
    role: 'status',
    ariaLive: 'polite',
    message
  });
}
