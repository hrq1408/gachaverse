import { SearchPage } from '@/components/search-page';
import { pageMetadata } from '@/lib/site';

const description = 'Encontre artigos publicados pelo GachaVerse.';
export const metadata = pageMetadata('Busca de artigos', description, '/busca/', false);

export default function Search() { return <SearchPage locale="pt-BR" />; }
