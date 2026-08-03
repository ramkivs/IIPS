import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/bootstrap/createApp.js';
import { createApplicationShell } from '../src/shell/index.js';
import {
  createValidationWorkspaceView,
  createDemoCompanies,
  createValidationDataset,
  createValidationRun,
  importDataset,
  validateDataset,
  previewDataset,
  executeValidationRun,
  validateCompanyWorkspaceArchitecture,
  runCompanyWorkspaceReadOnly,
  createValidationReport,
  exportTable,
  COMPANY_WORKSPACE_V1_CONTRACT,
  validationProfiles,
  ValidationTrigger,
  createDemoSnapshotComparisons,
  createDemoValidationHistories,
  createInvestorReviewIntelligence,
  AttentionReason,
  ReviewPriority,
  ReviewLifecycleState,
  ReviewDeadlineState,
  ReviewSourceProfile,
  JournalHandoffStatus,
  SuggestedWorkspace,
  OperationalPolicy,
  DataReadinessStatus,
  EmptyQueueReason
} from '../src/workspaces/index.js';

test('Validation Workspace route mounts as internal QA workspace', () => {
  const app = createApp({ env: { NODE_ENV: 'test' } });
  const runtime = createApplicationShell({ app });
  const result = runtime.shell.start('/validation');

  assert.equal(result.status, 'mounted');
  assert.equal(result.workspaceId, 'validation');
  const view = result.view.regions.content.content;
  assert.equal(view.type, 'validation-workspace');
  assert.equal(view.internalTool, true);
  assert.equal(view.investorFacing, false);
  assert.equal(view.readOnlyWithRespectToCompanyWorkspace, true);
  assert.equal(view.navigation.includes('Release Approval'), true);
});

test('Validation Workspace home exposes attention widgets and quick actions', () => {
  const view = createValidationWorkspaceView();

  assert.equal(view.home.investorQuestion, 'What validation work requires attention?');
  assert.equal(view.home.widgets.validationRuns.completed, 1);
  assert.equal(typeof view.home.widgets.averagePassRate, 'number');
  assert.equal(view.home.widgets.architectureDrift, false);
  assert.equal(view.home.quickActions.includes('New Validation Run'), true);
  assert.equal(view.home.quickActions.includes('Release Approval'), true);
});

test('Dataset service imports, previews, and validates large datasets', () => {
  const dataset = importDataset({ name: 'Large QA Dataset', owner: 'QA', rows: createDemoCompanies(500) });
  const validation = validateDataset(dataset);
  const preview = previewDataset(dataset);

  assert.equal(dataset.companies.length, 500);
  assert.equal(validation.status, 'PASS');
  assert.equal(validation.supportsLargeDatasets, true);
  assert.equal(preview.companies, 500);
  assert.equal(preview.sample.length, 10);
});

test('Dataset validation detects duplicates, invalid symbols, and missing symbols', () => {
  const dataset = importDataset({ name: 'Bad Dataset', rows: [
    { ticker: 'ABC', company: 'ABC Ltd' },
    { ticker: 'ABC', company: 'ABC Duplicate' },
    { ticker: 'BAD SYMBOL!', company: 'Bad Symbol' },
    { ticker: '', company: 'Missing Symbol' }
  ] });
  const validation = validateDataset(dataset);

  assert.equal(validation.status, 'WARNING');
  assert.deepEqual(validation.duplicates, ['ABC']);
  assert.deepEqual(validation.invalidSymbols, ['BAD SYMBOL!']);
  assert.deepEqual(validation.missingSymbols, ['Missing Symbol']);
});

test('Validation execution runs Company Workspace read-only in batch', () => {
  const dataset = createValidationDataset({ name: 'Batch Dataset', companies: createDemoCompanies(120) });
  const run = createValidationRun({ dataset, execution: { parallelWorkers: 4 } });
  const execution = executeValidationRun({ run, dataset, workerCount: 4 });

  assert.equal(execution.summary.companies, 120);
  assert.equal(execution.summary.failures, 0);
  assert.equal(execution.summary.architectureDrift, false);
  assert.equal(execution.summary.guardrailViolations, 0);
  assert.equal(execution.workerPool.configuredWorkers, 4);
  assert.equal(execution.queue.every(item => item.progress === 100), true);
});

test('Company Workspace consumer is read-only and returns released outputs', () => {
  const output = runCompanyWorkspaceReadOnly(createDemoCompanies(1)[0]);

  assert.equal(output.readOnly, true);
  assert.equal(output.mutationAttempted, false);
  assert.equal(output.consumedRelease, 'Company Workspace v1.0');
  assert.equal(output.outputs.businessQuality.feature.stableId, 'CW-BQ-008');
  assert.equal(output.outputs.valuation.feature.stableId, 'CW-VAL-007');
  assert.equal(output.outputs.investmentDecision.feature.stableId, 'CW-ID-006');
});

test('Architecture validation verifies no Company Workspace drift', () => {
  const validation = validateCompanyWorkspaceArchitecture({});

  assert.equal(validation.status, 'PASS');
  assert.equal(validation.architectureDrift, false);
  assert.equal(validation.featureViewUnchanged, true);
  assert.equal(validation.extensionNamespacesUnchanged, true);
  assert.equal(validation.workflowUnchanged, true);
  assert.equal(validation.guardrailsUnchanged, true);
  assert.equal(validation.readOnly, true);
  assert.deepEqual(COMPANY_WORKSPACE_V1_CONTRACT.workflow, ['Overview', 'Business Quality', 'Valuation', 'Investment Decision']);
});

test('Validation Workspace exposes company review, feature review, evidence audit, issues, reports, and release approval', () => {
  const view = createValidationWorkspaceView();

  assert.equal(view.companyReview.investorQuestion, 'Did Company Workspace produce correct outputs?');
  assert.equal(view.companyReview.buttons.includes('Approve'), true);
  assert.equal(view.featureReview.rows.some(row => row.feature === 'CW-VAL-006'), true);
  assert.equal(view.evidenceAudit.metrics.includes('Freshness'), true);
  assert.equal(view.issues.categories.includes('Regression'), true);
  assert.equal(view.reports.generate.includes('Release Report'), true);
  assert.equal(view.releaseApproval.investorQuestion, 'Can this release be approved?');
  assert.equal(view.releaseApproval.actions.includes('Revalidate'), true);
});

test('Validation reports and table exports support required formats', () => {
  const dataset = createValidationDataset({ name: 'Report Dataset', companies: createDemoCompanies(3) });
  const run = createValidationRun({ dataset });
  const execution = executeValidationRun({ run, dataset });
  const report = createValidationReport({ execution });
  const csv = exportTable({ rows: [{ ticker: 'ABC', status: 'PASS' }], format: 'CSV' });
  const markdown = exportTable({ rows: [{ ticker: 'ABC', status: 'PASS' }], format: 'Markdown' });
  const html = exportTable({ rows: [{ ticker: 'ABC', status: 'PASS' }], format: 'HTML' });

  assert.equal(report.type, 'Validation Report');
  assert.deepEqual(report.formats, ['PDF', 'HTML', 'Markdown', 'CSV']);
  assert.equal(csv.includes('ticker,status'), true);
  assert.equal(markdown.includes('| ticker | status |'), true);
  assert.equal(html.includes('<table>'), true);
});

test('Validation Workspace guardrails prohibit Company Workspace mutation', () => {
  const view = createValidationWorkspaceView();

  assert.equal(view.mustNotModify.includes('Company Workspace architecture'), true);
  assert.equal(view.mustNotModify.includes('FeatureView contract'), true);
  assert.equal(view.mustNotModify.includes('Feature responsibilities'), true);
  assert.equal(view.mustNotModify.includes('Release records'), true);
  assert.equal(view.businessLogic, false);
});

test('Validation Profiles define portfolio, watchlist, candidate, and regression workflows', () => {
  assert.equal(validationProfiles.portfolio.type, 'Portfolio');
  assert.equal(validationProfiles.portfolio.datasetName, 'portfolio.csv');
  assert.equal(validationProfiles.portfolio.defaults.priority, 'Highest');
  assert.equal(validationProfiles.watchlist.outputs.includes('Evidence Improved'), true);
  assert.equal(validationProfiles.candidate.datasetName, 'scanx_export.csv');
  assert.equal(validationProfiles.regression.purpose, 'Validate platform stability.');
});

test('Validation Workspace exposes portfolio dashboard and validation triggers', () => {
  const view = createValidationWorkspaceView();

  assert.equal(view.navigation.includes('Validation Profiles'), true);
  assert.equal(view.portfolioDashboard.component, 'PortfolioValidationDashboard');
  assert.equal(view.portfolioDashboard.holdingsCount, 6);
  assert.equal(view.portfolioDashboard.holdings.length, 6);
  assert.equal(view.portfolioDashboard.needsReview >= 1, true);
  assert.equal(view.portfolioDashboard.materialChanges >= 1, true);
  assert.equal(view.portfolioDashboard.evidenceFreshness, 96);
  assert.equal(view.triggers.includes(ValidationTrigger.scheduled), true);
  assert.equal(view.triggers.includes(ValidationTrigger.engineUpgrade), true);
});

test('Snapshot comparison detects material changes across validation runs', () => {
  const comparisons = createDemoSnapshotComparisons();
  const kaynes = comparisons.find(item => item.ticker === 'KAYNES');
  const coal = comparisons.find(item => item.ticker === 'COALINDIA');
  const tcs = comparisons.find(item => item.ticker === 'TCS');

  assert.equal(kaynes.materialChange, true);
  assert.equal(kaynes.changes.some(change => change.message.includes('MOS changed')), true);
  assert.equal(coal.changes.some(change => change.message.includes('Evidence Confidence changed')), true);
  assert.equal(tcs.materialChange, false);
  assert.equal(tcs.reviewStatus, 'Stable');
});

test('Validation history accumulates company-level timeline entries', () => {
  const histories = createDemoValidationHistories();
  const bls = histories.find(item => item.ticker === 'BLS');

  assert.equal(bls.events.length, 5);
  assert.deepEqual(bls.events.map(event => event.status), ['Stable', 'Stable', 'Needs Review', 'Stable', 'Evidence Improved']);
});

test('Investor Review Intelligence creates a prioritized Review Queue from validation outputs', () => {
  const view = createValidationWorkspaceView();
  const queue = view.reviewQueue;

  assert.equal(view.navigation.includes('Review Queue'), true);
  assert.equal(view.navigation.includes('Weekly Summary'), true);
  assert.equal(view.investorReviewIntelligence.component, 'InvestorReviewIntelligence');
  assert.equal(view.investorReviewIntelligence.decisionSupportOnly, true);
  assert.equal(queue.component, 'ReviewQueue');
  assert.equal(queue.investorQuestion, 'What should I review first this week?');
  assert.equal(queue.lifecycle.includes(ReviewLifecycleState.detected), true);
  assert.equal(queue.deadlineStates.includes(ReviewDeadlineState.overdue), true);
  assert.equal(queue.items.length, 4);
  assert.deepEqual(queue.items.map(item => item.ticker), ['COALINDIA', 'KAYNES', 'BLS', 'TCS']);
  assert.equal(queue.summary.highPriority, 2);
  assert.equal(queue.summary.mediumPriority, 1);
  assert.equal(queue.summary.lowPriority, 1);
  assert.equal(queue.guardrail.includes('must not recommend buy, sell, hold'), true);
});

test('Review Queue items include Attention Reason, Review Objective, SLA, templates, and explanations', () => {
  const view = createValidationWorkspaceView();
  const kaynes = view.reviewQueue.items.find(item => item.ticker === 'KAYNES');
  const coal = view.reviewQueue.items.find(item => item.ticker === 'COALINDIA');
  const tcs = view.reviewQueue.items.find(item => item.ticker === 'TCS');

  assert.equal(kaynes.sourceProfile, ReviewSourceProfile.portfolio);
  assert.equal(kaynes.nextSuggestedWorkspace, SuggestedWorkspace.companyWorkspace);
  assert.equal(kaynes.journalHandoffStatus, JournalHandoffStatus.pendingReview);
  assert.equal(kaynes.priority, ReviewPriority.high);
  assert.equal(kaynes.attentionReason, AttentionReason.valuationShift);
  assert.equal(kaynes.reviewObjective, 'Reconfirm valuation assumptions after margin-of-safety compression.');
  assert.equal(kaynes.materialChangeCategory, 'Valuation');
  assert.equal(kaynes.explanation.headline, 'Valuation became less attractive.');
  assert.equal(kaynes.explanation.plainLanguageFirst, true);
  assert.equal(kaynes.explanation.numericDeltas.includes('MOS 42% → 28%'), true);
  assert.equal(kaynes.targetReviewBy, '2026-07-25');
  assert.equal(kaynes.deadlineState, ReviewDeadlineState.onTrack);
  assert.equal(kaynes.reviewTemplate.checklist.some(item => item.item === 'Margin of Safety'), true);

  assert.equal(coal.attentionReason, AttentionReason.evidenceFreshness);
  assert.equal(coal.explanation.headline, 'Evidence quality weakened.');
  assert.equal(coal.explanation.numericDeltas.includes('Evidence Confidence 94% → 81%'), true);
  assert.equal(coal.reviewTemplate.checklist.some(item => item.item === 'Source age'), true);
  assert.equal(tcs.priority, ReviewPriority.low);
  assert.equal(tcs.attentionReason, AttentionReason.scheduledQuarterlyReview);
});

test('Weekly Summary, Queue Health, Review Capacity, and Research Debt measure research operations', () => {
  const view = createValidationWorkspaceView();

  assert.equal(view.weeklySummary.component, 'WeeklyInvestmentReviewSummary');
  assert.equal(view.weeklySummary.primaryAction, 'Open Review Queue');
  assert.equal(view.weeklySummary.requiredReviewTimeMinutes, 17);
  assert.equal(view.weeklySummary.averageConfidence, 89);
  assert.equal(view.weeklySummary.completedReviews, 0);
  assert.equal(view.weeklySummary.reviewCapacityMinutes, 45);
  assert.equal(view.weeklySummary.capacityUtilizationPercent, 38);
  assert.equal(view.queueHealth.health, 'Good');
  assert.equal(view.queueHealth.queueSize, 4);
  assert.equal(view.researchDebt.level, 'Medium');
  assert.equal(view.researchDebt.guardrail.includes('not portfolio quality'), true);
});

test('Investor Review Intelligence can be created independently without mutating Company Workspace outputs', () => {
  const intelligence = createInvestorReviewIntelligence({
    holdings: [],
    materialChanges: createDemoSnapshotComparisons(),
    validationHistory: createDemoValidationHistories(),
    weeklyReviewCapacityMinutes: 10
  });

  assert.equal(intelligence.readOnlyWithRespectToCompanyWorkspace, true);
  assert.equal(intelligence.reviewQueue.summary.capacityState, 'Exceeded');
  assert.equal(intelligence.queueHealth.health, 'Stressed');
  assert.equal(intelligence.guardrails.some(guardrail => guardrail.includes('not investment attractiveness')), true);
});

test('OperationalPolicy centralizes review heuristics without changing architecture', () => {
  const comparisons = createDemoSnapshotComparisons();
  const coal = comparisons.find(item => item.ticker === 'COALINDIA');
  const kaynes = comparisons.find(item => item.ticker === 'KAYNES');

  assert.equal(Object.isFrozen(OperationalPolicy), true);
  assert.equal(OperationalPolicy.inferAttentionReason(coal), AttentionReason.evidenceFreshness);
  assert.equal(OperationalPolicy.inferAttentionReason(kaynes), AttentionReason.valuationShift);
  assert.equal(OperationalPolicy.inferPriority(kaynes, AttentionReason.valuationShift), ReviewPriority.high);
  assert.equal(typeof OperationalPolicy.estimateReviewTime({ priority: ReviewPriority.high, attentionReason: AttentionReason.valuationShift, comparison: kaynes }), 'number');
});

test('OperationalPolicy behaves as a pure immutable policy surface', () => {
  const comparisons = createDemoSnapshotComparisons();
  const originalComparisons = JSON.stringify(comparisons);
  const kaynes = comparisons.find(item => item.ticker === 'KAYNES');

  const explanation = OperationalPolicy.explainChange({
    comparison: kaynes,
    attentionReason: AttentionReason.valuationShift,
    materialChangeCategory: 'Valuation'
  });
  const sorted = OperationalPolicy.sortReviewQueueItems([
    { priority: ReviewPriority.low, targetReviewBy: '2026-08-22', ageDays: 0, company: 'TCS' },
    { priority: ReviewPriority.high, targetReviewBy: '2026-07-25', ageDays: 0, company: 'Kaynes' }
  ]);

  assert.equal(JSON.stringify(comparisons), originalComparisons);
  assert.equal(Object.isFrozen(explanation), true);
  assert.equal(Object.isFrozen(explanation.chain), true);
  assert.equal(Object.isFrozen(explanation.numericDeltas), true);
  assert.deepEqual(sorted.map(item => item.company), ['Kaynes', 'TCS']);
});

test('Portfolio Validation reports data readiness and empty queue reason', () => {
  const missing = createInvestorReviewIntelligence({
    holdings: [{ ticker: 'AAA' }, { ticker: 'BBB' }],
    materialChanges: [],
    validationHistory: []
  });
  const partial = createValidationWorkspaceView();
  const ready = createInvestorReviewIntelligence({
    holdings: [{ ticker: 'KAYNES' }, { ticker: 'COALINDIA' }, { ticker: 'BLS' }, { ticker: 'TCS' }],
    materialChanges: createDemoSnapshotComparisons(),
    validationHistory: createDemoValidationHistories()
  });

  assert.equal(missing.dataReadiness.status, DataReadinessStatus.missingEvidence);
  assert.equal(missing.dataReadiness.coveragePercent, 0);
  assert.equal(missing.reviewQueue.emptyQueueReason, EmptyQueueReason.missingComparisonEvidence);
  assert.equal(missing.dataReadiness.warning.includes('No comparison snapshots'), true);
  assert.equal(missing.researchDebt.reasons.includes('portfolio validation snapshot coverage missing'), true);

  assert.equal(partial.investorReviewIntelligence.dataReadiness.status, DataReadinessStatus.partial);
  assert.equal(partial.investorReviewIntelligence.dataReadiness.holdingsWithComparisonSnapshots, 4);
  assert.equal(partial.investorReviewIntelligence.dataReadiness.holdingsMissingComparisonSnapshots, 2);
  assert.equal(partial.weeklySummary.validationCoveragePercent, 67);

  assert.equal(ready.dataReadiness.status, DataReadinessStatus.ready);
  assert.equal(ready.dataReadiness.coveragePercent, 100);
  assert.equal(ready.reviewQueue.emptyQueueReason, EmptyQueueReason.none);
});

test('Review Templates are refined with purpose, prompts, and recommendation guardrails', () => {
  const view = createValidationWorkspaceView();
  const kaynes = view.reviewQueue.items.find(item => item.ticker === 'KAYNES');
  const coal = view.reviewQueue.items.find(item => item.ticker === 'COALINDIA');

  assert.equal(kaynes.reviewTemplate.templateId, 'template-valuation-shift');
  assert.equal(kaynes.reviewTemplate.title, 'Valuation Shift Review');
  assert.equal(kaynes.reviewTemplate.purpose.includes('Reconfirm valuation assumptions'), true);
  assert.equal(kaynes.reviewTemplate.evidencePrompts.some(prompt => prompt.includes('valuation assumption')), true);
  assert.equal(kaynes.reviewTemplate.guardrail.includes('must not recommend'), true);
  assert.equal(coal.reviewTemplate.templateId, 'template-evidence-freshness');
  assert.equal(Object.isFrozen(kaynes.reviewTemplate), true);
  assert.equal(Object.isFrozen(kaynes.reviewTemplate.checklist), true);
});

test('Review History preserves queue context and prior validation events without recommendations', () => {
  const view = createValidationWorkspaceView();
  const history = view.reviewHistory;
  const bls = history.entries.find(entry => entry.ticker === 'BLS');

  assert.equal(view.investorReviewIntelligence.reviewHistory, view.reviewHistory);
  assert.equal(history.component, 'ReviewHistory');
  assert.equal(history.investorQuestion, 'What review context led to this queue item?');
  assert.equal(history.entries.length, view.reviewQueue.items.length);
  assert.equal(bls.events.some(event => event.source === 'Validation History'), true);
  assert.equal(bls.events.some(event => event.status === ReviewLifecycleState.queued), true);
  assert.equal(history.guardrail.includes('does not create investment recommendations'), true);
  assert.equal(Object.isFrozen(history), true);
});

test('Journal handoff pre-fills investor-owned journal context without owning conclusions', () => {
  const view = createValidationWorkspaceView();
  const handoff = view.journalHandoff;
  const kaynes = handoff.entries.find(entry => entry.ticker === 'KAYNES');

  assert.equal(view.investorReviewIntelligence.journalHandoff, view.journalHandoff);
  assert.equal(handoff.component, 'JournalHandoff');
  assert.equal(handoff.pendingCount, view.reviewQueue.items.length);
  assert.equal(kaynes.status, JournalHandoffStatus.pendingReview);
  assert.equal(kaynes.canCreateJournalEntry, false);
  assert.equal(kaynes.autoFilledFields.reasonReviewed, AttentionReason.valuationShift);
  assert.equal(kaynes.autoFilledFields.investorOwnedConclusion, null);
  assert.equal(kaynes.requiredInvestorFields.includes('investorOwnedConclusion'), true);
  assert.equal(kaynes.guardrail.includes('final conclusion is investor-owned'), true);
  assert.equal(Object.isFrozen(handoff), true);
  assert.equal(Object.isFrozen(kaynes.autoFilledFields), true);
});
