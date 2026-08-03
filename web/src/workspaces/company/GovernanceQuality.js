import { createEvidenceConfidence } from './EvidenceConfidence.js';
import { createFeatureView } from './FeatureView.js';

const FEATURE_META = Object.freeze({
  stableId: 'CW-BQ-005',
  workspace: 'Company Workspace',
  epic: 'Business Quality',
  featureId: 'BQ.5',
  featureName: 'Governance Quality',
  status: 'Released',
  version: '1.0',
  investorQuestion: 'Can management be trusted?',
  purpose: 'Assess whether governance evidence supports confidence in management alignment, transparency, oversight, and minority shareholder protection without assigning a trust rating or moral judgment.'
});

const DEFAULT_GOVERNANCE_QUALITY_INPUT = Object.freeze({
  company: Object.freeze({ displayName: 'Apex Consumer Products' }),
  governanceStructure: Object.freeze({
    boardStructure: 'Board with executive and non-executive directors; independence and committee composition require source verification.',
    independenceRead: 'To verify',
    committeeCoverage: Object.freeze(['audit committee', 'nomination and remuneration committee', 'risk oversight to verify']),
    evidenceExpectation: 'Annual report, board composition, committee structure'
  }),
  managementAlignment: Object.freeze({
    ownershipAlignment: 'Promoter or insider alignment requires latest shareholding and compensation evidence.',
    incentiveRead: 'Unknown',
    alignmentSignals: Object.freeze(['insider ownership to verify', 'compensation structure to verify', 'long-term incentive design to verify']),
    evidenceExpectation: 'Promoter holding, insider ownership, compensation disclosures'
  }),
  capitalStewardship: Object.freeze({
    stewardshipRead: 'Governance should support disciplined capital decisions, but linkage between oversight and capital allocation outcomes remains incomplete.',
    oversightMechanisms: Object.freeze(['board approval of major capital projects', 'audit oversight', 'risk review to verify']),
    evidenceExpectation: 'Board approvals, capital allocation policy, committee oversight, post-investment review disclosures'
  }),
  disclosureQuality: Object.freeze({
    transparencyRead: 'Medium',
    consistencyRead: 'Requires review across annual reports, investor presentations, and filings.',
    communicationSignals: Object.freeze(['consistent segment disclosure to verify', 'clear risk disclosures to verify', 'management commentary quality to verify']),
    evidenceExpectation: 'Investor presentations, conference calls, filing consistency'
  }),
  minorityShareholderProtection: Object.freeze({
    protectionRead: 'Unknown',
    keyTopics: Object.freeze(['related-party transactions', 'dilution history', 'auditor observations', 'shareholder resolutions']),
    evidenceExpectation: 'Related-party transactions, auditor observations, shareholder resolutions'
  }),
  riskOversight: Object.freeze({
    oversightRead: 'To verify',
    controlAreas: Object.freeze(['internal controls', 'succession planning', 'compliance oversight', 'risk committee responsibilities']),
    evidenceExpectation: 'Risk committee, internal controls, succession planning'
  }),
  governanceTrackRecord: Object.freeze([
    Object.freeze({ event: 'Regulatory actions', currentRead: 'No source-linked review completed', evidenceStatus: 'missing' }),
    Object.freeze({ event: 'Governance controversies', currentRead: 'No source-linked review completed', evidenceStatus: 'missing' }),
    Object.freeze({ event: 'Auditor observations', currentRead: 'Requires annual report review', evidenceStatus: 'missing' }),
    Object.freeze({ event: 'Related-party history', currentRead: 'Requires notes-to-accounts review', evidenceStatus: 'missing' })
  ]),
  investorJudgment: Object.freeze({ status: 'Governance reviewed', note: 'Governance confidence is not concluded. Evidence must support alignment, transparency, oversight, and minority protection before trust can increase.' })
});

export function createGovernanceQuality(input = DEFAULT_GOVERNANCE_QUALITY_INPUT) {
  const normalized = normalizeInput(input);
  const evidenceExpectations = createEvidenceExpectations(normalized);
  const qualityFacts = createGovernanceFacts(normalized);
  const aiInterpretation = createAiInterpretation(normalized);
  const investorJudgment = createInvestorJudgment(normalized);
  const evidenceConfidence = createEvidenceConfidence({
    confidence: 'Low',
    coverage: 49,
    rationale: 'Governance Quality identifies the governance areas that must be reviewed, but source-linked evidence for board composition, incentives, disclosures, minority protection, and governance history remains incomplete.',
    evidenceItems: ['governance structure', 'management alignment', 'capital stewardship', 'disclosure quality', 'minority shareholder protection', 'risk oversight', 'governance track record'],
    missingEvidence: [
      { label: 'latest annual report governance section', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'board and committee composition evidence', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'promoter and insider ownership history', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'related-party transaction review', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'auditor observations and qualifications', priority: 'High', status: 'missing', sourceCount: 0 },
      { label: 'management compensation disclosure', priority: 'Medium', status: 'missing', sourceCount: 0 }
    ]
  });
  const sections = Object.freeze({
    governanceQualityHeader: createGovernanceQualityHeader(normalized),
    governanceStructure: createGovernanceStructure(normalized),
    managementAlignment: createManagementAlignment(normalized),
    capitalStewardship: createCapitalStewardship(normalized),
    disclosureQuality: createDisclosureQuality(normalized),
    minorityShareholderProtection: createMinorityShareholderProtection(normalized),
    riskOversight: createRiskOversight(normalized),
    governanceTrackRecord: createGovernanceTrackRecord(normalized),
    evidenceExpectations,
    qualityFacts,
    aiInterpretation,
    investorJudgment
  });
  const guardrails = Object.freeze({
    governanceAssessmentOnly: true,
    noGovernanceScore: true,
    noTrustRating: true,
    noRanking: true,
    noQualityScore: true,
    noValuation: true,
    noRecommendation: true,
    noExecution: true
  });
  const futureExtensions = Object.freeze(['governance controversy monitor', 'related-party transaction parser', 'board composition history', 'auditor observation tracker']);

  return deepFreeze({
    type: 'governance-quality',
    feature: FEATURE_META,
    businessLogic: false,
    selfContained: true,
    responsive: Object.freeze({ supportsCompact: true, supportsWide: true, minimumContentWidth: 320 }),
    evidenceConfidence,
    sections,
    featureView: createFeatureView({
      id: FEATURE_META.stableId,
      title: FEATURE_META.featureName,
      epic: FEATURE_META.epic,
      feature: FEATURE_META.featureId,
      version: FEATURE_META.version,
      investorQuestion: FEATURE_META.investorQuestion,
      facts: qualityFacts.items,
      aiInterpretation,
      investorJudgment,
      evidenceConfidence,
      guardrails,
      sections,
      metadata: { workspace: FEATURE_META.workspace, status: FEATURE_META.status, futureExtensions },
      extensions: {
        quality: {
          dimension: 'Governance Quality',
          governanceTopics: Object.freeze(['structure', 'alignment', 'stewardship', 'disclosure', 'minority protection', 'risk oversight', 'track record']),
          evidenceExpectations: evidenceExpectations.items,
          measurementDeferred: true
        }
      }
    }),
    boundaries: Object.freeze(guardrails),
    acceptance: Object.freeze({
      independentlyUsable: true,
      investorQuestionAnswered: FEATURE_META.investorQuestion,
      evidenceBackedGovernanceAssessment: true,
      noMoralJudgment: true,
      userCanUnderstand: Object.freeze(['governance structure', 'management alignment', 'capital stewardship', 'disclosure quality', 'minority shareholder protection', 'risk oversight', 'governance track record']),
      factsAiJudgmentSeparated: true,
      noAutomatedDecision: true
    }),
    futureExtensions
  });
}

export function getDefaultGovernanceQualityInput() {
  return clone(DEFAULT_GOVERNANCE_QUALITY_INPUT);
}

function createGovernanceQualityHeader(input) { return Object.freeze({ component: 'GovernanceQualityHeader', companyName: input.company.displayName, investorQuestion: FEATURE_META.investorQuestion }); }
function createGovernanceStructure(input) { return Object.freeze({ component: 'GovernanceStructure', ...input.governanceStructure, factsOnly: false }); }
function createManagementAlignment(input) { return Object.freeze({ component: 'ManagementAlignment', ...input.managementAlignment, factsOnly: false }); }
function createCapitalStewardship(input) { return Object.freeze({ component: 'CapitalStewardship', ...input.capitalStewardship, factsOnly: false }); }
function createDisclosureQuality(input) { return Object.freeze({ component: 'DisclosureQuality', ...input.disclosureQuality, factsOnly: false }); }
function createMinorityShareholderProtection(input) { return Object.freeze({ component: 'MinorityShareholderProtection', ...input.minorityShareholderProtection, factsOnly: false }); }
function createRiskOversight(input) { return Object.freeze({ component: 'RiskOversight', ...input.riskOversight, factsOnly: false }); }
function createGovernanceTrackRecord(input) { return Object.freeze({ component: 'GovernanceTrackRecord', items: input.governanceTrackRecord, factsOnly: false }); }

function createEvidenceExpectations(input) {
  return Object.freeze({
    component: 'GovernanceEvidenceExpectations',
    items: deepFreeze([
      { section: 'Governance Structure', typicalEvidence: input.governanceStructure.evidenceExpectation },
      { section: 'Management Alignment', typicalEvidence: input.managementAlignment.evidenceExpectation },
      { section: 'Capital Stewardship', typicalEvidence: input.capitalStewardship.evidenceExpectation },
      { section: 'Disclosure Quality', typicalEvidence: input.disclosureQuality.evidenceExpectation },
      { section: 'Minority Shareholder Protection', typicalEvidence: input.minorityShareholderProtection.evidenceExpectation },
      { section: 'Risk Oversight', typicalEvidence: input.riskOversight.evidenceExpectation },
      { section: 'Governance Track Record', typicalEvidence: 'Regulatory actions, governance controversies, historical disclosures' }
    ]),
    actionable: true
  });
}

function createGovernanceFacts(input) {
  return Object.freeze({
    component: 'GovernanceFacts',
    items: deepFreeze([
      { id: 'governance-structure', kind: 'fact', source: 'governance-quality-input', value: input.governanceStructure.boardStructure },
      { id: 'management-alignment', kind: 'fact', source: 'governance-quality-input', value: input.managementAlignment.ownershipAlignment },
      { id: 'disclosure-quality', kind: 'fact', source: 'governance-quality-input', value: input.disclosureQuality.transparencyRead },
      { id: 'minority-protection', kind: 'fact', source: 'governance-quality-input', value: input.minorityShareholderProtection.protectionRead },
      { id: 'risk-oversight', kind: 'fact', source: 'governance-quality-input', value: input.riskOversight.oversightRead }
    ]),
    factsOnly: true
  });
}

function createAiInterpretation(input) {
  return Object.freeze({
    component: 'GovernanceQualityAIInterpretation',
    kind: 'generated_explanation',
    source: 'deterministic-product-summary',
    basedOn: Object.freeze(['governance-structure', 'management-alignment', 'capital-stewardship', 'disclosure-quality', 'minority-shareholder-protection', 'risk-oversight', 'governance-track-record']),
    summary: `${input.company.displayName}'s governance assessment is evidence-incomplete. The main areas requiring verification are board independence, insider alignment, disclosure consistency, minority shareholder protection, and governance track record.`,
    caution: 'Generated governance interpretation only. It does not assign a governance score, trust rating, ranking, valuation, recommendation, or replace investor judgment.'
  });
}
function createInvestorJudgment(input) { return Object.freeze({ component: 'GovernanceQualityInvestorJudgment', status: input.investorJudgment.status, note: input.investorJudgment.note, controlledBy: 'Investor', noAutomation: true }); }

function normalizeInput(input) {
  const company = input.company || {};
  requireText(company.displayName, 'company.displayName');
  return Object.freeze({
    company: Object.freeze({ displayName: company.displayName }),
    governanceStructure: normalizeListObject(input.governanceStructure, ['boardStructure', 'independenceRead', 'evidenceExpectation'], ['committeeCoverage']),
    managementAlignment: normalizeListObject(input.managementAlignment, ['ownershipAlignment', 'incentiveRead', 'evidenceExpectation'], ['alignmentSignals']),
    capitalStewardship: normalizeListObject(input.capitalStewardship, ['stewardshipRead', 'evidenceExpectation'], ['oversightMechanisms']),
    disclosureQuality: normalizeListObject(input.disclosureQuality, ['transparencyRead', 'consistencyRead', 'evidenceExpectation'], ['communicationSignals']),
    minorityShareholderProtection: normalizeListObject(input.minorityShareholderProtection, ['protectionRead', 'evidenceExpectation'], ['keyTopics']),
    riskOversight: normalizeListObject(input.riskOversight, ['oversightRead', 'evidenceExpectation'], ['controlAreas']),
    governanceTrackRecord: normalizeItems(input.governanceTrackRecord, ['event', 'currentRead', 'evidenceStatus']),
    investorJudgment: Object.freeze({ status: valueOrUnknown(input.investorJudgment?.status), note: valueOrUnknown(input.investorJudgment?.note) })
  });
}
function normalizeObject(item, requiredFields) { const source = item || {}; for (const field of requiredFields) requireText(source[field], field); return Object.freeze({ ...source }); }
function normalizeListObject(item, requiredFields, listFields) { const source = normalizeObject(item, requiredFields); const lists = Object.fromEntries(listFields.map(field => [field, freezeList(item?.[field])])); return Object.freeze({ ...source, ...lists }); }
function normalizeItems(items, requiredFields) { return deepFreeze(freezeList(items).map((item, index) => { for (const field of requiredFields) requireText(item?.[field], `items[${index}].${field}`); return Object.freeze({ ...item }); })); }
function freezeList(value) { return Object.freeze([...(Array.isArray(value) ? value : [])]); }
function valueOrUnknown(value) { return value === undefined || value === null || value === '' ? 'Unknown' : value; }
function requireText(value, label) { if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is required`); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
