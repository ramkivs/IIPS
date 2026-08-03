import { SnapshotEngine } from '../../../../packages/snapshot-engine/src/index.js';
import { createResearchSnapshotManifest, RESEARCH_SNAPSHOT_SCHEMA_VERSION, deepFreeze } from './ResearchSnapshotSchema.js';

export class ResearchSnapshotGenerator {
  constructor({ snapshotStore } = {}) {
    this.snapshotStore = snapshotStore;
    this.snapshotEngine = new SnapshotEngine();
  }

  create(input) {
    const researchManifest = createResearchSnapshotManifest(input);
    const snapshot = this.snapshotEngine.createSnapshot({
      subject: { type: 'research-snapshot', id: researchManifest.company.companyId },
      timestamp: `${researchManifest.snapshotDate}T00:00:00.000Z`,
      methodology: { methodology_id: 'IIPS_RESEARCH_SNAPSHOT', version: researchManifest.engineVersion },
      data_version: RESEARCH_SNAPSHOT_SCHEMA_VERSION,
      provider_versions: researchManifest.source.providerVersions,
      certification_results: [{ status: 'SNAPSHOT_CREATED', schemaVersion: RESEARCH_SNAPSHOT_SCHEMA_VERSION }],
      platform_version: researchManifest.platformVersion,
      source_releases: researchManifest.source.sourceReleases,
      inputs: { researchManifest },
      outputs: {
        ticker: researchManifest.company.ticker,
        businessQuality: researchManifest.businessQuality.score,
        marginOfSafety: researchManifest.valuation.marginOfSafety,
        confidence: researchManifest.confidence.overall
      }
    });
    this.snapshotStore?.append?.(snapshot);
    return deepFreeze({ researchManifest, snapshot });
  }
}
