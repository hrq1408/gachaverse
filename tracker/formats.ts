import { z } from 'zod';
import { historySchema } from '../src/features/tracker/history';

export const families = {
  '1': 'Permanente',
  '2': 'Partida',
  '11': 'Personagem',
  '12': 'Cone de Luz',
  '21': 'Personagem de colaboração',
  '22': 'Cone de colaboração',
} as const;
const family = z.enum(['1', '2', '11', '12', '21', '22']);
const rank = z.enum(['3', '4', '5']);
const id = z.string().regex(/^\d{1,30}$/);
const text = z.string().min(1).max(200);
const localTime = z
  .string()
  .regex(/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/)
  .refine((s) => {
    const iso = s.replace(' ', 'T') + 'Z';
    return (
      Number.isFinite(Date.parse(iso)) && new Date(iso).toISOString().slice(0, 19) === iso.slice(0, 19)
    );
  });
const sourceRow = z.object({
  id,
  gacha_id: text,
  item_id: text,
  gacha_type: family,
  time: localTime,
  rank_type: rank.optional(),
  item_type: text.optional(),
  name: text.optional(),
  count: z.string().regex(/^[1-9]\d*$/).optional(),
});
const zone = z.number().min(-14).max(14);
const uid = z.union([z.string().regex(/^\d{1,20}$/), z.number().int().nonnegative()]).transform(String);
const nativeRow = z.object({
  id,
  family,
  instant: z.iso.datetime({ offset: true }),
  name: text.optional(),
  rank: rank.optional(),
  source: sourceRow.optional(),
  featured: z.boolean().optional(),
});
export type Row = z.infer<typeof nativeRow>;
const profile = z.object({
  key: text,
  uid: uid.optional(),
  timezone: zone.optional(),
  lang: text.optional(),
  rows: z.array(nativeRow),
});
export type Profile = z.infer<typeof profile>;
const languages = [
  'de-de',
  'en-us',
  'es-es',
  'fr-fr',
  'id-id',
  'it-it',
  'ja-jp',
  'ko-kr',
  'pt-pt',
  'ru-ru',
  'th-th',
  'tr-tr',
  'vi-vn',
  'zh-cn',
  'zh-tw',
] as const;
const account = z.object({
  uid,
  timezone: zone.int(),
  lang: z.enum(languages).optional(),
  list: z.array(sourceRow),
});
const uigf = z.object({
  info: z.object({
    version: z.enum(['v4.0', 'v4.1', 'v4.2']),
    export_app: text,
    export_app_version: text,
    export_timestamp: z.union([z.number().int(), z.string().regex(/^\d+$/)]),
  }),
  hkrpg: z.array(account).min(1),
});
const srgf = z.object({
  info: z.object({
    srgf_version: z.literal('v1.0'),
    uid: z.string().regex(/^\d+$/),
    lang: text,
    region_time_zone: zone,
  }),
  list: z.array(sourceRow),
});
export const fileLimit = 32 * 1024 * 1024;
export const formats = [
  'GachaVerse 2',
  'GachaVerse 1',
  'UIGF 4.2',
  'UIGF 4.1',
  'UIGF 4.0',
  'SRGF 1.0',
] as const;
export type Format = (typeof formats)[number];
function standardProfile(
  a: { uid: string; timezone: number; lang?: string; list: z.infer<typeof sourceRow>[] },
  legacy: boolean,
): Profile {
  const rows = a.list.map((source) => {
    if (legacy && ['21', '22'].includes(source.gacha_type))
      throw Error('Esta versão não representa banners de colaboração.');

    const instant = new Date(
      Date.parse(source.time.replace(' ', 'T') + 'Z') - a.timezone * 3600000,
    ).toISOString();
    return {
      id: source.id,
      family: source.gacha_type,
      instant,
      rank: source.rank_type,
      name: source.name,
      source,
    };
  });
  return { key: 'uid:' + a.uid, uid: a.uid, timezone: a.timezone, lang: a.lang, rows };
}

export function parseFile(
  input: unknown,
  localName = 'Local',
): { format: string; profiles: Profile[] } {
  if (!input || typeof input !== 'object') throw Error('Arquivo JSON incompatível.');
  if ('version' in input) {
    if (input.version === 2) {
      const data = z.object({ version: z.literal(2), profiles: z.array(profile).min(1) }).parse(input);
      for (const p of data.profiles) {
        if (p.uid ? p.key !== 'uid:' + p.uid : !p.key.startsWith('local:'))
          throw Error('Identificação de conta inconsistente.');
        for (const r of p.rows)
          if (r.source) {
            if (!p.uid || p.timezone === undefined) throw Error('Metadados de origem incompletos.');
            const original = standardProfile(
              { uid: p.uid, timezone: p.timezone, list: [r.source] },
              false,
            ).rows[0];
            if (
              r.id !== original.id ||
              r.family !== original.family ||
              r.rank !== original.rank ||
              r.name !== original.name ||
              Date.parse(r.instant) !== Date.parse(original.instant)
            )
              throw Error('Registro incompatível com a origem.');
          }
      }
      return { format: formats[0], profiles: merge([], data.profiles) };
    }
    const data = historySchema.parse(input);
    return {
      format: formats[1],
      profiles: merge(
        [],
        [
          {
            key: 'local:' + text.parse(localName.trim()),
            rows: data.saltos.map((r) => ({
              id: r.id,
              name: r.item,
              instant: r.data,
              family: r.banner === 'cone' ? '12' : '11',
              rank: String(r.estrelas) as Row['rank'],
            })),
          },
        ],
      ),
    };
  }
  if ('list' in input) {
    const { info, list } = srgf.parse(input);
    return {
      format: 'SRGF 1.0',
      profiles: merge(
        [],
        [
          standardProfile(
            { uid: info.uid, timezone: info.region_time_zone, lang: info.lang, list },
            true,
          ),
        ],
      ),
    };
  }
  const data = uigf.parse(input);
  if (data.info.version === 'v4.2' && data.hkrpg.some((a) => a.list.some((r) => r.id.length > 19)))
    throw Error('ID fora do padrão UIGF 4.2.');
  return {
    format: 'UIGF ' + data.info.version.slice(1),
    profiles: merge(
      [],
      data.hkrpg.map((a) => standardProfile(a, data.info.version === 'v4.0')),
    ),
  };
}

export function merge(old: Profile[], incoming: Profile[]): Profile[] {
  const accounts = new Map(old.map((p) => [p.key, p]));
  for (const p of incoming) {
    const previous = accounts.get(p.key);
    if (previous && previous.timezone !== p.timezone)
      throw Error('Fusos diferentes para a mesma conta. Revise o arquivo.');
    const rows = new Map(previous?.rows.map((r) => [r.id, r]));
    for (const r of p.rows) {
      const before = rows.get(r.id);
      if (
        before &&
        (before.family !== r.family ||
          Date.parse(before.instant) !== Date.parse(r.instant) ||
          (before.rank && r.rank && before.rank !== r.rank) ||
          (before.source &&
            r.source &&
            (before.source.item_id !== r.source.item_id ||
              before.source.gacha_id !== r.source.gacha_id)) ||
          (!before.source && before.name !== r.name) ||
          (before.featured !== undefined && r.featured !== undefined && before.featured !== r.featured))
      )
        throw Error('Registros conflitantes na mesma conta. A importação foi cancelada.');
      if (previous?.lang && p.lang && previous.lang !== p.lang)
        throw Error('Use o mesmo idioma de exportação para mesclar a conta.');
      const source = r.source && { ...before?.source, ...r.source };
      rows.set(r.id, {
        ...r,
        name: r.name ?? before?.name,
        rank: r.rank ?? before?.rank,
        source: source ?? before?.source,
        featured: r.featured ?? before?.featured,
      });
    }
    accounts.set(p.key, {
      ...p,
      lang: p.lang ?? previous?.lang,
      rows: [...rows.values()].sort(
        (a, b) =>
          Date.parse(b.instant) - Date.parse(a.instant) ||
          b.id.length - a.id.length ||
          b.id.localeCompare(a.id),
      ),
    });
  }
  return [...accounts.values()];
}
export function canExport(p: Profile, format: Format) {
  if (format === 'GachaVerse 2') return true;
  if (format === 'GachaVerse 1')
    return (
      p.rows.length > 0 &&
      p.rows.length <= 20000 &&
      p.rows.every(
        (r) =>
          ['11', '12'].includes(r.family) &&
          r.rank &&
          r.name &&
          r.name.length <= 100 &&
          /^[1-9]/.test(r.id),
      )
    );
  const legacy = format === 'SRGF 1.0' || format === 'UIGF 4.0';
  return (
    !!p.uid &&
    p.timezone !== undefined &&
    (format === 'SRGF 1.0'
      ? !!p.lang
      : Number.isInteger(p.timezone) && (!p.lang || languages.some((lang) => lang === p.lang))) &&
    p.rows.every(
      (r) =>
        r.source &&
        (!legacy || !['21', '22'].includes(r.family)) &&
        (format !== 'UIGF 4.2' || r.id.length <= 19),
    )
  );
}
export function encode(p: Profile, format: Format) {
  if (!canExport(p, format)) throw Error('Campos obrigatórios ausentes ou família incompatível.');
  if (format === 'GachaVerse 2') return { version: 2, profiles: [p] };
  if (format === 'GachaVerse 1')
    return {
      version: 1,
      saltos: p.rows.map((r) => ({
        id: r.id,
        banner: r.family === '11' ? 'personagem' : 'cone',
        item: r.name,
        data: r.instant,
        estrelas: Number(r.rank),
      })),
    };
  const info = {
    export_timestamp: Math.floor(Date.now() / 1000),
    export_app: 'GachaVerse',
    export_app_version: '2',
  };
  const list = p.rows.map((r) => r.source);
  if (format === 'SRGF 1.0')
    return {
      info: { ...info, srgf_version: 'v1.0', uid: p.uid, lang: p.lang, region_time_zone: p.timezone },
      list,
    };
  return {
    info: { ...info, version: 'v' + format.slice(5) },
    hkrpg: [{ uid: p.uid, timezone: p.timezone, lang: p.lang, list }],
  };
}
