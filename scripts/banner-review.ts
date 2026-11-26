import { bannerStatus, type Banner } from '../src/content/banners';
import type { OfficialVideo } from './redemption-sources';

function compareVersion(a: string, b: string) {
  const [major, minor] = a.split('.').map(Number);
  const [otherMajor, otherMinor] = b.split('.').map(Number);
  return major - otherMajor || minor - otherMinor;
}

export function reviewBanners(catalog: Banner[], videos: OfficialVideo[], now: number) {
  const versionByGame = new Map<Banner['game'], string>();
  for (const banner of catalog) {
    const existing = versionByGame.get(banner.game);
    if (!existing || compareVersion(banner.version, existing) > 0) versionByGame.set(banner.game, banner.version);
  }
  const maximumAge = 21 * 86400000;
  const candidates = videos.flatMap(video => {
    const published = Date.parse(video.publishedAt);
    const version = /(?:version|versão)\s+(\d+\.\d+)/i.exec(video.title)?.[1];
    if (!version || !Number.isFinite(published) || published > now || now - published >= maximumAge ||
      !/special program|announcement|preview|programa especial|prévia|event warp|event wish|convene|signal search/i.test(video.title)) return [];
    if (compareVersion(version, versionByGame.get(video.game) ?? '0.0') <= 0) return [];
    return [{ game: video.game, version, source: 'https://www.youtube.com/watch?v=' + video.id }];
  });
  const expired = catalog.filter(banner => bannerStatus(banner, now) === 'Encerrado')
    .map(({ id, game, end, endTime }) => ({ id, game, end, endTime }));
  const uncovered = [...versionByGame.keys()].filter(game =>
    catalog.filter(banner => banner.game === game).every(banner => bannerStatus(banner, now) === 'Encerrado'));
  return {
    candidates: [...new Map(candidates.map(row => [row.source, row])).values()].sort((a, b) => a.source.localeCompare(b.source)),
    expired,
    uncovered,
  };
}
