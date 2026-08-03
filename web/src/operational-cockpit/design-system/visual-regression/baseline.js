export const visualRegressionBaseline = Object.freeze({
  version: 'Visual Regression Baseline v1.0',
  captureTooling: 'Not configured in M2; baseline states documented for future tooling.',
  componentStates: Object.freeze({
    Button: ['default','hover','focus','disabled'],
    Badge: ['Certified','Verified','Provisional','Incomplete','Missing','Unknown'],
    EmptyState: ['No Material Changes','Missing Comparison Evidence','No Portfolio Holdings','Unknown'],
    RefreshIndicator: ['Idle','Refreshing','Completed','Failed'],
    GovernanceRestrictionBanner: ['Normal','Governance Freeze Active','Read Only','Restricted Action','Maintenance Mode'],
    Drawer: ['closed','open','refreshing','error recoverable','selected item removed'],
    DataTable: ['loading','ready','empty','error','row selected']
  }),
  acceptance: Object.freeze([
    'status text remains visible',
    'focus indicator visible',
    'no color-only status communication',
    'layout remains readable at defined breakpoints',
    'no business logic introduced in visual states'
  ])
});
