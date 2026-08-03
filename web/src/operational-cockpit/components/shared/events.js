export const UIInteractionEvent = Object.freeze({
  rowSelected: 'RowSelected',
  filterChanged: 'FilterChanged',
  sortChanged: 'SortChanged',
  coverageExpanded: 'CoverageExpanded',
  drawerOpened: 'DrawerOpened',
  drawerClosed: 'DrawerClosed',
  fieldChanged: 'FieldChanged',
  reviewSubmitted: 'ReviewSubmitted',
  restrictionAcknowledged: 'RestrictionAcknowledged'
});

export function createUIEvent(type, payload = {}) {
  if (!Object.values(UIInteractionEvent).includes(type)) throw new Error(`Unsupported UI interaction event: ${type}`);
  return deepFreeze({
    type,
    payload,
    source: 'OperationalCockpitUI',
    businessEvent: false,
    guardrail: 'UI interaction events describe presentation interaction only and must not encode business semantics.'
  });
}

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
