function csv(input: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  function endRow() {
    row.push(cell.trim());
    if (row.some(Boolean)) rows.push(row);
    row = [];
    cell = '';
  }
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '"') {
      if (quoted && input[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (quoted) cell += char;
    else if (char === ',') { row.push(cell.trim()); cell = ''; }
    else if (char === '\n') endRow();
    else if (char !== '\r') cell += char;
  }
  if (quoted) throw new Error('CSV do Google Trends com aspas incompletas.');
  endRow();
  return rows;
}

export function importTrends(input: string) {
  const rows = csv(input.replace(/^\uFEFF/, ''));
  const headerIndex = rows.findIndex(([period]) => /^(day|week|month|dia|semana|mês)$/i.test(period));
  if (headerIndex < 0) throw new Error('Exporte o gráfico Interesse ao longo do tempo do Google Trends.');
  const [, ...terms] = rows[headerIndex];
  if (!terms.length || terms.some(term => !/:\s*\((?:Brazil|Brasil)\)$/i.test(term)) ||
    new Set(terms.map(term => term.toLowerCase())).size !== terms.length) {
    throw new Error('Exporte séries distintas com a região Brasil no Google Trends.');
  }
  const periods = new Set<string>();
  const series = rows.slice(headerIndex + 1).map(([period, ...values]) => {
    const date = period.length === 7 ? period + '-01' : period;
    const parsed = new Date(date + 'T00:00:00Z');
    if (!/^\d{4}-\d{2}(?:-\d{2})?$/.test(period) || !Number.isFinite(parsed.getTime()) ||
        parsed.toISOString().slice(0, 10) !== date || periods.has(period) || values.length !== terms.length ||
        values.some(value => !/^(?:<1|100|[1-9]?\d)?$/.test(value))) {
      throw new Error('Linha ou índice inválido no CSV do Google Trends.');
    }
    periods.add(period);
    return { period, values: values.map(value => value === '<1' ? '<1' as const : value === '' ? null : Number(value)) };
  });
  if (!series.length) throw new Error('O CSV do Google Trends não contém uma série temporal.');
  return { source: 'Google Trends', region: 'BR', measure: 'interesse relativo (0–100)', terms, series };
}
