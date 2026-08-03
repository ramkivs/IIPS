import React from 'react';
import type { OperationalCockpitDataProvider } from '../services';
import { defaultOperationalCockpitDataProvider, useOperationalCockpitData } from '../services';
import { EmptyState, ThemeProvider } from '../design-system';
import { OperationalCockpit } from './OperationalCockpit';

export function OperationalCockpitContainer({ provider = defaultOperationalCockpitDataProvider }: { provider?: OperationalCockpitDataProvider }) {
  const state = useOperationalCockpitData(provider);

  if (state.status === 'Idle' || state.status === 'Loading') {
    return <ThemeProvider><EmptyState title="Loading cockpit" message="Loading operational cockpit data." /></ThemeProvider>;
  }

  if (state.status === 'Error') {
    return <ThemeProvider><EmptyState title="Cockpit unavailable" message={state.error.message} /></ThemeProvider>;
  }

  if (!state.data) {
    return <ThemeProvider><EmptyState title="Cockpit unavailable" message="Operational cockpit data was not available." /></ThemeProvider>;
  }

  return <OperationalCockpit dto={state.data} />;
}
