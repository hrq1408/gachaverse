import type { RedemptionCode } from '../src/content/redemption';

export const officialChannels = {
  'honkai-star-rail': 'UC2PeMPA8PAOp-bynLoCeMLA',
  'genshin-impact': 'UCiS882YPwZt1NfaM0gR0D9Q',
  'zenless-zone-zero': 'UC2SpC8rL9LaeQriE4YNdyzA',
  'wuthering-waves': 'UC0Bi5KMcECRVYis5Gb_ZYZQ',
} as const;
type GameSlug = keyof typeof officialChannels;
type Evidence = { game: GameSlug; code: string; source: string; reward?: number; expiresAt?: string };
export type OfficialVideo = { game: GameSlug; id: string; title: string; description: string; publishedAt: string };

const currencies = {
  'honkai-star-rail': /stellar jades?|jades? estelares?/i,
  'genshin-impact': /primogems?|gemas? essenciais?/i,
  'zenless-zone-zero': /polychromes?|policromos?/i,
  'wuthering-waves': /astrites?/i,
};

function amount(game: GameSlug, line: string) {
  const name = currencies[game].source;
  const match = new RegExp('(?:^|\\s)(\\d+)\\s*(?:×|x)?\\s*(?:' + name + ')\\b|(?:' + name + ')\\s*(?:×|x|:)\\s*(\\d+)', 'i').exec(line);
  return match ? Number(match[1] ?? match[2]) : undefined;
}

export function extractFeed(xml: string, game: GameSlug): Evidence[] {
  return feedVideos(xml, game).flatMap(video => extractDescription(video.description, game, video.id));
}

function feedVideos(xml: string, game: GameSlug) {
  const videos: OfficialVideo[] = [];
  for (const [entry] of xml.matchAll(/<entry>[\s\S]*?<\/entry>/g)) {
    const video = /<yt:videoId>([\w-]{11})<\/yt:videoId>/.exec(entry)?.[1];
    const channel = /<yt:channelId>([\w-]+)<\/yt:channelId>/.exec(entry)?.[1];
    const description = /<media:description(?:\s[^>]*)?>([\s\S]*?)<\/media:description>/.exec(entry)?.[1];
    if (!video || channel !== officialChannels[game]) continue;
    const decode = (value: string) => value.replace(/&#(?:10|xA);/gi, '\n').replace(/&amp;/g, '&');
    videos.push({
      game, id: video,
      title: decode(/<title>([\s\S]*?)<\/title>/.exec(entry)?.[1] ?? ''),
      description: decode(description ?? ''),
      publishedAt: /<published>([^<]+)<\/published>/.exec(entry)?.[1] ?? '',
    });
  }
  return videos;
}

function extractDescription(description: string, game: GameSlug, video: string): Evidence[] {
    const findings: Evidence[] = [];
    const codes = [...description.matchAll(/^\s*(?:redemption|redeem|gift) code\s*[:：]\s*([A-Za-z0-9]{4,40})\b/gim)];
    for (const match of codes) {
      const context = codes.length === 1 ? description : match[0];
      const reward = amount(game, /^\s*rewards?\s*[:：]\s*(.+)$/im.exec(context)?.[1] ?? '');
      const candidate = /\b(?:until|expires(?:\s+at)?)\s+(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2}))/i.exec(context)?.[1];
      const expiresAt = candidate && Number.isFinite(Date.parse(candidate)) ? candidate : undefined;
      findings.push({game, code: match[1], source: 'https://www.youtube.com/watch?v=' + video, reward, expiresAt});
    }
  return findings;
}

export function compareEvidence(evidence: Evidence[], catalog: RedemptionCode[], now: number) {
  const candidates = [];
  const existing = new Map(catalog.map(item => [item.game + ':' + item.code.toUpperCase(), item]));
  for (const entry of evidence) {
    const current = existing.get(entry.game + ':' + entry.code.toUpperCase());
    if (!current && entry.expiresAt && Date.parse(entry.expiresAt) <= now) continue;
    const notes = [];
    if (!current) notes.push('Novo candidato');
    if (entry.expiresAt && (!current?.expiresAt || Date.parse(current.expiresAt) !== Date.parse(entry.expiresAt))) notes.push('Prazo diferente ou ainda não cadastrado');
    if (current && entry.reward !== undefined && !current.rewards.some(reward => amount(entry.game, reward) === entry.reward)) notes.push('Quantidade de moeda divergente ou ausente');
    if (notes.length) candidates.push({ ...entry, notes });
  }
  return candidates.sort((a,b) => (a.game+a.code+a.source).localeCompare(b.game+b.code+b.source));
}

export async function scanFeeds(apiOnly = false) {
  const evidence: Evidence[] = [];
  const announcements: OfficialVideo[] = [];
  const failures: GameSlug[] = [];
  const entries = Object.entries(officialChannels) as [GameSlug, string][];
  for (const [game, channel] of entries) {
    if (apiOnly) {
      failures.push(game);
      continue;
    }
    try {
      const response = await fetch('https://www.youtube.com/xml/feeds/videos.xml?channel_id=' + channel,
        { signal: AbortSignal.timeout(12000), redirect: 'error' });
      if (!response.ok) throw Error(String(response.status));
      const xml = await response.text();
      if (!xml.includes('<feed') || !xml.includes(channel)) throw Error('Feed inesperado');
      for (const video of feedVideos(xml, game)) {
        evidence.push(...extractDescription(video.description, game, video.id));
        announcements.push(video);
      }
    } catch {
      failures.push(game);
    }
  }
  const key = process.env.YOUTUBE_DATA_API_KEY;
  if (apiOnly && !key) throw Error('Cadastre o secret YOUTUBE_DATA_API_KEY antes de validar a API.');
  if (!key || !failures.length) return { evidence, failures, announcements };

  async function api(resource: string, params: Record<string,string>) {
    const url = new URL('https://www.googleapis.com/youtube/v3/' + resource);
    url.search = new URLSearchParams({ ...params, key: key! }).toString();
    const response = await fetch(url, { signal: AbortSignal.timeout(12000), redirect: 'error' });
    if (!response.ok) throw Error('API indisponível');
    return response.json();
  }
  try {
    const channels = await api('channels', { part: 'contentDetails', id: failures.map(game => officialChannels[game]).join(',') });
    for (const game of [...failures]) {
      try {
        const uploads = channels.items?.find((item: { id: string }) => item.id === officialChannels[game])?.contentDetails?.relatedPlaylists?.uploads;
        if (typeof uploads !== 'string' || !/^[\w-]+$/.test(uploads)) continue;
        const playlist = await api('playlistItems', { part: 'contentDetails', playlistId: uploads, maxResults: '15' });
        const ids = (playlist.items ?? []).map((item: { contentDetails?: { videoId?: string } }) => item.contentDetails?.videoId)
          .filter((id: unknown) => typeof id === 'string' && /^[\w-]{11}$/.test(id));
        if (ids.length) {
          const videos = await api('videos', { part: 'snippet', id: ids.join(',') });
          const before = announcements.length;
          for (const video of videos.items ?? []) {
            if (video.snippet?.channelId === officialChannels[game] && typeof video.snippet.description === 'string' &&
                typeof video.id === 'string' && /^[\w-]{11}$/.test(video.id)) {
              evidence.push(...extractDescription(video.snippet.description, game, video.id));
              announcements.push({ game, id: video.id, description: video.snippet.description,
                title: typeof video.snippet.title === 'string' ? video.snippet.title : '',
                publishedAt: typeof video.snippet.publishedAt === 'string' ? video.snippet.publishedAt : '' });
            }
          }
          if (apiOnly && announcements.length === before) continue;
        } else if (apiOnly) continue;
        failures.splice(failures.indexOf(game), 1);
      } catch { /* Preserve the feed failure in the report, without logging the API key. */ }
    }
  } catch { /* The primary feed failures remain visible. */ }
  if (apiOnly && failures.length) throw Error('A YouTube Data API não retornou vídeos oficiais para: ' + failures.join(', ') + '. Confira as restrições e a cota da chave.');
  return { evidence, failures, announcements };
}
