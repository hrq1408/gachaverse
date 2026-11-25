import type { GameRules } from '../domain/calculation';

export const starRail: GameRules = {
  id: 'honkai-star-rail', name: 'Honkai: Star Rail', currency: 'Jades Estelares', currencySingular: 'Jade Estelar', tickets: 'Passes Especiais', cost: 160,
  banners: [
    { id: 'personagem', label: 'Personagem', hardPity: 90, baseRate: 0.006 },
    { id: 'cone', label: 'Cone de Luz', hardPity: 80, baseRate: 0.008 },
  ],
};
