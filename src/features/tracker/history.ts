import { z } from 'zod';

export const historySchema = z.object({
  version: z.literal(1),
  saltos: z.array(z.object({
    id: z.string().regex(/^[1-9]\d{0,29}$/),
    banner: z.enum(['personagem', 'cone']),
    item: z.string().trim().min(1).max(100),
    estrelas: z.union([z.literal(3), z.literal(4), z.literal(5)]),
    data: z.iso.datetime({ offset: true }),
  }).strict()).min(1).max(20000),
}).strict();

export type Warp = z.infer<typeof historySchema>['saltos'][number];
export function mergeHistory(existing: Warp[], incoming: Warp[]) {
  const rows = new Map(existing.map(row => [row.id,row]));
  for (const row of incoming) {
    const prev = rows.get(row.id);
    if (prev && (prev.banner !== row.banner || prev.item !== row.item || prev.estrelas !== row.estrelas || Date.parse(prev.data) !== Date.parse(row.data))) {
      throw new Error('Um ID tem informações conflitantes. Confira se o arquivo pertence ao mesmo histórico.');
    }
    rows.set(row.id,row);
  }
  return Array.from(rows.values()).sort((a,b) => Date.parse(b.data)-Date.parse(a.data) || b.id.length-a.id.length || b.id.localeCompare(a.id));
}
