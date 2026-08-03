export function createEvidenceConfidence({ confidence = 'Medium', coverage = 0, rationale = '', evidenceItems = [], missingEvidence = [] } = {}) {
  if (!['High', 'Medium', 'Low', 'Unknown'].includes(confidence)) throw new Error(`Invalid evidence confidence: ${confidence}`);
  const normalizedCoverage = Math.max(0, Math.min(100, Number(coverage) || 0));
  return deepFreeze({
    component: 'EvidenceConfidence',
    confidence,
    coverage: normalizedCoverage,
    label: `Confidence: ${confidence}`,
    coverageLabel: `Evidence Coverage: ${normalizedCoverage}%`,
    rationale: rationale || 'Evidence confidence reflects how well this section is supported by available inputs. It is not an investment confidence score.',
    evidenceItems: freezeList(evidenceItems),
    missingEvidence: freezeList(missingEvidence),
    missingEvidenceChecklist: freezeList(missingEvidence).map((item, index) => createEvidenceChecklistItem(item, index)),
    notInvestmentConfidence: true
  });
}

function createEvidenceChecklistItem(item, index) {
  if (typeof item === 'string') {
    return Object.freeze({
      id: `missing-evidence-${index + 1}`,
      label: item,
      status: 'missing',
      sourceCount: 0,
      lastVerified: null,
      priority: 'Medium',
      complete: false
    });
  }
  const status = ['missing', 'partial', 'verified'].includes(item?.status) ? item.status : 'missing';
  return Object.freeze({
    id: item?.id || `missing-evidence-${index + 1}`,
    label: item?.label || item?.text || 'Missing evidence',
    status,
    sourceCount: Number.isFinite(Number(item?.sourceCount)) ? Number(item.sourceCount) : 0,
    lastVerified: item?.lastVerified || null,
    priority: item?.priority || 'Medium',
    complete: status === 'verified'
  });
}

function freezeList(value) {
  return Object.freeze([...(Array.isArray(value) ? value : [])]);
}

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}
