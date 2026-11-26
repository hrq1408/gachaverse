import { writeFile } from 'node:fs/promises';
import { redemptionCodes } from '../src/content/redemption';
import { codeStatus, reviewIntervalDays } from '../src/lib/redemption-status';
import { compareEvidence, scanFeeds } from './redemption-sources';

const now = Date.now();
const rows = redemptionCodes.map(entry => ({ entry, status: codeStatus(entry, now) }));
const format = (heading: string, lines: string[]) => `### ${heading}\n\n${lines.length ? lines.join('\n') : 'Nenhum registro.'}`;
const expired = rows.filter(({ status }) => status === 'expirado')
  .map(({ entry }) => `- ${entry.game} / ${entry.code} · vencimento ${entry.expiresAt}`);
const review = rows.filter(({ status }) => status === 'revisao')
  .map(({ entry }) => `- ${entry.game} / ${entry.code} · última verificação ${entry.verifiedOn}`);
async function main() {
  const feedCheck = process.argv.includes('--feeds') ? await scanFeeds() : undefined;
  const candidates = compareEvidence(feedCheck?.evidence ?? [], redemptionCodes, now);
  const recentlyExpired = rows.filter(({ entry, status }) => status === 'expirado' &&
    entry.expiresAt && entry.expiresAt.slice(0, 10) >= entry.verifiedOn)
    .map(({ entry }) => ({ game: entry.game, code: entry.code, expiresAt: entry.expiresAt }));
  if (feedCheck && process.env.REDEMPTION_PROPOSAL &&
      !feedCheck.failures.length && (candidates.length || recentlyExpired.length)) {
    await writeFile(process.env.REDEMPTION_PROPOSAL, JSON.stringify({ candidates, recentlyExpired }, null, 2) + '\n');
}
  console.log([
    '## Auditoria de códigos · ' + new Date(now).toISOString(),
    format('Validade encerrada', expired),
    format('Revisar após ' + reviewIntervalDays + ' dias', review),
    format('Candidatos vindos dos canais oficiais', candidates.map(entry =>
      `- ${entry.game} / ${entry.code} · ${entry.notes.join(', ')} · ${entry.source}`)),
    ...(feedCheck?.failures.length ? ['Feeds indisponíveis: ' + feedCheck.failures.join(', ') + '. Propostas automáticas suspensas nesta execução.'] : []),
    'Relatório de leitura. Nenhum código foi criado, testado em conta ou alterado.',
  ].join('\n\n'));
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
