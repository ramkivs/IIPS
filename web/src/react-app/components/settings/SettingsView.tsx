import React from 'react';
import type { OperationalCockpitDTO } from '../../contracts';
import { Alert, Grid, Panel, Stack } from '../../design-system';

export function SettingsView({ dto }: { dto: OperationalCockpitDTO }) {
  return (
    <section aria-label="Settings" className="iips-settings-view">
      <Stack gap="lg">
        <Grid columns={2}>
          <Panel title="Application Information" aria-label="Application Information"><dl><dt>Application</dt><dd>Operational Cockpit v1.1</dd><dt>Cycle</dt><dd>{dto.cycleId}</dd><dt>Generated at</dt><dd>{dto.generatedAt}</dd></dl></Panel>
          <Panel title="Governance / Contract Information" aria-label="Governance Contract Information"><dl><dt>Governance version</dt><dd>{dto.governanceState.governanceVersion}</dd><dt>Governance state</dt><dd>{dto.governanceState.governanceState}</dd><dt>Effective at</dt><dd>{dto.governanceState.effectiveAt}</dd></dl></Panel>
        </Grid>
        <Grid columns={2}>
          <Panel title="Provider Information" aria-label="Provider Information"><Unavailable message="Provider identity and runtime mode are not supplied in the current presentation DTO." /></Panel>
          <Panel title="User Preferences" aria-label="User Preferences"><Unavailable message="User preference settings are not supplied in the current presentation DTO and are read-only in v1.1." /></Panel>
        </Grid>
        <Panel title="Security Boundary" aria-label="Security Boundary"><Alert variant="info">Frontend settings do not control authentication, authorization, or backend security policy.</Alert></Panel>
      </Stack>
    </section>
  );
}

function Unavailable({ message }: { message: string }) {
  return <Alert variant="info">{message}</Alert>;
}
