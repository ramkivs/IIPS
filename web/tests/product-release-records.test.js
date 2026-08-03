import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function releaseFile(name) {
  return readFileSync(new URL(`../../../releases/${name}`, import.meta.url), 'utf8');
}

test('Investment Decision v1.0 release record is published with correct boundary', () => {
  const release = releaseFile('COMPANY_WORKSPACE_INVESTMENT_DECISION_v1.0_RELEASE.md');

  assert.equal(release.includes('## Company Workspace → Investment Decision'), true);
  assert.equal(release.includes('**Version:** 1.0'), true);
  assert.equal(release.includes('**Status:** Released'), true);
  assert.equal(release.includes('**Features:** 6'), true);
  assert.equal(release.includes('**Presentation Contract:** FeatureView'), true);
  assert.equal(release.includes('**Successor:** Investment Decision v1.1'), true);
  assert.equal(release.includes('Decision support\nNOT\nDecision automation'), true);
  assert.equal(release.includes('Investor-Owned Decision Record'), true);
  assert.equal(release.includes('featureView.extensions.decision'), true);
  assert.equal(release.includes('Execute trades'), true);
  assert.equal(release.includes('Major architectural changes are deferred to v2.0 planning.'), true);
});

test('Company Workspace v1.0 release record freezes the released baseline', () => {
  const release = releaseFile('COMPANY_WORKSPACE_v1.0_RELEASE.md');

  assert.equal(release.includes('## Company Workspace'), true);
  assert.equal(release.includes('**Version:** 1.0'), true);
  assert.equal(release.includes('**Status:** Released'), true);
  assert.equal(release.includes('| Overview | 1.0 | Describe the company | Company context | Released |'), true);
  assert.equal(release.includes('| Business Quality | 1.0 | Assess business quality | Quality evidence | Released |'), true);
  assert.equal(release.includes('| Valuation | 1.0 | Estimate intrinsic value | Valuation evidence | Released |'), true);
  assert.equal(release.includes('| Investment Decision | 1.0 | Integrate completed evidence | Decision Summary + Investor-Owned Decision Record | Released |'), true);
  assert.equal(release.includes('FeatureView contract'), true);
  assert.equal(release.includes('extensions.quality'), true);
  assert.equal(release.includes('extensions.valuation'), true);
  assert.equal(release.includes('extensions.decision'), true);
  assert.equal(release.includes('Decision support\nNOT\nDecision automation'), true);
  assert.equal(release.includes('Company Workspace v1.0 is complete and released.'), true);
  assert.equal(release.includes('Understand → Assess → Value → Decide Supportively → Record'), true);
});
