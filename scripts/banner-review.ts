import { bannerStatus, type Banner } from '../src/content/banners';
import type { OfficialVideo } from './redemption-sources';

function compareVersion(a: string, b: string) {
  const [major, minor] = a.split('.').map(Number);
  const [otherMajor, otherMinor] = b.split('.').map(Number);
  return major - otherMajor || minor - otherMinor;
}

function eventFor(title: string) {
  if (/special program|programa especial/i.test(title)) return 'programa-especial';
  const phase = /\b(?:phase|fase)\s+(iii|ii|iv|i|[1-9])\b/i.exec(title)?.[1]?.toLowerCase();
  if (phase) return 'fase-' + ({ i: '1', ii: '2', iii: '3', iv: '4' }[phase] ?? phase);
  if (/event warp|event wish|convene|signal search/i.test(title)) return 'anuncio-de-banner';
  if (/announcement|preview|prévia/i.test(title)) return 'previa-da-versao';
  return null;
}

export function reviewBanners(catalog: Banner[], videos: OfficialVideo[], now: number) {
  const versionByGame = new Map<Banner['game'], string>();
  for (const banner of catalog) {
    const existing = versionByGame.get(banner.game);
    if (!existing || compareVersion(banner.version, existing) > 0) versionByGame.set(banner.game, banner.version);
  }
  const maximumAge = 21 * 86400000;
  const candidates = new Map<string, { game: Banner['game']; version: string; event: string; sources: Set<string> }>();
  for (const video of videos) {
    const published = Date.parse(video.publishedAt);
    const version = /(?:version|versão)\s+(\d+\.\d+)/i.exec(video.title)?.[1];
    const event = eventFor(video.title);
    if (!version || !event || !Number.isFinite(published) || published > now || now - published >= maximumAge ||
      compareVersion(version, versionByGame.get(video.game) ?? '0.0') <= 0) continue;
    const key = [video.game, version, event].join('/');
    const candidate = candidates.get(key) ?? { game: video.game, version, event, sources: new Set<string>() };
    candidate.sources.add('https://www.youtube.com/watch?v=' + video.id);
    candidates.set(key, candidate);
  }
  const expired = catalog.filter(banner => bannerStatus(banner, now) === 'Encerrado')
    .map(({ id, game, end, endTime }) => ({ id, game, end, endTime }));
  const uncovered = [...versionByGame.keys()].filter(game =>
    catalog.filter(banner => banner.game === game).every(banner => bannerStatus(banner, now) === 'Encerrado'));
  return {
    candidates: [...candidates].sort(([a], [b]) => a.localeCompare(b))
      .map(([, row]) => ({ ...row, sources: [...row.sources].sort() })),
    expired,
    uncovered,
  };
}
