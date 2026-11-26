import { compareEvidence, extractFeed, officialChannels, scanFeeds } from '../scripts/redemption-sources';
import assert from 'node:assert/strict';
import test from 'node:test';
import { redemptionCodes, validateCodes } from '../src/content/redemption';
import { codeStatus } from '../src/lib/redemption-status';
import { games } from '../src/content/catalog';

const now = Date.parse('2026-11-26T12:00:00Z');
const entry = redemptionCodes.find(code => code.code === 'STARRAILGIFT')!;
test('cobre os quatro jogos e rejeita registros inseguros ou duplicados', () => {
  for (const game of games) assert.ok(redemptionCodes.some(code => code.game === game.slug));
  assert.throws(() => validateCodes([entry, { ...entry, code: entry.code.toLowerCase() }], now), /duplicado/);
  assert.throws(() => validateCodes([{ ...entry, verifiedOn: '2027-01-01' }], now), /futura/);
  assert.throws(() => validateCodes([{ ...entry, expiresAt: '2026-11-29T00:00:00' }], now));
  assert.throws(() => validateCodes([{ ...entry, sources: [{ ...entry.sources[0], url: 'http://example.org' }] }], now));
});
test('diferencia prazo desconhecido, prazo vigente, vencimento e revisão', () => {
  const timeLimited = redemptionCodes.find(code => code.code === 'ArchonsAnswers');
  assert.ok(timeLimited?.expiresAt);
  assert.equal(codeStatus(entry, now), 'sem-prazo');
  assert.equal(codeStatus(entry, Date.parse('2026-12-03T00:00:00Z')), 'revisao');
  assert.equal(codeStatus(timeLimited, now), 'no-prazo');
  assert.equal(codeStatus(timeLimited, Date.parse(timeLimited.expiresAt)), 'expirado');
});

test('a auditoria compara achados da fonte oficial sem editar o catálogo', () => {
  const game = 'genshin-impact';
  const channel = officialChannels[game];
  const video = '<entry><yt:videoId>Example1234</yt:videoId><yt:channelId>' + channel + '</yt:channelId>';
  const feed = (description: string) => '<feed>' + video + '<media:description>' + description + '</media:description></entry></feed>';
  assert.deepEqual(extractFeed(feed('Redemption code: EXAMPLE2026').replace(channel, 'outro'), game), []);
  const records = extractFeed(feed('Redemption Code: ArchonsAnswers&#10;Rewards: 42 Primogems&#10;Valid until 2026-12-01T00:00:00+08:00'), game);
  const proposals = compareEvidence(records, redemptionCodes, now);
  assert.equal(proposals.length, 1);
  assert.equal(proposals[0].notes.length, 2);
  assert.equal(compareEvidence(extractFeed(feed('Redemption code: ArchonsAnswers&#10;Rewards: 40 Primogems'), game), redemptionCodes, now).length, 0);
  assert.equal(compareEvidence(extractFeed(feed('Redemption code: EXAMPLE2026'), game), redemptionCodes, now)[0].notes[0], 'Novo candidato');
});

test('usa a API oficial como fallback após recusa dos feeds', async context => {
  const previous = process.env.YOUTUBE_DATA_API_KEY;
  process.env.YOUTUBE_DATA_API_KEY = 'fixture';
  context.after(() => {
    if (previous === undefined) delete process.env.YOUTUBE_DATA_API_KEY;
    else process.env.YOUTUBE_DATA_API_KEY = previous;
  });
  const calls: URL[] = [];
  context.mock.method(globalThis, 'fetch', async (input: URL | string) => {
    const url = new URL(input);
    calls.push(url);
    if (url.hostname === 'www.youtube.com') return new Response(null, { status: 403 });
    if (url.pathname.endsWith('/channels')) return Response.json({
      items: Object.values(officialChannels).map(id => ({ id, contentDetails: { relatedPlaylists: { uploads: id } } })),
    });
    if (url.pathname.endsWith('/playlistItems')) return Response.json({
      items: [{ contentDetails: { videoId: 'Example1234' } }],
    });
    return Response.json({ items: [{
      id: 'Example1234', snippet: { channelId: officialChannels['genshin-impact'], description: 'Redemption code: EXAMPLE2026' },
    }] });
  });
  const result = await scanFeeds();
  assert.deepEqual(result.failures, []);
  assert.equal(result.evidence.length, 1);
  assert.equal(result.evidence[0].game, 'genshin-impact');
  assert.equal(calls.filter(url => url.hostname === 'www.googleapis.com').length, 9);
  calls.length = 0;
  await assert.rejects(() => scanFeeds(true), /não retornou vídeos oficiais/);
  assert.equal(calls.every(url => url.hostname === 'www.googleapis.com'), true);
});

test('homologação manual exige chave e dados dos quatro canais sem consultar Atom', async context => {
  const previous = process.env.YOUTUBE_DATA_API_KEY;
  context.after(() => {
    if (previous === undefined) delete process.env.YOUTUBE_DATA_API_KEY;
    else process.env.YOUTUBE_DATA_API_KEY = previous;
  });
  delete process.env.YOUTUBE_DATA_API_KEY;
  await assert.rejects(() => scanFeeds(true), /YOUTUBE_DATA_API_KEY/);
  process.env.YOUTUBE_DATA_API_KEY = 'fixture';
  const channels = Object.values(officialChannels);
  const ids = channels.map((_, index) => 'Example123' + index);
  context.mock.method(globalThis, 'fetch', async (input: URL | string) => {
    const url = new URL(input);
    assert.equal(url.hostname, 'www.googleapis.com');
    if (url.pathname.endsWith('/channels')) {
      return Response.json({ items: channels.map(id => ({ id, contentDetails: { relatedPlaylists: { uploads: id } } })) });
    }
    if (url.pathname.endsWith('/playlistItems')) {
      return Response.json({ items: [{ contentDetails: { videoId: ids[channels.findIndex(id => id === url.searchParams.get('playlistId'))] } }] });
    }
    const id = url.searchParams.get('id')!;
    return Response.json({ items: [{ id, snippet: { channelId: channels[ids.indexOf(id)], description: '' } }] });
  });
  const result = await scanFeeds(true);
  assert.equal(result.announcements.length, 4);
  assert.deepEqual(result.failures, []);
});
