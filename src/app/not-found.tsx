import Link from 'next/link';
import { PageHeading } from '@/components/catalog';

export default function NotFound() {
  return <div className="shell interior">
    <PageHeading eyebrow="Erro 404" title="Página não encontrada" description="Explore o catálogo para continuar navegando pelo GachaVerse." />
    <Link href="/jogos/" className="button primary">Explorar jogos</Link>
  </div>;
}

