'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { emptyPlan, type GameRules, type Plan } from '../domain/calculation';
import { restore, updatePlan, type Snapshot } from '../domain/storage';

function createStore(game: GameRules) {
  const key = 'gachaverse:pity:v1:' + game.id;
  const initial = restore(null, game);
  let current = initial;
  let notify = () => {};
  function subscribe(listener: () => void) {
    notify = listener;
    function refresh() {
      try { current = restore(localStorage.getItem(key), game); } catch { /* Keep the in-memory plan. */ }
      notify();
    }
    function onStorage(event: StorageEvent) {
      if (event.key === key || event.key === null) refresh();
    }
    refresh();
    window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener('storage', onStorage); };
  }
  function save(next: Snapshot) {
    current = next;
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Continue in memory. */ }
    notify();
  }
  return { subscribe, save, snapshot: () => current, serverSnapshot: () => initial };
}

export function usePlan(game: GameRules) {
  const store = useMemo(() => createStore(game), [game]);
  const state = useSyncExternalStore(store.subscribe, store.snapshot, store.serverSnapshot);
  const banner = game.banners.find(b => b.id === state.selected)!;
  const plan = state.plans[banner.id];
  return { banner, plan,
    select: (selected: string) => store.save({ ...state, selected }),
    change: (patch: Partial<Plan>) => store.save(updatePlan(state, { ...plan, ...patch })),
    reset: () => store.save(updatePlan(state, emptyPlan())) };
}
