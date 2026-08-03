export const cockpitComponentDescriptors = Object.freeze({
  AppShell: Object.freeze({ ownsBusinessLogic: false, owns: ['layout regions', 'route state'] }),
  PortfolioHealthHero: Object.freeze({ ownsBusinessLogic: false, consumes: ['PortfolioHealthDTO'] }),
  ActiveReviewQueue: Object.freeze({ ownsBusinessLogic: false, owns: ['selected row id', 'filter state', 'sort state'], consumes: ['OperationalReviewQueueDTO'] }),
  CoverageLedger: Object.freeze({ ownsBusinessLogic: false, consumes: ['CoverageLedgerDTO'] }),
  ResearchSnapshotDrawer: Object.freeze({ ownsBusinessLogic: false, owns: ['open/closed state', 'focus state'], consumes: ['ResearchSnapshotDrawerDTO'] }),
  HumanReviewPanel: Object.freeze({ ownsBusinessLogic: false, owns: ['user-entered review fields'], consumes: ['HumanReviewDTO', 'GovernanceStateDTO'] }),
  GovernanceSidebar: Object.freeze({ ownsBusinessLogic: false, consumes: ['GovernanceStateDTO'] })
});
