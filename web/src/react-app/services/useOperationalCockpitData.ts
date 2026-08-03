import { useEffect, useState } from 'react';
import type { OperationalCockpitDataProvider, OperationalCockpitDataState } from './OperationalCockpitDataProvider';
import { defaultOperationalCockpitDataProvider } from './OperationalCockpitDataProvider';

export function useOperationalCockpitData(provider: OperationalCockpitDataProvider = defaultOperationalCockpitDataProvider): OperationalCockpitDataState {
  const [state, setState] = useState<OperationalCockpitDataState>({ status: 'Idle', data: null, error: null });

  useEffect(() => {
    let active = true;
    setState({ status: 'Loading', data: null, error: null });
    provider.getCockpit()
      .then(data => { if (active) setState({ status: 'Ready', data, error: null }); })
      .catch(error => { if (active) setState({ status: 'Error', data: null, error: error instanceof Error ? error : new Error(String(error)) }); });
    return () => { active = false; };
  }, [provider]);

  return state;
}
