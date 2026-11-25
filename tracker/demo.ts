import type { Profile, Row } from './formats';
export const demo: Profile = {
  key: 'demo',
  rows: Array.from(
    { length: 144 },
    (_, i): Row => ({
      id: String(1000 + i),
      family: i % 4 === 0 ? '12' : '11',
      instant: new Date(Date.UTC(2026, 0, 1 + i)).toISOString(),
      rank: i % 43 === 0 ? '5' : i % 7 === 0 ? '4' : '3',
      name: 'Item demonstrativo ' + ((i % 7) + 1),
      featured: i % 43 === 0 ? i % 2 === 0 : undefined,
    }),
  ).reverse(),
};
