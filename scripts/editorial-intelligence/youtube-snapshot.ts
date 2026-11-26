import { z } from 'zod';
import { officialChannels, type OfficialVideo } from '../redemption-sources';

const game = z.enum(Object.keys(officialChannels) as [OfficialVideo['game'], ...OfficialVideo['game'][]]);
const video = z.object({ game, id: z.string().regex(/^[\w-]{11}$/), title: z.string().max(200),
  publishedAt: z.iso.datetime({ offset: true }) }).strict();
const schema = z.object({
  version: z.literal(1), collectedAt: z.iso.datetime(),
  videos: z.array(video).max(60), unavailableGames: z.array(game).max(4),
}).strict();

export function publicYoutubeSnapshot(announcements: OfficialVideo[], unavailableGames: OfficialVideo['game'][], now: Date) {
  const videos = [...new Map(announcements.filter(item => video.safeParse({
    game: item.game, id: item.id, title: item.title, publishedAt: item.publishedAt,
  }).success).map(({ game, id, title, publishedAt }) => [game + '/' + id, { game, id, title, publishedAt }])).values()];
  return schema.parse({ version: 1, collectedAt: now.toISOString(), videos, unavailableGames });
}

export function readYoutubeSnapshot(data: unknown, now: Date) {
  const result = schema.safeParse(data);
  if (!result.success) return null;
  const age = now.getTime() - Date.parse(result.data.collectedAt);
  if (age < 0 || age > 48 * 3_600_000) return null;
  return { announcements: result.data.videos.map(item => ({ ...item, description: '' })),
    failures: result.data.unavailableGames, collectedAt: result.data.collectedAt };
}
