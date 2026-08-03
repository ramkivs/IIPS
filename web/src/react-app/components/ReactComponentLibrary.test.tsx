import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { OperationalCockpitDTO, ResearchSnapshotDrawerDTO } from '../contracts';
import { ThemeProvider } from '../design-system';
import { CoverageLedger, EvidenceCenter, GovernanceCenter, GovernanceSidebar, HumanReviewPanel, OperationalDashboard, OperationalMetricsPanel, PortfolioHealthPanel, PortfolioView, ReportsView, ResearchSnapshotDrawer, ResearchWorkspace, ReviewQueue, SettingsView } from './index';
import { asOperationalCockpitDTO } from '../contracts';

const governanceState = { governanceVersion: 'Operational Governance v1.0', governanceState: 'Active', behaviorChangeState: 'Normal', currentDecision: 'Keep workflow unchanged', decisionConfidence: 'Moderate', evidenceLevel: 'E2', allowedActions: ['OpenReview', 'SubmitReview'], restrictedActions: [], restrictionReason: null, effectiveAt: '2026-07-25T00:00:00.000Z', guardrail: 'Backend-owned governance state.' } satisfies OperationalCockpitDTO['governanceState'];
const evidenceStatus = { quality: 'Verified', status: 'Verified', confidence: 90, freshness: 'Verified', evidenceTimestamp: '2026-07-25T00:00:00.000Z', sourceCount: 2, staleSourceCount: 0, missingSourceCount: 0, warning: null } satisfies OperationalCockpitDTO['reviewQueue']['items'][number]['evidenceStatus'];
const dto = asOperationalCockpitDTO({ cycleId: 'Cycle #2', generatedAt: '2026-07-25T00:00:00.000Z', portfolioHealth: { holdingsCount: 66, activeReviewCount: 17, coverageLedgerCount: 49, queueHealth: 'Stressed', researchDebt: 'High', reviewCapacityMinutes: 180, estimatedWorkMinutes: 186, comparisonCoveragePercent: 100, snapshotCount: 132, comparisonCount: 66 }, reviewQueue: { queueId: 'RQ_1', generatedAt: '2026-07-25T00:00:00.000Z', dataReadiness: { component: 'PortfolioValidationDataReadiness', status: 'Ready', portfolioHoldings: 66, comparisonSnapshots: 66, holdingsWithComparisonSnapshots: 66, holdingsMissingComparisonSnapshots: 0, coveragePercent: 100, coveredTickers: ['ELECON'], missingTickers: [], warning: null, guardrail: 'Data readiness reports evidence coverage only.' }, emptyQueueReason: 'None', summary: { total: 1, highPriority: 1, mediumPriority: 0, lowPriority: 0, outstanding: 1, overdue: 0, estimatedReviewTimeMinutes: 8, reviewCapacityMinutes: 180, capacityUtilizationPercent: 5, capacityState: 'Available' }, items: [{ id: 'review-elecon', companyId: 'CMP_ELECON', ticker: 'ELECON', companyName: 'Elecon Engineering Company', sourceProfile: 'Portfolio', portfolioRole: 'Core', portfolioWeight: 1, priority: 'High', attentionReason: 'Valuation Shift', reviewObjective: 'Reconfirm valuation assumptions.', materialChangeCategory: 'Valuation', evidenceStatus, dataReadinessStatus: 'Ready', estimatedReviewTimeMinutes: 8, targetReviewBy: '2026-07-27', deadlineState: 'On Track', snapshotId: 'SS_ELECON', previousSnapshotId: 'SS_PREV', currentSnapshotId: 'SS_CURR', materialChangeId: 'MC_ELECON', governanceState, reviewStatus: 'Needs Review', explanation: { headline: 'Valuation became less attractive.', whyNow: 'MOS changed.', chain: ['MOS changed'], numericDeltas: ['MOS 42 → 27'], plainLanguageFirst: true }, allowedActions: ['OpenReview'], restrictedActions: [], guardrail: 'Review only.' }], guardrail: 'Review priority is backend-owned.' }, coverageLedger: { ledgerId: 'CL_1', generatedAt: '2026-07-25T00:00:00.000Z', totalRecords: 49, routineCoverageCount: 49, stableCount: 49, scheduledReviewCount: 49, records: [] }, evidenceHealth: { snapshotCount: 132, comparisonCount: 66, coveragePercent: 100, failedHoldings: 0 }, governanceState, metrics: { cycleId: 'Cycle #2', reviewItemsExamined: 9, highPriorityConfirmedRate: 100, falsePositiveRate: 0, explanationUsefulnessRate: 88.9, priorityCorrectnessRate: 100, actualReviewTimeMinutes: 29, estimatedReviewTimeMinutes: 72, guardrailViolations: 0 } });

function renderWithTheme(ui: React.ReactElement) { return render(<ThemeProvider>{ui}</ThemeProvider>); }

describe('React Component Library', () => {
  it('renders portfolio health and operational metrics from DTOs', () => {
    renderWithTheme(<><PortfolioHealthPanel portfolioHealth={dto.portfolioHealth} /><OperationalMetricsPanel metrics={dto.metrics} /></>);
    expect(screen.getByText('Holdings')).toBeTruthy();
    expect(screen.getByText('66')).toBeTruthy();
    expect(screen.getByText('Items examined')).toBeTruthy();
  });




  it('renders settings view as read-only application information without persistence logic', () => {
    renderWithTheme(<SettingsView dto={dto} />);
    expect(screen.getByLabelText('Settings')).toBeTruthy();
    expect(screen.getByLabelText('Application Information')).toBeTruthy();
    expect(screen.getByLabelText('Governance Contract Information')).toBeTruthy();
    expect(screen.getByLabelText('Provider Information')).toBeTruthy();
    expect(screen.getByLabelText('User Preferences')).toBeTruthy();
    expect(screen.getByLabelText('Security Boundary')).toBeTruthy();
    expect(screen.getByText('Operational Cockpit v1.1')).toBeTruthy();
    expect(screen.getByText(/read-only in v1.1/)).toBeTruthy();
  });

  it('renders reports view from supplied presentation DTO without generating reports', () => {
    renderWithTheme(<ReportsView dto={dto} />);
    expect(screen.getByLabelText('Reports')).toBeTruthy();
    expect(screen.getByLabelText('Operational Summary Report')).toBeTruthy();
    expect(screen.getByLabelText('Review Queue Report')).toBeTruthy();
    expect(screen.getByLabelText('Evidence Report')).toBeTruthy();
    expect(screen.getByLabelText('Governance Report')).toBeTruthy();
    expect(screen.getByLabelText('Generated Reports')).toBeTruthy();
    expect(screen.getByText('Generated report catalog and export status were not supplied in the current presentation DTO.')).toBeTruthy();
  });

  it('renders portfolio view from supplied presentation DTO without analytics or recommendations', () => {
    renderWithTheme(<PortfolioView portfolioHealth={dto.portfolioHealth} evidenceHealth={dto.evidenceHealth} coverageLedger={dto.coverageLedger} />);
    expect(screen.getByLabelText('Portfolio')).toBeTruthy();
    expect(screen.getByLabelText('Portfolio Review Coverage')).toBeTruthy();
    expect(screen.getByLabelText('Holdings Table')).toBeTruthy();
    expect(screen.getByLabelText('Allocation Summary')).toBeTruthy();
    expect(screen.getByLabelText('Portfolio Coverage')).toBeTruthy();
    expect(screen.getByLabelText('Portfolio Evidence Coverage')).toBeTruthy();
    expect(screen.getByLabelText('Quality Distribution')).toBeTruthy();
    expect(screen.getByLabelText('Watchlist Overlap')).toBeTruthy();
    expect(screen.getAllByText(/not supplied/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders dashboard sections from presentation DTOs without calculating backend state', () => {
    renderWithTheme(<OperationalDashboard dto={dto} />);
    expect(screen.getByLabelText('Dashboard')).toBeTruthy();
    expect(screen.getByLabelText('Review Queue Summary')).toBeTruthy();
    expect(screen.getByLabelText('Governance Summary')).toBeTruthy();
    expect(screen.getByLabelText('Evidence Coverage')).toBeTruthy();
    expect(screen.getByLabelText('Material Changes')).toBeTruthy();
    expect(screen.getByLabelText('Research Debt')).toBeTruthy();
    expect(screen.getByLabelText('Recent Activity')).toBeTruthy();
    expect(screen.getByLabelText('Engine Status')).toBeTruthy();
    expect(screen.getAllByText('Valuation').length).toBeGreaterThanOrEqual(1);
  });

  it('renders review queue and emits RowSelected callback', () => {
    let selected = '';
    renderWithTheme(<ReviewQueue reviewQueue={dto.reviewQueue} onEvent={event => { if (event.type === 'RowSelected') selected = event.reviewItemId; }} />);
    const table = screen.getByRole('table', { name: 'Active Review Queue' });
    fireEvent.click(table.querySelector('tbody tr') as HTMLElement);
    expect(selected).toBe('review-elecon');
  });

  it('supports presentation-only review queue search, filters, sorting, and no-results state', () => {
    const secondItem = { ...dto.reviewQueue.items[0], id: 'review-zeta', ticker: 'ZETA', companyName: 'Zeta Industries', priority: 'Low' as const, reviewStatus: 'Monitoring', materialChangeCategory: 'Governance', attentionReason: 'Governance Status' };
    const reviewQueue = { ...dto.reviewQueue, items: [dto.reviewQueue.items[0], secondItem], summary: { ...dto.reviewQueue.summary, total: 2, lowPriority: 1 } };
    renderWithTheme(<ReviewQueue reviewQueue={reviewQueue} />);

    expect(screen.getByLabelText(/Search review queue/)).toBeTruthy();
    expect(screen.getByLabelText(/Priority filter/)).toBeTruthy();
    expect(screen.getByLabelText(/Status filter/)).toBeTruthy();
    expect(screen.getByLabelText(/Sort field/)).toBeTruthy();
    expect(screen.getByLabelText(/Sort direction/)).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/Search review queue/), { target: { value: 'zeta' } });
    expect(screen.getByText('ZETA')).toBeTruthy();
    expect(screen.queryByText('ELECON')).toBeNull();

    fireEvent.change(screen.getByLabelText(/Search review queue/), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/Priority filter/), { target: { value: 'Low' } });
    expect(screen.getByText('ZETA')).toBeTruthy();
    expect(screen.queryByText('ELECON')).toBeNull();

    fireEvent.change(screen.getByLabelText(/Priority filter/), { target: { value: 'All' } });
    fireEvent.change(screen.getByLabelText(/Sort field/), { target: { value: 'ticker' } });
    fireEvent.change(screen.getByLabelText(/Sort direction/), { target: { value: 'desc' } });
    const rows = Array.from(screen.getByRole('table', { name: 'Active Review Queue' }).querySelectorAll('tbody tr'));
    expect(rows[0].textContent).toContain('ZETA');

    fireEvent.change(screen.getByLabelText(/Search review queue/), { target: { value: 'not-found' } });
    expect(screen.getByText('No matching review items')).toBeTruthy();
  });


  it('renders evidence center from backend-supplied presentation DTO evidence without scoring', () => {
    renderWithTheme(<EvidenceCenter evidenceHealth={dto.evidenceHealth} reviewQueue={dto.reviewQueue} coverageLedger={dto.coverageLedger} />);
    expect(screen.getByLabelText('Evidence Center')).toBeTruthy();
    expect(screen.getByLabelText('Evidence Coverage Summary')).toBeTruthy();
    expect(screen.getByLabelText('Evidence Readiness')).toBeTruthy();
    expect(screen.getByLabelText('Evidence Status by Review Item')).toBeTruthy();
    expect(screen.getByLabelText('Coverage Evidence Records')).toBeTruthy();
    expect(screen.getByText('Verified')).toBeTruthy();
    expect(screen.getByText('No coverage evidence records were supplied.')).toBeTruthy();
  });


  it('renders governance center from supplied governance DTO without evaluating rules', () => {
    renderWithTheme(<GovernanceCenter governanceState={dto.governanceState} metrics={dto.metrics} />);
    expect(screen.getByLabelText('Governance Center')).toBeTruthy();
    expect(screen.getByLabelText('Governance Status')).toBeTruthy();
    expect(screen.getByLabelText('Decision Support State')).toBeTruthy();
    expect(screen.getByLabelText('Evidence Governance')).toBeTruthy();
    expect(screen.getByLabelText('Allowed Actions')).toBeTruthy();
    expect(screen.getByLabelText('Restricted Actions')).toBeTruthy();
    expect(screen.getByLabelText('Governance Guardrails')).toBeTruthy();
    expect(screen.getByLabelText('Governance Audit Metrics')).toBeTruthy();
    expect(screen.getByText('Keep workflow unchanged')).toBeTruthy();
    expect(screen.getByText('No restricted actions supplied.')).toBeTruthy();
  });

  it('renders coverage ledger and governance sidebar without calculating backend state', () => {
    renderWithTheme(<><CoverageLedger coverageLedger={dto.coverageLedger} /><GovernanceSidebar governanceState={dto.governanceState} metrics={dto.metrics} /></>);
    expect(screen.getAllByText('49').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Keep workflow unchanged')).toBeTruthy();
  });


  it('renders research workspace panels from supplied snapshot DTO without inventing missing data', () => {
    const item = dto.reviewQueue.items[0];
    const snapshot: ResearchSnapshotDrawerDTO = { selectedReviewItemId: item.id, companyId: item.companyId, ticker: item.ticker, companyName: item.companyName, priority: item.priority, evidenceStatus: item.evidenceStatus, scores: { businessQuality: null, financialStrength: null, valuation: null, confidence: item.evidenceStatus.confidence }, materialChange: { category: item.materialChangeCategory, headline: item.explanation.headline, severity: item.priority, reviewRequired: true }, explanation: item.explanation, snapshotDiff: { previousSnapshotId: item.previousSnapshotId, currentSnapshotId: item.currentSnapshotId, rows: [] }, provenance: null, allowedActions: item.allowedActions, restrictedActions: item.restrictedActions };
    renderWithTheme(<ResearchWorkspace snapshot={snapshot} />);
    expect(screen.getByLabelText('Research Workspace ELECON')).toBeTruthy();
    expect(screen.getByLabelText('Business Summary')).toBeTruthy();
    expect(screen.getByLabelText('Financial Snapshot')).toBeTruthy();
    expect(screen.getByLabelText('Valuation Summary')).toBeTruthy();
    expect(screen.getByLabelText('Governance Summary')).toBeTruthy();
    expect(screen.getByLabelText('Evidence Summary')).toBeTruthy();
    expect(screen.getByLabelText('Research Material Changes')).toBeTruthy();
    expect(screen.getByLabelText('Review History')).toBeTruthy();
    expect(screen.getByLabelText('Operational Notes')).toBeTruthy();
    expect(screen.getAllByText(/not supplied|Unavailable/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders snapshot drawer and human review panel from typed DTOs', () => {
    const item = dto.reviewQueue.items[0];
    const snapshot: ResearchSnapshotDrawerDTO = { selectedReviewItemId: item.id, companyId: item.companyId, ticker: item.ticker, companyName: item.companyName, priority: item.priority, evidenceStatus: item.evidenceStatus, scores: { businessQuality: null, financialStrength: null, valuation: null, confidence: item.evidenceStatus.confidence }, materialChange: { category: item.materialChangeCategory, headline: item.explanation.headline, severity: item.priority, reviewRequired: true }, explanation: item.explanation, snapshotDiff: { previousSnapshotId: item.previousSnapshotId, currentSnapshotId: item.currentSnapshotId, rows: [] }, provenance: null, allowedActions: item.allowedActions, restrictedActions: item.restrictedActions };
    renderWithTheme(<><ResearchSnapshotDrawer snapshot={snapshot} /><HumanReviewPanel review={{ reviewItemId: item.id, ticker: item.ticker, reviewerConfirmed: null, falsePositive: null, explanationUseful: null, templateUseful: null, priorityCorrect: null, actionTaken: null, rootCauseCategory: null, timeSpentMinutes: null, finalDisposition: null, evidenceLevel: null, notes: null, recommendedRefinement: null }} /></>);
    expect(screen.getByText('ELECON')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Submit Review' })).toBeTruthy();
  });
});
