import React from 'react';
import type { PortfolioHealthDTO } from '../../contracts';
import { Grid, Card } from '../../design-system';

export function PortfolioHealthPanel({ portfolioHealth }: { portfolioHealth: PortfolioHealthDTO }) {
  const metrics = [
    ['Holdings', portfolioHealth.holdingsCount],
    ['Active Reviews', portfolioHealth.activeReviewCount],
    ['Coverage Items', portfolioHealth.coverageLedgerCount],
    ['Queue Health', portfolioHealth.queueHealth],
    ['Research Debt', portfolioHealth.researchDebt],
    ['Estimated Work', `${portfolioHealth.estimatedWorkMinutes} min`]
  ];
  return <section aria-label="Portfolio Health"><Grid columns={3}>{metrics.map(([label, value]) => <Card key={label}><span>{label}</span><strong>{value}</strong></Card>)}</Grid></section>;
}
