export function exportTable({ rows, format = 'CSV' } = {}) {
  if (!Array.isArray(rows)) throw new Error('Export rows must be an array');
  const headers = Object.keys(rows[0] || {});
  if (format === 'CSV') return [headers.join(','), ...rows.map(row => headers.map(header => JSON.stringify(row[header] ?? '')).join(','))].join('\n');
  if (format === 'Markdown') return [`| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`, ...rows.map(row => `| ${headers.map(header => row[header] ?? '').join(' | ')} |`)].join('\n');
  if (format === 'HTML') return `<table><thead><tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${headers.map(header => `<td>${row[header] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  return JSON.stringify({ format, rows }, null, 2);
}

export function createValidationReport({ execution }) {
  const rows = execution.queue.map(item => ({ company:item.company, ticker:item.ticker, status:item.status, warnings:item.warnings, errors:item.errors }));
  return Object.freeze({ reportId:`VREPORT_${execution.run.runId}`, type:'Validation Report', formats:['PDF','HTML','Markdown','CSV'], markdown: exportTable({ rows, format:'Markdown' }), summary: execution.summary });
}
