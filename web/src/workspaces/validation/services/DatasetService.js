import { createValidationDataset, normalizeCompany } from '../models/ValidationModels.js';

export function importDataset({ name, owner, rows }) {
  if (!Array.isArray(rows)) throw new Error('Dataset rows must be an array');
  return createValidationDataset({ name, owner, companies: rows.map(normalizeCompany) });
}

export function validateDataset(dataset) {
  const tickers = dataset.companies.map(company => company.ticker);
  const tickerCounts = tickers.reduce((map, ticker) => map.set(ticker, (map.get(ticker) || 0) + 1), new Map());
  const duplicates = [...tickerCounts.entries()].filter(([, count]) => count > 1).map(([ticker]) => ticker);
  const missingSymbols = dataset.companies.filter(company => !company.ticker).map(company => company.company);
  const invalidSymbols = dataset.companies.filter(company => company.ticker && !/^[A-Z0-9._-]{1,20}$/.test(company.ticker)).map(company => company.ticker);
  const sectorMix = countBy(dataset.companies, 'sector');
  const marketCapMix = countBy(dataset.companies, 'marketCap');
  const validationGroups = countBy(dataset.companies, 'validationGroup');
  return deepFreeze({
    datasetId: dataset.datasetId,
    companies: dataset.companies.length,
    duplicates,
    invalidSymbols,
    missingSymbols,
    sectorMix,
    marketCapMix,
    validationGroups,
    status: duplicates.length || invalidSymbols.length || missingSymbols.length ? 'WARNING' : 'PASS',
    supportsLargeDatasets: dataset.companies.length >= 100 && dataset.companies.length <= 500
  });
}

export function previewDataset(dataset) {
  const validation = validateDataset(dataset);
  return deepFreeze({ type:'dataset-preview', datasetId:dataset.datasetId, name:dataset.name, companies:validation.companies, duplicates:validation.duplicates.length, invalidSymbols:validation.invalidSymbols.length, missingSymbols:validation.missingSymbols.length, sectorMix:validation.sectorMix, marketCapMix:validation.marketCapMix, sample:dataset.companies.slice(0,10) });
}

function countBy(rows, key) { return Object.freeze(rows.reduce((acc, row) => ({ ...acc, [row[key]]:(acc[row[key]] || 0) + 1 }), {})); }
function deepFreeze(value) { if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) deepFreeze(child); } return value; }
