import { createApp } from './bootstrap/createApp.js';
import { createApplicationShell } from './shell/index.js';
import { createWorkflowPlatform } from './workflow/index.js';
import { createProductModuleFramework } from './product/index.js';
import { createResearchModuleFoundation } from './product-modules/research/index.js';
import { createResearchIntelligenceFoundation } from './product-modules/research-intelligence/index.js';
import { createEvidenceGovernanceFoundation } from './evidence/index.js';
import { createMethodologyFrameworkFoundation } from './methodology-framework/index.js';
import { createCompanySecurityDomainFoundation } from './domain/company-security/index.js';
import { createValuationFrameworkFoundation } from './valuation-framework/index.js';
import { createValuationPluginFoundation } from './valuation-plugins/index.js';
import { createDCFPlugin } from './valuation-plugins/dcf/index.js';
import { createRelativeValuationPlugin } from './valuation-plugins/relative/index.js';
import { createValuationNormalization } from './valuation-normalization/index.js';
import { createScoringFramework } from './scoring-framework/index.js';
import { createRecommendationFramework } from './recommendation-framework/index.js';
import { createDecisionFramework } from './decision-framework/index.js';
import { createPortfolioFramework } from './portfolio-framework/index.js';
import { createExecutionFramework } from './execution-framework/index.js';
import { createIntegrationFramework } from './integration-framework/index.js';
import { createLiveReadiness } from './live-readiness/index.js';

export const app = createApp();
export const shellRuntime = createApplicationShell({ app });
export const workflowRuntime = createWorkflowPlatform({ app, shellRuntime });
export const productRuntime = createProductModuleFramework({ app, workflowRuntime });
export const researchRuntime = createResearchModuleFoundation({ app, productRuntime, workflowRuntime });
export const researchIntelligenceRuntime = createResearchIntelligenceFoundation({ app, researchRuntime });
export const evidenceRuntime = createEvidenceGovernanceFoundation({ app, researchIntelligenceRuntime });
export const methodologyRuntime = createMethodologyFrameworkFoundation({ app, evidenceRuntime });
export const companySecurityRuntime = createCompanySecurityDomainFoundation({ app, methodologyRuntime });
export const valuationRuntime = createValuationFrameworkFoundation({ app, companySecurityRuntime, methodologyRuntime, evidenceRuntime });
export const valuationPluginRuntime = createValuationPluginFoundation({ app, valuationRuntime });
export const dcfRuntime = createDCFPlugin({ app, valuationRuntime, valuationPluginRuntime });
export const relativeValuationRuntime = createRelativeValuationPlugin({ app, valuationRuntime, valuationPluginRuntime });
export const valuationNormalizationRuntime = createValuationNormalization({ app, dcfRuntime, relativeValuationRuntime });
export const scoringRuntime = createScoringFramework({ app, valuationNormalizationRuntime });
export const recommendationRuntime = createRecommendationFramework({ app, scoringRuntime });
export const decisionRuntime = createDecisionFramework({ app, recommendationRuntime });
export const portfolioRuntime = createPortfolioFramework({ app, decisionRuntime });
export const executionRuntime = createExecutionFramework({ app, portfolioRuntime });
export const integrationRuntime = createIntegrationFramework({ app, executionRuntime });
export const liveReadinessRuntime = createLiveReadiness({ app, integrationRuntime });

function renderShellView(view) {
  const content = view?.regions?.content?.content;
  const title = content?.title || content?.message || 'Application Shell';
  const status = view?.regions?.footer?.status || 'Ready';
  return `${view?.regions?.header?.title || 'IIPS v2.0'} — ${title} [${status}]`;
}

if (typeof document !== 'undefined') {
  const root = document.getElementById('root');
  if (root) {
    const result = shellRuntime.shell.start('/');
    root.textContent = renderShellView(result.view);
  }
}
