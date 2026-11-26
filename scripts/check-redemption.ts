import { writeFile } from 'node:fs/promises';
import { redemptionCodes } from '../src/content/redemption';
import { codeStatus, reviewIntervalDays } from '../src/lib/redemption-status';
import { compareEvidence, scanFeeds } from './redemption-sources';
import { bannerAnnouncements, banners } from '../src/content/banners';
import { reviewBanners } from './banner-review';
import { publicYoutubeSnapshot } from './editorial-intelligence/youtube-snapshot';

const now = Date.now();
const rows = redemptionCodes.map(entry => ({ entry, status: codeStatus(entry, now) }));
const format = (heading: string, lines: string[]) => `### ${heading}\n\n${lines.length ? lines.join('\n') : 'Nenhum registro.'}`;
const expired = rows.filter(({ status }) => status === 'expirado')
  .map(({ entry }) => `- ${entry.game} / ${entry.code} · vencimento ${entry.expiresAt}`);
const review = rows.filter(({ status }) => status === 'revisao')
  .map(({ entry }) => `- ${entry.game} / ${entry.code} · última verificação ${entry.verifiedOn}`);
async function main() {
  const verifyApi = process.argv.includes('--verify-api');
  const apiOnly = verifyApi || process.argv.includes('--require-api');
  const feedCheck = apiOnly || process.argv.includes('--feeds') ? await scanFeeds(apiOnly) : undefined;
  const snapshotPath = process.env.EDITORIAL_YOUTUBE_SNAPSHOT_OUT;
  if (snapshotPath && feedCheck) {
    try {
      const snapshot = publicYoutubeSnapshot(feedCheck.announcements, feedCheck.failures, new Date());
      if (snapshot.videos.length) await writeFile(snapshotPath, JSON.stringify(snapshot) + '\n', { flag: 'wx' });
    } catch {
      console.warn('Snapshot público do YouTube indisponível. A auditoria do catálogo continua.');
    }
  }
  const candidates = compareEvidence(feedCheck?.evidence ?? [], redemptionCodes, now);
  const calendar = reviewBanners(banners, feedCheck?.announcements ?? [], now, bannerAnnouncements);
  const recentlyExpired = rows.filter(({ entry, status }) => status === 'expirado' &&
    entry.expiresAt && entry.expiresAt.slice(0, 10) >= entry.verifiedOn)
    .map(({ entry }) => ({ game: entry.game, code: entry.code, expiresAt: entry.expiresAt }));
  if (feedCheck && !verifyApi && process.env.REDEMPTION_PROPOSAL &&
      !feedCheck.failures.length && (candidates.length || recentlyExpired.length || calendar.candidates.length || calendar.expired.length)) {
    await writeFile(process.env.REDEMPTION_PROPOSAL, JSON.stringify({ candidates, recentlyExpired, calendar }, null, 2) + '\n');
  }
  console.log([
    '## Auditoria de códigos · ' + new Date(now).toISOString(),
    ...(apiOnly ? ['YouTube Data API confirmada para os quatro canais, com ' + (feedCheck?.announcements.length ?? 0) + ' vídeos públicos consultados.'] : []),
    format('Validade encerrada', expired),
    format('Revisar após ' + reviewIntervalDays + ' dias', review),
    format('Candidatos vindos dos canais oficiais', candidates.map(entry =>
      `- ${entry.game} / ${entry.code} · ${entry.notes.join(', ')} · ${entry.source}`)),
    format('Banners encerrados', calendar.expired.map(entry => `- ${entry.game} / ${entry.id} · ${entry.end} ${entry.endTime}`)),
    format('Jogos sem janela pendente', calendar.uncovered.map(game => '- ' + game)),
    format('Versões a conferir nos anúncios de banners', calendar.candidates.map(entry =>
      `- ${entry.game} / ${entry.version} / ${entry.event} · ${entry.sources.join(' · ')}`)),
    ...(feedCheck?.failures.length ? ['Feeds indisponíveis: ' + feedCheck.failures.join(', ') + '. Propostas automáticas suspensas nesta execução.'] : []),
    'Relatório de leitura. Nenhum código ou banner foi publicado, alterado ou testado em conta.',
  ].join('\n\n'));
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
