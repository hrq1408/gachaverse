'use client';

import { Children, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Locale } from '@/i18n/locales';

const copy = {
  'pt-BR': ['Buscar por título, categoria ou jogo', 'Limpar', 'artigo encontrado', 'artigos encontrados', 'Tente outro título ou o nome do jogo.'],
  en: ['Search by title, category, or game', 'Clear', 'guide found', 'guides found', 'Try another title or the game name.'],
  es: ['Busca por título, categoría o juego', 'Borrar', 'guía encontrada', 'guías encontradas', 'Prueba otro título o el nombre del juego.'],
} as const;

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

export function ArticleSearch({ terms, children, locale = 'pt-BR' }: { terms: string[]; children: ReactNode; locale?: Locale }) {
  const [label, clear, single, multiple, empty] = copy[locale];
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const words = normalize(query).trim().split(/\s+/);
  const cards = Children.toArray(children);
  const results = terms.map((term, i) => words.every((word) => normalize(term).includes(word)) ? cards[i] : null).filter(Boolean);
  return <>
    <label className="search-label" htmlFor="article-query">{label}</label>
    <div className="search-bar"><input id="article-query" type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
      <button type="button" onClick={() => setQuery('')} disabled={!query}>{clear}</button></div>
    <p className="my-4 text-slate-300" role="status">{results.length} {results.length === 1 ? single : multiple}</p>
    {results.length ? <div className="editorial-grid">{results}</div> : <p>{empty}</p>}
  </>;
}
