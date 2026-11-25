'use client';

import { Children, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

export function ArticleSearch({ terms, children }: { terms: string[]; children: ReactNode }) {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const words = normalize(query).trim().split(/\s+/);
  const cards = Children.toArray(children);
  const results = terms.map((term, i) => words.every((word) => normalize(term).includes(word)) ? cards[i] : null).filter(Boolean);
  return <>
    <label className="search-label" htmlFor="article-query">Buscar por título, categoria ou jogo</label>
    <div className="search-bar"><input id="article-query" type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
      <button type="button" onClick={() => setQuery('')} disabled={!query}>Limpar</button></div>
    <p className="my-4 text-slate-300" role="status">{results.length === 1 ? '1 artigo encontrado' : results.length + ' artigos encontrados'}</p>
    {results.length ? <div className="editorial-grid">{results}</div> : <p>Tente outro título ou o nome do jogo.</p>}
  </>;
}
